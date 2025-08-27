const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

let mainWindow;
let serverProcess;

// Create user data directory for the app
const userDataPath = path.join(os.homedir(), '.wsm-oe-manager');
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

// Set user data path for Electron
app.setPath('userData', userDataPath);

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'electron-preload.js'),
    },
    icon: path.join(__dirname, 'assets', 'icon.png'), // Add app icon if available
    titleBarStyle: 'default',
    show: false, // Don't show until ready
  });

  // Create application menu
  const template = [
    {
      label: 'File',
      submenu: [
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
        { role: 'paste' }
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
          label: 'About WSM OE Manager',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About',
              message: 'WSM Operational Excellence Manager',
              detail: 'A comprehensive application for managing operational excellence processes.\n\nVersion: 1.0.0'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Start the server process
  startServer().then(() => {
    // Load the app
    if (isDev) {
      mainWindow.loadURL('http://localhost:5000');
      // Open DevTools in development
      mainWindow.webContents.openDevTools();
    } else {
      mainWindow.loadURL('http://localhost:5000');
    }

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
      
      // Focus on macOS
      if (process.platform === 'darwin') {
        app.focus();
      }
    });
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
    // Kill server process
    if (serverProcess) {
      serverProcess.kill();
    }
  });
}

function startServer() {
  return new Promise((resolve, reject) => {
    if (isDev) {
      // In development, assume server is already running
      setTimeout(resolve, 1000);
      return;
    }

    // In production, start the bundled server
    const serverPath = path.join(__dirname, 'dist', 'server', 'index.js');
    
    serverProcess = spawn('node', [serverPath], {
      cwd: __dirname,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: '5000',
        DATABASE_URL: `sqlite://${path.join(userDataPath, 'wsm-oe.db')}`,
        SESSION_SECRET: 'wsm-oe-desktop-secret-key-' + Math.random().toString(36).substring(7)
      }
    });

    serverProcess.stdout.on('data', (data) => {
      console.log(`Server: ${data}`);
      if (data.toString().includes('serving on port 5000')) {
        setTimeout(resolve, 500); // Give server a moment to fully start
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`Server Error: ${data}`);
    });

    serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
      if (code !== 0 && mainWindow) {
        dialog.showErrorBox('Server Error', 'The application server has stopped unexpectedly.');
      }
    });

    // Timeout fallback
    setTimeout(() => {
      resolve();
    }, 5000);
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
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

// Handle app certificate errors
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (url.startsWith('https://localhost') || url.startsWith('https://127.0.0.1')) {
    // Allow self-signed certificates for local server
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});

// Prevent navigation to external websites
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:5000') {
      event.preventDefault();
    }
  });
});