const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const dotenv = require('dotenv');
const { nativeTheme } = require('electron');

//Configure dotenv to work in both development and production
const envPath = path.join(process.resourcesPath, '.env');
const devEnvPath = path.join(__dirname, '.env');

//Try to load from production path first, fallback to development
try {
  dotenv.config({ path: fs.existsSync(envPath) ? envPath : devEnvPath });
} catch (error) {
  console.warn('Could not load .env file:', error.message);
}

const { runPuppeteerWithData } = require('./backend');

function createWindow() {
  //Forces light theme for the application regardless of the system's theme preference
  nativeTheme.themeSource = 'light';

  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    title: 'Elta Shipping Label Generator',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    }
  });

  //win.webContents.openDevTools();

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});


//🟡 IPC: Run Puppeteer after all data collected
ipcMain.handle('run-label-generator', async (event, userData) => {
  try {
    await runPuppeteerWithData(userData);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});


//🟢 IPC: Parse CSV to extract unique product names
ipcMain.handle('parse-csv', async (event, filePath) => {
  return new Promise((resolve, reject) => {
    const uniqueProducts = new Set();

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        const items = data['Items'].split(';');
        items.forEach((item) => {
          const match = item.match(/product_name:([^|]+)/);
          if (match && match[1]) {
            uniqueProducts.add(match[1].trim());
          }
        });
      })
      .on('end', () => {
        resolve([...uniqueProducts]);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
});
