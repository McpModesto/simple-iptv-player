import { Injectable, signal, computed } from '@angular/core';
import { Channel, ChannelGroup } from '../models/channel.model';

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  private readonly _channels = signal<Channel[]>([]);
  private readonly _searchQuery = signal('');
  private readonly _selectedGroup = signal<string | null>(null);
  private readonly _playlistName = signal('');
  private readonly _isLoading = signal(false);

  readonly channels = this._channels.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly selectedGroup = this._selectedGroup.asReadonly();
  readonly playlistName = this._playlistName.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  readonly groups = computed<ChannelGroup[]>(() => {
    const channels = this._channels();
    const groupMap = new Map<string, Channel[]>();

    for (const ch of channels) {
      const group = ch.group || 'Sin grupo';
      if (!groupMap.has(group)) {
        groupMap.set(group, []);
      }
      groupMap.get(group)!.push(ch);
    }

    return Array.from(groupMap.entries())
      .map(([name, channels]) => ({ name, channels }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  readonly filteredChannels = computed<Channel[]>(() => {
    const query = this._searchQuery().toLowerCase().trim();
    const group = this._selectedGroup();
    let channels = this._channels();

    if (group) {
      channels = channels.filter(ch => (ch.group || 'Sin grupo') === group);
    }

    if (query) {
      channels = channels.filter(ch =>
        ch.name.toLowerCase().includes(query) ||
        ch.group.toLowerCase().includes(query)
      );
    }

    return channels;
  });

  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  setSelectedGroup(group: string | null): void {
    this._selectedGroup.set(group);
  }

  async loadFromUrl(url: string): Promise<void> {
    this._isLoading.set(true);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al cargar: ${response.statusText}`);
      }
      const text = await response.text();
      this.parseM3U(text);
      this._playlistName.set(this.extractPlaylistName(url));
    } catch (error) {
      console.error('Error cargando playlist:', error);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  loadFromText(text: string, name = 'Playlist local'): void {
    this.parseM3U(text);
    this._playlistName.set(name);
  }

  private extractPlaylistName(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      const fileName = pathParts[pathParts.length - 1] || 'Playlist';
      return fileName.replace(/\.(m3u8?|txt)$/i, '');
    } catch {
      return 'Playlist';
    }
  }

  private parseM3U(content: string): void {
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

    if (!lines[0]?.startsWith('#EXTM3U')) {
      throw new Error('Formato de playlist inválido. Debe ser un archivo M3U.');
    }

    const channels: Channel[] = [];
    let currentInfo: Partial<Channel> = {};

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('#EXTINF:')) {
        currentInfo = this.parseExtInf(line);
      } else if (!line.startsWith('#')) {
        if (currentInfo.name) {
          channels.push({
            name: currentInfo.name || 'Sin nombre',
            url: line,
            logo: currentInfo.logo || '',
            group: currentInfo.group || 'Sin grupo',
            tvgId: currentInfo.tvgId || '',
            tvgName: currentInfo.tvgName || '',
          });
        }
        currentInfo = {};
      }
    }

    this._channels.set(channels);
  }

  private parseExtInf(line: string): Partial<Channel> {
    const result: Partial<Channel> = {};

    // Extract attributes
    const tvgIdMatch = line.match(/tvg-id="([^"]*)"/);
    const tvgNameMatch = line.match(/tvg-name="([^"]*)"/);
    const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/);
    const groupMatch = line.match(/group-title="([^"]*)"/);

    result.tvgId = tvgIdMatch?.[1] || '';
    result.tvgName = tvgNameMatch?.[1] || '';
    result.logo = tvgLogoMatch?.[1] || '';
    result.group = groupMatch?.[1] || '';

    // Extract channel name (after the last comma)
    const commaIndex = line.lastIndexOf(',');
    if (commaIndex !== -1) {
      result.name = line.substring(commaIndex + 1).trim();
    }

    return result;
  }

  clear(): void {
    this._channels.set([]);
    this._searchQuery.set('');
    this._selectedGroup.set(null);
    this._playlistName.set('');
  }
}
