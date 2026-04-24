import { Component, inject, output, signal } from '@angular/core';
import { PlaylistService } from '../../services/playlist.service';
import { I18nService } from '../../services/i18n.service';
import { Channel } from '../../models/channel.model';

@Component({
  selector: 'app-channel-list',
  templateUrl: './channel-list.html',
  styleUrl: './channel-list.css',
})
export class ChannelList {
  protected readonly playlist = inject(PlaylistService);
  protected readonly i18n = inject(I18nService);
  readonly channelSelected = output<Channel>();

  protected selectedChannel: Channel | null = null;
  protected readonly groupDropdownOpen = signal(false);

  protected selectChannel(channel: Channel): void {
    this.selectedChannel = channel;
    this.channelSelected.emit(channel);
  }

  protected selectGroup(group: string | null): void {
    this.playlist.setSelectedGroup(group);
    this.groupDropdownOpen.set(false);
  }

  protected toggleGroupDropdown(): void {
    this.groupDropdownOpen.update((v) => !v);
  }

  protected closeGroupDropdown(): void {
    this.groupDropdownOpen.set(false);
  }

  protected onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.playlist.setSearchQuery(input.value);
  }

  protected trackByUrl(_index: number, channel: Channel): string {
    return channel.url;
  }
}
