const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  runLabelGenerator: (userData) => ipcRenderer.invoke('run-label-generator', userData),
  parseCsv: (filePath) => ipcRenderer.invoke('parse-csv', filePath)
});
