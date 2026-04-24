import { Component, inject, signal, viewChild, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ChannelList } from './components/channel-list/channel-list';
import { VideoPlayer } from './components/video-player/video-player';
import { PlaylistLoader } from './components/playlist-loader/playlist-loader';
import { PlaylistService } from './services/playlist.service';
import { StorageService } from './services/storage.service';
import { I18nService } from './services/i18n.service';
import { Channel } from './models/channel.model';

@Component({
  selector: 'app-root',
  imports: [ChannelList, VideoPlayer, PlaylistLoader],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  private readonly ngZone = inject(NgZone);
  protected readonly playlist = inject(PlaylistService);
  protected readonly storage = inject(StorageService);
  protected readonly i18n = inject(I18nService);
  protected readonly currentChannel = signal<Channel | null>(null);
  protected readonly sidebarCollapsed = signal(false);
  protected readonly playlistLoader = viewChild<PlaylistLoader>('loader');

  ngOnInit(): void {
    window.electronAPI?.on('fromMain', (...args: unknown[]) => {
      if (args[0] === 'open-playlist') {
        this.ngZone.run(() => this.openPlaylistLoader());
      }
    });
  }

  ngOnDestroy(): void {
    // Cleanup handled by Electron's channel removal on window close
  }

  protected onChannelSelected(channel: Channel): void {
    this.currentChannel.set(channel);
  }

  protected openPlaylistLoader(): void {
    this.playlistLoader()?.open();
  }

  protected toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  protected async loadSavedPlaylist(id: string): Promise<void> {
    try {
      await this.playlist.loadSavedPlaylist(id);
    } catch (e) {
      console.error('Error loading saved playlist:', e);
    }
  }

  protected removeSavedPlaylist(event: MouseEvent, id: string): void {
    event.stopPropagation();
    this.storage.removePlaylist(id);
  }
}
