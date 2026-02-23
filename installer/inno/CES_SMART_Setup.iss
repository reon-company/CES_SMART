#define MyAppName "CES SmartFarm"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "CES"
#define MyAppExeName "installer\\windows\\start_all.bat"

[Setup]
AppId={{A2D5DA08-DCAD-4E3B-8A38-4FD5A6400E71}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\CES_SMART
DefaultGroupName=CES SmartFarm
AllowNoIcons=yes
LicenseFile=..\..\README.md
OutputDir=..\..\dist
OutputBaseFilename=CES_SMART_Installer
Compression=lzma
SolidCompression=yes
WizardStyle=modern
ArchitecturesInstallIn64BitMode=x64compatible
PrivilegesRequired=admin

[Languages]
Name: "korean"; MessagesFile: "compiler:Languages\Korean.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "runinstall"; Description: "설치 후 의존성 설치 스크립트 실행 (npm install)"; Flags: checkedonce

[Files]
Source: "..\..\README.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\INSTALL_MIGRATION_KO.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\deploy.sh"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "..\..\arduino-r4\*"; DestDir: "{app}\arduino-r4"; Flags: recursesubdirs createallsubdirs ignoreversion
Source: "..\..\backend\*"; DestDir: "{app}\backend"; Flags: recursesubdirs createallsubdirs ignoreversion; Excludes: "logs\*;*.pem;*.key;*.p12;*.log"
Source: "..\..\CES_CAMERA\*"; DestDir: "{app}\CES_CAMERA"; Flags: recursesubdirs createallsubdirs ignoreversion
Source: "..\..\frontend\*"; DestDir: "{app}\frontend"; Flags: recursesubdirs createallsubdirs ignoreversion; Excludes: "node_modules\*;.next\*;*.log"
Source: "..\..\installer\*"; DestDir: "{app}\installer"; Flags: recursesubdirs createallsubdirs ignoreversion

[Icons]
Name: "{group}\CES SmartFarm 실행"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\로컬 설치 실행"; Filename: "{app}\installer\windows\install_local.bat"
Name: "{group}\설치 가이드"; Filename: "{app}\INSTALL_MIGRATION_KO.md"
Name: "{autodesktop}\CES SmartFarm 실행"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\installer\windows\install_local.bat"; Description: "의존성/환경 템플릿 자동 설치 실행"; Flags: postinstall skipifsilent; Tasks: runinstall
Filename: "{app}\{#MyAppExeName}"; Description: "CES SmartFarm 실행"; Flags: postinstall nowait skipifsilent unchecked

[Code]
function InitializeSetup(): Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
  if not Exec('cmd.exe', '/c where node', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    MsgBox('Node.js가 설치되어 있지 않습니다.'#13#10 +
           '설치 후 다시 실행하세요: https://nodejs.org/', mbError, MB_OK);
    Result := False;
  end;
end;
