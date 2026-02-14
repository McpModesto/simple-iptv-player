import { Injectable, signal } from '@angular/core';
import { SavedPlaylist } from '../models/channel.model';

const STORAGE_KEY = 'iptv-saved-playlists';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly _savedPlaylists = signal<SavedPlaylist[]>([]);
  readonly savedPlaylists = this._savedPlaylists.asReadonly();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const playlists: SavedPlaylist[] = JSON.parse(raw);
        this._savedPlaylists.set(playlists);
      }
    } catch (e) {
      console.error('Error loading saved playlists:', e);
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._savedPlaylists()));
    } catch (e) {
      console.error('Error saving playlists:', e);
    }
  }

  savePlaylist(playlist: Omit<SavedPlaylist, 'id' | 'addedAt'>): void {
    const existing = this._savedPlaylists().find(
      p => p.url === playlist.url && p.source === playlist.source && p.name === playlist.name
    );

    if (existing) {
      // Update existing entry
      this._savedPlaylists.update(list =>
        list.map(p =>
          p.id === existing.id
            ? { ...p, channelCount: playlist.channelCount, addedAt: Date.now(), content: playlist.content }
            : p
        )
      );
    } else {
      const newPlaylist: SavedPlaylist = {
        ...playlist,
        id: crypto.randomUUID(),
        addedAt: Date.now(),
      };
      this._savedPlaylists.update(list => [newPlaylist, ...list]);
    }

    this.persist();
  }

  removePlaylist(id: string): void {
    this._savedPlaylists.update(list => list.filter(p => p.id !== id));
    this.persist();
  }

  getPlaylist(id: string): SavedPlaylist | undefined {
    return this._savedPlaylists().find(p => p.id === id);
  }
}
