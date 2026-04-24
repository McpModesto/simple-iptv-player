# electron-iptv — Guía para Agentes

Reproductor IPTV de escritorio construido con **Angular 21 (standalone) + Electron 40**. Reproduce streams HLS/M3U mediante hls.js. Empaquetado con electron-builder.

## Arquitectura

```
Proceso principal de Electron (electron/main.js)
  └─ BrowserWindow
       ├─ Dev: carga localhost:4200 | Prod: carga dist/…/index.html
       ├─ Menú: Archivo > Añadir Playlist → IPC 'fromMain' → renderer
       └─ preload.js: contextBridge → window.electronAPI

Renderer Angular (src/app/)
  App                          ← shell de layout, listener IPC, signal canal actual
   ├─ ChannelList              ← lee signals de PlaylistService, emite channelSelected
   ├─ VideoPlayer              ← recibe signal Channel como input, gestiona ciclo de vida hls.js
   └─ PlaylistLoader (modal)   ← carga M3U desde URL o fichero; invocado via viewChild
        ├─ PlaylistService     ← propietario de todo el estado de canales (signals + parser M3U)
        └─ StorageService      ← persistencia en localStorage para playlists guardadas
```

**Flujo de datos:** PlaylistLoader → PlaylistService.loadFromUrl/loadFromText → signal `_channels` → computed `filteredChannels` → ChannelList renderiza → usuario hace clic → signal App.currentChannel → effect de VideoPlayer → hls.js carga el stream.

## Comandos de Build y Test

```bash
npm start               # Servidor de desarrollo Angular (puerto 4200)
npm run electron:dev    # Servidor Angular + Electron en paralelo (hot reload)
npm run electron:build  # Build de producción → electron-builder → release/
npm test                # Tests unitarios con Vitest
```

## Convenciones Angular

Este proyecto usa las últimas APIs funcionales de Angular — aplícalas de forma consistente:

- **DI**: siempre `inject()`, nunca inyección por constructor
- **Estado**: `signal()`, `computed()`, `effect()` — sin RxJS Subjects ni NgRx
- **Inputs/Outputs**: `input()`, `output()`, `viewChild()` — no los decoradores `@Input`/`@Output`/`@ViewChild`
- **Control flow en templates**: `@if`, `@for`, `@empty`, `@else` — nunca `*ngIf` ni `*ngFor`
- **Nombres de clases**: sin sufijo `Component` — `App`, `ChannelList`, `VideoPlayer`, `PlaylistLoader`
- **Nombres de ficheros**: `channel-list.ts`, no `channel-list.component.ts`
- **Visibilidad**: `protected` para miembros usados en el template, `private` para lógica interna
- **Servicios**: exponer signals con `.asReadonly()`; signals internas escribibles con prefijo `_`
- **Componentes standalone**: todos los componentes, sin `NgModule`

## Compatibilidad Electron + Navegador

`window.electronAPI` es opcional — usar siempre `?.` para que la app funcione en el navegador con `ng serve`. Al disparar actualizaciones de Angular desde callbacks de IPC de Electron, envolver en `NgZone.run()` (ver `App.ngOnInit`).

Canales IPC:
| Canal | Dirección | Uso |
|-------|-----------|-----|
| `fromMain` | Main → Renderer | Envía `'open-playlist'` (menú Archivo / Ctrl+O) |
| `toMain` | Renderer → Main | Permitido en preload pero sin uso actual |

## Reproducción de Vídeo (VideoPlayer)

Tres rutas en `loadChannel()`:
1. `Hls.isSupported()` → hls.js (ruta principal para `.m3u8` y formatos desconocidos)
2. HLS nativo vía `canPlayType` (fallback para Safari)
3. Asignación directa de `video.src` para `.mp4/.webm/.ogg`

Recuperación de errores: reintento en `NETWORK_ERROR`, recuperación en `MEDIA_ERROR`, destrucción en cualquier otro error fatal.

## Parseo M3U (PlaylistService)

Parser síncrono propio — sin librería M3U externa. Valida la cabecera `#EXTM3U`, extrae `tvg-id`, `tvg-name`, `tvg-logo`, `group-title` de las líneas `#EXTINF` mediante regex. El nombre del canal se toma de lo que hay tras la última coma en la línea `#EXTINF`.

Las playlists cargadas desde fichero almacenan el texto M3U completo en `SavedPlaylist.content` en localStorage — tener en cuenta el tamaño con playlists muy grandes.

## Testing

Framework: **Vitest 4** + Angular `TestBed`. Usar `vi`, `describe`, `it`, `expect`, `beforeEach` — no los globals de Jasmine.

Solo existe `app.spec.ts`. Los nuevos tests van junto al fichero que prueban (`*.spec.ts`). Usar `NO_ERRORS_SCHEMA` cuando se necesite aislar un componente de sus hijos.

## Estilo de Código

- TypeScript en modo strict; Prettier con `printWidth: 100`, `singleQuote: true`
- Tema oscuro: fondo `#0f0f1a`, acento índigo `rgba(99, 102, 241, …)`
- Cada componente tiene su propio fichero `.css`; reset global + fuente Inter en `src/styles.css`
- El router existe (`app.routes.ts`) pero está vacío — aún no hay rutas de navegación
