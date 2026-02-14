import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlaylistService } from '../../services/playlist.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-playlist-loader',
  imports: [FormsModule],
  templateUrl: './playlist-loader.html',
  styleUrl: './playlist-loader.css',
})
export class PlaylistLoader {
  private readonly playlist = inject(PlaylistService);
  protected readonly storage = inject(StorageService);
  readonly loaded = output<void>();

  protected readonly url = signal('');
  protected readonly error = signal('');
  protected readonly isLoading = signal(false);
  protected readonly showModal = signal(false);

  open(): void {
    this.showModal.set(true);
    this.error.set('');
  }

  close(): void {
    this.showModal.set(false);
    this.error.set('');
  }

  protected async loadUrl(): Promise<void> {
    const url = this.url().trim();
    if (!url) {
      this.error.set('Ingresa una URL válida');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    try {
      await this.playlist.loadFromUrl(url);
      this.showModal.set(false);
      this.loaded.emit();
    } catch (e) {
      this.error.set('No se pudo cargar la playlist. Verifica la URL.');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isLoading.set(true);
    this.error.set('');

    try {
      const text = await file.text();
      this.playlist.loadFromText(text, file.name.replace(/\.(m3u8?|txt)$/i, ''));
      this.showModal.set(false);
      this.loaded.emit();
    } catch (e) {
      this.error.set('Error al leer el archivo. Verifica que sea un archivo M3U válido.');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async loadSaved(id: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set('');

    try {
      await this.playlist.loadSavedPlaylist(id);
      this.showModal.set(false);
      this.loaded.emit();
    } catch (e) {
      this.error.set('No se pudo cargar la playlist guardada.');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected removeSaved(event: MouseEvent, id: string): void {
    event.stopPropagation();
    this.storage.removePlaylist(id);
  }

  protected onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close();
    }
  }
}
