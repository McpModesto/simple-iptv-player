const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

/** @type {BrowserWindow | null} */
let mainWindow = null;
/** @type {BrowserWindow | null} */
let aboutWindow = null;
/** @type {'es' | 'en'} */
let currentLang = 'es';

const MENU_LABELS = {
  es: {
    file: 'Archivo',
    addPlaylist: 'Añadir Playlist',
    exit: 'Salir',
    view: 'Ver',
    fullscreen: 'Pantalla completa',
    help: 'Ayuda',
    about: 'Acerca de',
    aboutTitle: 'Acerca de',
  },
  en: {
    file: 'File',
    addPlaylist: 'Add Playlist',
    exit: 'Exit',
    view: 'View',
    fullscreen: 'Toggle Full Screen',
    help: 'Help',
    about: 'About',
    aboutTitle: 'About',
  },
};

function createAboutWindow() {
  if (aboutWindow) {
    aboutWindow.focus();
    return;
  }

  aboutWindow = new BrowserWindow({
    width: 340,
    height: 360,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    parent: mainWindow,
    modal: true,
    title: MENU_LABELS[currentLang].aboutTitle,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  aboutWindow.setMenu(null);
  aboutWindow.loadFile(path.join(__dirname, 'about.html'));
  aboutWindow.once('ready-to-show', () => aboutWindow.show());
  aboutWindow.on('closed', () => { aboutWindow = null; });
}

function buildMenu(lang) {
  const L = MENU_LABELS[lang] || MENU_LABELS['es'];
  const menuTemplate = [
    {
      label: L.file,
      submenu: [
        { label: L.addPlaylist, accelerator: 'CmdOrCtrl+O', click: () => { if (mainWindow) mainWindow.webContents.send('fromMain', 'open-playlist'); } },
        { type: 'separator' },
        { role: 'quit', label: L.exit }
      ]
    },
    {
      label: L.view,
      submenu: [
        { role: 'togglefullscreen', label: L.fullscreen }
      ]
    },
    {
      label: L.help,
      submenu: [
        { label: L.about, click: () => createAboutWindow() }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '..', 'public', 'favicon.png'),
    show: false,
    title: 'Simple IPTV Player',
  });

  // Determine whether to load from dev server or production build
  const isDev = process.argv.includes('--dev');

  if (isDev) {
    mainWindow.loadURL('http://localhost:4200');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'simple-iptv-player', 'browser', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.on('set-lang', (_event, lang) => {
  if (lang === 'es' || lang === 'en') {
    currentLang = lang;
    buildMenu(lang);
  }
});

app.whenReady().then(() => {
  buildMenu(currentLang);
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
