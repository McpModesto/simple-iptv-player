import { Injectable, signal, computed } from '@angular/core';

export type Language = 'es' | 'en';

export interface Translations {
  // App sidebar
  toggleSidebar: string;
  loadPlaylist: string;
  channels: string;
  savedPlaylists: string;
  emptyState: string;
  delete: string;
  // Channel list
  searchPlaceholder: string;
  allGroups: string;
  noChannelsFound: string;
  noGroup: string;
  // Playlist loader modal
  modalTitle: string;
  orAddNew: string;
  playlistName: string;
  playlistNamePlaceholder: string;
  fromUrl: string;
  urlPlaceholder: string;
  load: string;
  or: string;
  fromFile: string;
  fileDropText: string;
  sourceUrl: string;
  sourceFile: string;
  // Errors (playlist loader)
  invalidUrl: string;
  loadUrlError: string;
  loadFileError: string;
  loadSavedError: string;
  // Errors (video player)
  networkError: string;
  mediaError: string;
  playbackError: string;
}

const TRANSLATIONS: Record<Language, Translations> = {
  es: {
    toggleSidebar: 'Mostrar/ocultar panel',
    loadPlaylist: 'Cargar Playlist',
    channels: 'canales',
    savedPlaylists: 'Playlists guardadas',
    emptyState: 'Carga una playlist M3U para empezar',
    delete: 'Eliminar',
    searchPlaceholder: 'Buscar canales...',
    allGroups: 'Todos los grupos',
    noChannelsFound: 'No se encontraron canales',
    noGroup: 'Sin grupo',
    modalTitle: 'Cargar Playlist',
    orAddNew: 'o agregar nueva',
    playlistName: 'Nombre de la playlist',
    playlistNamePlaceholder: 'Ej: Mi lista de deportes',
    fromUrl: 'Desde URL',
    urlPlaceholder: 'https://ejemplo.com/playlist.m3u',
    load: 'Cargar',
    or: 'o',
    fromFile: 'Desde archivo',
    fileDropText: 'Arrastra un archivo .m3u o haz clic para seleccionar',
    sourceUrl: 'URL',
    sourceFile: 'Archivo',
    invalidUrl: 'Ingresa una URL válida',
    loadUrlError: 'No se pudo cargar la playlist. Verifica la URL.',
    loadFileError: 'Error al leer el archivo. Verifica que sea un archivo M3U válido.',
    loadSavedError: 'No se pudo cargar la playlist guardada.',
    networkError: 'Error de red. Reintentando...',
    mediaError: 'Error de media. Recuperando...',
    playbackError: 'Error al reproducir el canal.',
  },
  en: {
    toggleSidebar: 'Toggle sidebar',
    loadPlaylist: 'Load Playlist',
    channels: 'channels',
    savedPlaylists: 'Saved playlists',
    emptyState: 'Load an M3U playlist to get started',
    delete: 'Delete',
    searchPlaceholder: 'Search channels...',
    allGroups: 'All groups',
    noChannelsFound: 'No channels found',
    noGroup: 'No group',
    modalTitle: 'Load Playlist',
    orAddNew: 'or add new',
    playlistName: 'Playlist name',
    playlistNamePlaceholder: 'E.g. My sports list',
    fromUrl: 'From URL',
    urlPlaceholder: 'https://example.com/playlist.m3u',
    load: 'Load',
    or: 'or',
    fromFile: 'From file',
    fileDropText: 'Drag an .m3u file or click to select',
    sourceUrl: 'URL',
    sourceFile: 'File',
    invalidUrl: 'Enter a valid URL',
    loadUrlError: 'Could not load the playlist. Check the URL.',
    loadFileError: 'Error reading the file. Make sure it is a valid M3U file.',
    loadSavedError: 'Could not load the saved playlist.',
    networkError: 'Network error. Retrying...',
    mediaError: 'Media error. Recovering...',
    playbackError: 'Error playing the channel.',
  },
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly _lang = signal<Language>(
    (localStorage.getItem('iptv-lang') as Language) ?? 'es'
  );

  readonly lang = this._lang.asReadonly();
  readonly t = computed(() => TRANSLATIONS[this._lang()]);

  constructor() {
    // Sync initial language to the Electron native menu on startup
    window.electronAPI?.setLang(this._lang());
  }

  setLang(lang: Language): void {
    this._lang.set(lang);
    localStorage.setItem('iptv-lang', lang);
    window.electronAPI?.setLang(lang);
  }

  toggle(): void {
    this.setLang(this._lang() === 'es' ? 'en' : 'es');
  }
}
