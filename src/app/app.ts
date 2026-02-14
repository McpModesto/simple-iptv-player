import { Component, inject, signal, viewChild } from '@angular/core';
import { ChannelList } from './components/channel-list/channel-list';
import { VideoPlayer } from './components/video-player/video-player';
import { PlaylistLoader } from './components/playlist-loader/playlist-loader';
import { PlaylistService } from './services/playlist.service';
import { Channel } from './models/channel.model';

@Component({
  selector: 'app-root',
  imports: [ChannelList, VideoPlayer, PlaylistLoader],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly playlist = inject(PlaylistService);
  protected readonly currentChannel = signal<Channel | null>(null);
  protected readonly sidebarCollapsed = signal(false);
  protected readonly playlistLoader = viewChild<PlaylistLoader>('loader');

  protected onChannelSelected(channel: Channel): void {
    this.currentChannel.set(channel);
  }

  protected openPlaylistLoader(): void {
    this.playlistLoader()?.open();
  }

  protected toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }
}
