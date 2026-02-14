export interface Channel {
  name: string;
  url: string;
  logo: string;
  group: string;
  tvgId: string;
  tvgName: string;
}

export interface ChannelGroup {
  name: string;
  channels: Channel[];
}

export interface SavedPlaylist {
  id: string;
  name: string;
  url: string;
  source: 'url' | 'file';
  channelCount: number;
  addedAt: number;
  /** Stored M3U content for file-based playlists */
  content?: string;
}
