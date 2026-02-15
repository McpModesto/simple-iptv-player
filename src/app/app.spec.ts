import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { App } from './app';
import { PlaylistService } from './services/playlist.service';
import { StorageService } from './services/storage.service';
import { Channel } from './models/channel.model';

describe('App', () => {
  let playlistService: PlaylistService;
  let storageService: StorageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(App, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    playlistService = TestBed.inject(PlaylistService);
    storageService = TestBed.inject(StorageService);
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show the logo text', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.logo-text')?.textContent).toBe('IPTV Player');
  });

  it('should show "Cargar Playlist" button', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.add-playlist-btn') as HTMLElement;
    expect(btn?.textContent).toContain('Cargar Playlist');
  });

  it('should show empty state message when no channels are loaded', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.sidebar-empty')?.textContent).toContain(
      'Carga una playlist M3U para empezar',
    );
  });

  it('should toggle sidebar collapsed state', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const sidebar = fixture.nativeElement.querySelector('.sidebar') as HTMLElement;
    expect(sidebar.classList.contains('collapsed')).toBe(false);

    const toggleBtn = fixture.nativeElement.querySelector('.icon-btn') as HTMLElement;
    toggleBtn.click();
    fixture.detectChanges();

    expect(sidebar.classList.contains('collapsed')).toBe(true);
  });

  it('should hide sidebar content when collapsed', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const toggleBtn = fixture.nativeElement.querySelector('.icon-btn') as HTMLElement;
    toggleBtn.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.logo-text')).toBeNull();
    expect(fixture.nativeElement.querySelector('.add-playlist-btn')).toBeNull();
  });

  it('should set currentChannel when onChannelSelected is called', () => {
    const fixture = TestBed.createComponent(App);
    const channel: Channel = {
      name: 'Test Channel',
      url: 'http://example.com/stream.m3u8',
      logo: '',
      group: 'Test',
      tvgId: '',
      tvgName: '',
    };

    (fixture.componentInstance as any).onChannelSelected(channel);
    expect((fixture.componentInstance as any).currentChannel()).toEqual(channel);
  });

  it('should call playlist.loadSavedPlaylist when loadSavedPlaylist is called', async () => {
    const fixture = TestBed.createComponent(App);
    const spy = vi.spyOn(playlistService, 'loadSavedPlaylist').mockResolvedValue();

    await (fixture.componentInstance as any).loadSavedPlaylist('test-id');
    expect(spy).toHaveBeenCalledWith('test-id');
  });

  it('should not throw when loadSavedPlaylist fails', async () => {
    const fixture = TestBed.createComponent(App);
    vi.spyOn(playlistService, 'loadSavedPlaylist').mockRejectedValue(new Error('fail'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    await (fixture.componentInstance as any).loadSavedPlaylist('bad-id');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should call storage.removePlaylist and stop event propagation on removeSavedPlaylist', () => {
    const fixture = TestBed.createComponent(App);
    const removeSpy = vi.spyOn(storageService, 'removePlaylist');
    const event = new MouseEvent('click');
    const stopSpy = vi.spyOn(event, 'stopPropagation');

    (fixture.componentInstance as any).removeSavedPlaylist(event, 'playlist-id');

    expect(stopSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalledWith('playlist-id');
  });

  it('should show playlist info when channels are loaded', () => {
    const fixture = TestBed.createComponent(App);
    playlistService.loadFromText(
      '#EXTM3U\n#EXTINF:-1,Channel 1\nhttp://example.com/1.m3u8',
      'My Playlist',
    );
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.playlist-name')?.textContent).toBe('My Playlist');
    expect(el.querySelector('.channel-count')?.textContent).toContain('1 canales');
  });
});
