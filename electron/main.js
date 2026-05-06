// electron/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;
let backendProcess = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: "إدارة العلاقات العامة والأمن",
    backgroundColor: '#0a0f1c',        // نفس لون الثيم الداكن
    icon: path.join(__dirname, '../assets/icon.ico'), // لو عندك أيقونة
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      spellcheck: false,               // يحسن أداء الكتابة
    },
    show: false,                       // لا تظهر قبل أن تكون جاهزة
  });

  // حلول مهمة لمشكلة تجميد الـ Input والكتابة
  mainWindow.webContents.setVisualZoomLevelLimits(1, 1);
  
  // فتح DevTools فقط في وضع التطوير (Development)
  if (isDev) {
    mainWindow.webContents.openDevTools();
    console.log('🚀 Development mode → Loading http://192.168.1.172:3000');
    mainWindow.loadURL('http://192.168.1.172:3000');
  } 
  else {
    // Production Mode
    const indexPath = path.join(__dirname, '../frontend/build/index.html');
    
    console.log('📂 Production: Trying to load index.html from:', indexPath);
    console.log('📁 Does index.html exist?', fs.existsSync(indexPath));

    mainWindow.loadFile(indexPath)
      .then(() => {
        console.log('✅ index.html loaded successfully in production');
      })
      .catch((err) => {
        console.error('❌ Failed to load index.html');
        console.error('Error:', err.message);
      });
  }

  // إظهار النافذة بعد تحميل المحتوى
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.focus();     // مهم لحل مشاكل الـ focus
  });

  // مراقبة أخطاء التحميل
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('❌ did-fail-load:', errorDescription);
    console.error('URL:', validatedURL);
  });

  mainWindow.webContents.on('render-process-gone', (event, details) => {
    if (details.reason === 'crashed') {
      console.error('Renderer process crashed!');
    }
  });
}

// ====================== Backend Server ======================
function startBackend() {
  let backendPath;
  let cwd;

  if (isDev) {
    backendPath = path.join(__dirname, '../backend/index.js');
    cwd = path.join(__dirname, '../backend');
  } else {
    const resourcesPath = process.resourcesPath || path.join(app.getAppPath(), '..');
    backendPath = path.join(resourcesPath, 'backend', 'index.js');
    cwd = path.join(resourcesPath, 'backend');
  }

  if (!fs.existsSync(backendPath)) {
    console.error('❌ CRITICAL ERROR: Backend file not found!');
    console.error('Expected path:', backendPath);
    return;
  }

  console.log(`🚀 Starting backend from: ${backendPath}`);

  backendProcess = spawn('node', [backendPath], {
    cwd: cwd,
    env: {
      ...process.env,
      PORT: '5000',
      NODE_ENV: 'production'
    },
    stdio: 'pipe'
  });

  backendProcess.stdout.on('data', (data) => {
    console.log('[Backend]', data.toString().trim());
  });

  backendProcess.stderr.on('data', (data) => {
    console.error('[Backend Error]', data.toString().trim());
  });

  backendProcess.on('error', (err) => {
    console.error('❌ Backend Spawn Error:', err.message);
  });

  backendProcess.on('exit', (code, signal) => {
    console.log(`Backend exited with code ${code} signal ${signal}`);
  });
}

function stopBackend() {
  if (backendProcess && !backendProcess.killed) {
    console.log('🛑 Stopping backend...');
    backendProcess.kill();
    backendProcess = null;
  }
}

// ====================== App Events ======================
app.whenReady().then(() => {
  startBackend();
  
  // تأخير بسيط لإعطاء الـ backend وقت للتشغيل
  setTimeout(() => {
    createWindow();
  }, isDev ? 800 : 1200);
});

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopBackend();
});

app.on('quit', () => {
  stopBackend();
});