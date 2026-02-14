import { Component, inject, output } from '@angular/core';
import { PlaylistService } from '../../services/playlist.service';
import { Channel } from '../../models/channel.model';

@Component({
  selector: 'app-channel-list',
  templateUrl: './channel-list.html',
  styleUrl: './channel-list.css',
})
export class ChannelList {
  protected readonly playlist = inject(PlaylistService);
  readonly channelSelected = output<Channel>();

  protected selectedChannel: Channel | null = null;

  protected selectChannel(channel: Channel): void {
    this.selectedChannel = channel;
    this.channelSelected.emit(channel);
  }

  protected selectGroup(group: string | null): void {
    this.playlist.setSelectedGroup(group);
  }

  protected onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.playlist.setSearchQuery(input.value);
  }

  protected trackByUrl(_index: number, channel: Channel): string {
    return channel.url;
  }
}
