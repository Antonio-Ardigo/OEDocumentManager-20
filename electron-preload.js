const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // File operations
  selectFile: (options) => ipcRenderer.invoke('select-file', options),
  saveFile: (options) => ipcRenderer.invoke('save-file', options),
  
  // System operations
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  
  // App control
  quit: () => ipcRenderer.invoke('quit-app'),
  minimize: () => ipcRenderer.invoke('minimize-window'),
  maximize: () => ipcRenderer.invoke('maximize-window'),
  close: () => ipcRenderer.invoke('close-window'),
  
  // Theme and preferences
  setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),
  getTheme: () => ipcRenderer.invoke('get-theme'),
  
  // Database operations (if needed)
  backupDatabase: () => ipcRenderer.invoke('backup-database'),
  restoreDatabase: (filePath) => ipcRenderer.invoke('restore-database', filePath),
  
  // Listen to main process events
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Security: Remove Node.js globals
delete window.require;
delete window.exports;
delete window.module;

// Add desktop app identifier
window.isElectron = true;
window.appVersion = process.env.npm_package_version || '1.0.0';

// Disable context menu in production
if (process.env.NODE_ENV === 'production') {
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
}