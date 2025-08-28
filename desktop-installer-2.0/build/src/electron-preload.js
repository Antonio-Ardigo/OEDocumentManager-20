
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getAppInfo: () => ({
    name: 'WSM OE Manager',
    version: '2.0.0',
    platform: process.platform
  }),
  
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  
  // File operations (if needed in the future)
  openFile: () => ipcRenderer.invoke('dialog-open-file'),
  saveFile: (data) => ipcRenderer.invoke('dialog-save-file', data),
  
  // System information
  getSystemInfo: () => ipcRenderer.invoke('get-system-info')
});

// DOM ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('WSM OE Manager v2.0.0 - Desktop Application Ready');
});
