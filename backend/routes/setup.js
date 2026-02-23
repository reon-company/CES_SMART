const express = require('express');
const path = require('path');
const { execFile } = require('child_process');

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
