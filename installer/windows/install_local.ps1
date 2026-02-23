param(
    [switch]$SkipNpmInstall
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..\..")
$backendDir = Join-Path $repoRoot "backend"
$frontendDir = Join-Path $repoRoot "frontend"

function Write-Step($msg) {
    Write-Host ""
    Write-Host "== $msg ==" -ForegroundColor Cyan
}

function Assert-Command($name) {
    if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
        throw "'$name' 명령을 찾을 수 없습니다. 먼저 설치해주세요."
    }
}

function Copy-IfMissing($from, $to) {
    if (-not (Test-Path $to)) {
        Copy-Item -Path $from -Destination $to
        Write-Host "생성됨: $to" -ForegroundColor Green
    } else {
        Write-Host "유지됨: $to" -ForegroundColor DarkGray
    }
}

Write-Host "CES SmartFarm 로컬 설치 시작" -ForegroundColor Green
Write-Host "경로: $repoRoot"

Write-Step "필수 도구 확인"
Assert-Command "node"
Assert-Command "npm"
node -v
npm -v

Write-Step "환경파일 템플릿 생성"
Copy-IfMissing (Join-Path $backendDir ".env.example") (Join-Path $backendDir ".env")
Copy-IfMissing (Join-Path $frontendDir ".env.local.example") (Join-Path $frontendDir ".env.local")

if (-not $SkipNpmInstall) {
    Write-Step "백엔드 의존성 설치"
    Push-Location $backendDir
    npm install
    Pop-Location

    Write-Step "프론트엔드 의존성 설치"
    Push-Location $frontendDir
    npm install
    Pop-Location
} else {
    Write-Step "npm install 단계 건너뜀"
}

Write-Step "다음 단계"
Write-Host "1) backend\.env 값을 환경에 맞게 수정" -ForegroundColor Yellow
Write-Host "2) DB 스키마 적용: backend\database\schema.sql" -ForegroundColor Yellow
Write-Host "3) 실행: installer\windows\start_all.bat" -ForegroundColor Yellow

Write-Host ""
Write-Host "설치 완료" -ForegroundColor Green
