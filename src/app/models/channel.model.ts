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
