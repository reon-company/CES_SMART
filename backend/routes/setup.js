const express = require('express');
const path = require('path');
const { execFile } = require('child_process');

// 유지보수 메모:
// setup 엔드포인트는 설치 프로그램 제공 및 서버 측 검증 자동화를 위해 존재합니다.
// setup UI가 이 페이로드를 직접 사용하므로 응답 스키마를 안정적으로 유지하세요.
const router = express.Router();

const INSTALLER_FILE = 'CES_SMART_Installer.exe';
const INSTALLER_RELATIVE_PATH = path.join('public', 'downloads', INSTALLER_FILE);

router.get('/installer', (req, res) => {
  const installerPath = path.join(__dirname, '..', INSTALLER_RELATIVE_PATH);
  const fs = require('fs');

  if (!fs.existsSync(installerPath)) {
    return res.status(404).json({
      success: false,
      message: 'Installer file not found on server',
      expectedPath: '/downloads/CES_SMART_Installer.exe',
    });
  }

  const stats = fs.statSync(installerPath);
  return res.json({
    success: true,
    filename: INSTALLER_FILE,
    downloadUrl: '/downloads/CES_SMART_Installer.exe',
    sizeBytes: stats.size,
    updatedAt: stats.mtime,
  });
});

router.get('/verify', (req, res) => {
  const scriptPath = path.join(__dirname, '..', 'scripts', 'verify_setup.sh');

  execFile('bash', [scriptPath], { timeout: 20000 }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Setup verification failed',
        code: error.code,
        stdout: stdout || '',
        stderr: stderr || '',
      });
    }

    return res.json({
      success: true,
      message: 'Setup verification completed',
      stdout: stdout || '',
      stderr: stderr || '',
    });
  });
});

module.exports = router;
