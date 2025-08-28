
const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

let mainWindow;
let serverProcess;

// Set application name and version
app.setName('WSM OE Manager');
app.setVersion('2.0.0');

// Create user data directory
const userDataPath = path.join(os.homedir(), '.wsm-oe-manager-v2');
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

// Set custom user data path
app.setPath('userData', userDataPath);

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createWindow);
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'electron-preload.js'),
    },
    icon: path.join(__dirname, '..', 'resources', 'icon.png'),
    titleBarStyle: 'default',
    show: false,
    autoHideMenuBar: false,
  });

  // Set window title
  mainWindow.setTitle('WSM OE Manager v2.0.0');

  // Create application menu
  createApplicationMenu();

  // Start the Express server
  startServer();

  // Handle window events
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Load the application after server starts
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:5000');
    }, 2000);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function startServer() {
  const serverPath = path.join(__dirname, 'server', 'index.js');
  const isDev = !app.isPackaged;
  
  serverProcess = spawn('node', [serverPath], {
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: '5000',
      ELECTRON_USER_DATA: userDataPath,
      DATABASE_URL: `sqlite://${path.join(userDataPath, 'wsm-oe.db')}`,
      SESSION_SECRET: 'wsm-oe-desktop-v2-' + Math.random().toString(36).substring(7)
    },
    stdio: isDev ? 'inherit' : 'pipe'
  });

  serverProcess.on('error', (error) => {
    console.error('Server process error:', error);
    dialog.showErrorBox('Server Error', 'Failed to start application server: ' + error.message);
  });

  serverProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error('Server process exited with code:', code);
    }
  });
}

function createApplicationMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'About WSM OE Manager',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About',
              message: 'WSM OE Manager',
              detail: `Version: 2.0.0\n\nA comprehensive application for managing operational excellence processes.\n\n© 2025 WSM Operational Excellence Team`
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'actualSize' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'User Guide',
          click: () => {
            shell.openExternal('https://github.com/your-org/wsm-oe-manager/wiki');
          }
        },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/your-org/wsm-oe-manager/issues');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});
