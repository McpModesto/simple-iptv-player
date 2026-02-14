import {
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  signal,
  viewChild,
} from '@angular/core';
import Hls from 'hls.js';
import { Channel } from '../../models/channel.model';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.html',
  styleUrl: './video-player.css',
})
export class VideoPlayer implements OnDestroy {
  readonly channel = input<Channel | null>(null);

  protected readonly videoRef = viewChild<ElementRef<HTMLVideoElement>>('videoEl');
  protected readonly isPlaying = signal(false);
  protected readonly isMuted = signal(false);
  protected readonly isFullscreen = signal(false);
  protected readonly currentVolume = signal(80);
  protected readonly showControls = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly isBuffering = signal(false);

  private hls: Hls | null = null;
  private controlsTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const channel = this.channel();
      if (channel) {
        this.loadChannel(channel);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyHls();
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
    }
  }

  private loadChannel(channel: Channel): void {
    this.destroyHls();
    this.errorMessage.set('');
    this.isBuffering.set(true);

    const videoEl = this.videoRef()?.nativeElement;
    if (!videoEl) return;

    const url = channel.url;

    if (Hls.isSupported() && (url.includes('.m3u8') || url.includes('.m3u') || !url.match(/\.(mp4|webm|ogg)$/i))) {
      this.hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });

      this.hls.loadSource(url);
      this.hls.attachMedia(videoEl);

      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.isBuffering.set(false);
        videoEl.play().catch(() => {});
      });

      this.hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              this.errorMessage.set('Error de red. Reintentando...');
              this.hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              this.errorMessage.set('Error de media. Recuperando...');
              this.hls?.recoverMediaError();
              break;
            default:
              this.errorMessage.set('Error al reproducir el canal.');
              this.destroyHls();
              break;
          }
        }
      });
    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      videoEl.src = url;
      videoEl.addEventListener('loadedmetadata', () => {
        this.isBuffering.set(false);
        videoEl.play().catch(() => {});
      }, { once: true });
    } else {
      videoEl.src = url;
      videoEl.addEventListener('loadeddata', () => {
        this.isBuffering.set(false);
        videoEl.play().catch(() => {});
      }, { once: true });
    }
  }

  private destroyHls(): void {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
  }

  protected togglePlay(): void {
    const videoEl = this.videoRef()?.nativeElement;
    if (!videoEl) return;

    if (videoEl.paused) {
      videoEl.play().catch(() => {});
    } else {
      videoEl.pause();
    }
  }

  protected toggleMute(): void {
    const videoEl = this.videoRef()?.nativeElement;
    if (!videoEl) return;

    videoEl.muted = !videoEl.muted;
    this.isMuted.set(videoEl.muted);
  }

  protected onVolumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const volume = parseInt(input.value, 10);
    this.currentVolume.set(volume);

    const videoEl = this.videoRef()?.nativeElement;
    if (videoEl) {
      videoEl.volume = volume / 100;
      if (volume === 0) {
        this.isMuted.set(true);
        videoEl.muted = true;
      } else if (videoEl.muted) {
        this.isMuted.set(false);
        videoEl.muted = false;
      }
    }
  }

  protected toggleFullscreen(): void {
    const videoEl = this.videoRef()?.nativeElement;
    if (!videoEl) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
      this.isFullscreen.set(false);
    } else {
      videoEl.closest('.video-player-container')?.requestFullscreen();
      this.isFullscreen.set(true);
    }
  }

  protected onPlay(): void {
    this.isPlaying.set(true);
  }

  protected onPause(): void {
    this.isPlaying.set(false);
  }

  protected onWaiting(): void {
    this.isBuffering.set(true);
  }

  protected onCanPlay(): void {
    this.isBuffering.set(false);
  }

  protected onMouseMove(): void {
    this.showControls.set(true);
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
    }
    this.controlsTimeout = setTimeout(() => {
      if (this.isPlaying()) {
        this.showControls.set(false);
      }
    }, 3000);
  }

  protected onVideoError(): void {
    this.isBuffering.set(false);
    this.errorMessage.set('No se pudo reproducir este canal.');
  }
}
