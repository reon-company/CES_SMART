param(
    [string]$CameraSource = "192.168.1.13",
    [string]$ListenAddress = "0.0.0.0",
    [int]$ListenPort = 81,
    [int]$ConnectPort = 81,
    [int]$CheckIntervalSec = 30,
    [switch]$Continuous,
    [switch]$SkipFirewall
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Test-IsAdmin {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Resolve-CameraIp {
    param([string]$Source)

    if ($Source -match '^\d{1,3}(\.\d{1,3}){3}$') {
        return $Source
    }

    try {
        $record = Resolve-DnsName -Name $Source -Type A -ErrorAction Stop |
            Where-Object { $_.IPAddress -match '^\d{1,3}(\.\d{1,3}){3}$' } |
            Select-Object -First 1
        if ($record) { return $record.IPAddress }
    } catch {
        # fallback below
    }

    try {
        $ping = ping -4 -n 1 $Source 2>$null
        $line = $ping | Where-Object { $_ -match '\[(\d{1,3}(?:\.\d{1,3}){3})\]' } | Select-Object -First 1
        if ($line) {
            $match = [regex]::Match($line, '\[(\d{1,3}(?:\.\d{1,3}){3})\]')
            if ($match.Success) { return $match.Groups[1].Value }
        }
    } catch {
        # ignore
    }

    return $null
}

function Get-PortProxyTarget {
    param(
        [string]$TargetListenAddress,
        [int]$TargetListenPort
    )

    $output = netsh interface portproxy show all
    foreach ($line in $output) {
        if ($line -match '^\s*(\S+)\s+(\d+)\s+(\S+)\s+(\d+)\s*$') {
            $listenAddr = $matches[1]
            $listenPort = [int]$matches[2]
            $connectAddr = $matches[3]
            if ($listenAddr -eq $TargetListenAddress -and $listenPort -eq $TargetListenPort) {
                return $connectAddr
            }
        }
    }
    return $null
}

function Set-PortProxyRule {
    param(
        [string]$TargetListenAddress,
        [int]$TargetListenPort,
        [string]$TargetConnectAddress,
        [int]$TargetConnectPort
    )

    netsh interface portproxy delete v4tov4 listenport=$TargetListenPort listenaddress=$TargetListenAddress 2>$null | Out-Null
    netsh interface portproxy add v4tov4 listenport=$TargetListenPort listenaddress=$TargetListenAddress connectport=$TargetConnectPort connectaddress=$TargetConnectAddress | Out-Null

    if ($LASTEXITCODE -ne 0) {
        throw "portproxy 설정 실패: listen=${TargetListenAddress}:${TargetListenPort} -> connect=${TargetConnectAddress}:${TargetConnectPort}"
    }
}

function Set-FirewallRule {
    param(
        [int]$Port
    )

    $ruleName = "ESP32-CAM Auto Proxy $Port"
    $existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
    if (-not $existing) {
        New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -LocalPort $Port -Protocol TCP -Action Allow | Out-Null
    }
}

if (-not (Test-IsAdmin)) {
    Write-Host "오류: 관리자 권한 PowerShell에서 실행해야 합니다." -ForegroundColor Red
    exit 1
}

if (-not $SkipFirewall) {
    Set-FirewallRule -Port $ListenPort
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "ESP32-CAM 자동 portproxy 감지/적용" -ForegroundColor Cyan
Write-Host "CameraSource : $CameraSource" -ForegroundColor White
Write-Host "Listen       : ${ListenAddress}:${ListenPort}" -ForegroundColor White
Write-Host "ConnectPort  : $ConnectPort" -ForegroundColor White
Write-Host "Continuous   : $Continuous" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan

do {
    $resolvedIp = Resolve-CameraIp -Source $CameraSource
    if (-not $resolvedIp) {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 카메라 IP 해석 실패: $CameraSource" -ForegroundColor Yellow
    } else {
        $currentTarget = Get-PortProxyTarget -TargetListenAddress $ListenAddress -TargetListenPort $ListenPort
        if ($currentTarget -ne $resolvedIp) {
            Set-PortProxyRule -TargetListenAddress $ListenAddress -TargetListenPort $ListenPort -TargetConnectAddress $resolvedIp -TargetConnectPort $ConnectPort
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 업데이트: ${ListenAddress}:${ListenPort} -> ${resolvedIp}:${ConnectPort}" -ForegroundColor Green
        } else {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 유지: ${ListenAddress}:${ListenPort} -> ${resolvedIp}:${ConnectPort}" -ForegroundColor DarkGray
        }
    }

    if ($Continuous) {
        Start-Sleep -Seconds $CheckIntervalSec
    }
} while ($Continuous)

Write-Host ""
Write-Host "현재 portproxy 설정:" -ForegroundColor Cyan
netsh interface portproxy show all
