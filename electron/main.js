import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (process.platform === 'win32') {
  // eslint-disable-next-line global-require
  if (process.argv.includes('--squirrel-firstrun')) app.quit();
}

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    title: 'AssetGuard Desktop',
    backgroundColor: '#0f172a', // Matches slate-900
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Simplifying for this example; use preload in strict production
      webSecurity: false // sometimes needed for local asset loading in dev
    },
    autoHideMenuBar: true, // Hides the ugly file menu
  });

  // Check if we are in development mode
  const isDev = !app.isPackaged;

  if (isDev) {
    // Load local vite server
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools for debugging
    // mainWindow.webContents.openDevTools();
  } else {
    // Load built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});