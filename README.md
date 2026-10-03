# JazzyDalpeng

A jazz guitar practice helper with an interactive fretboard, chord finder, and metronome.

## Development

Use Node.js 24 LTS (`nvm use` with the included `.nvmrc`).

```sh
npm ci
npm run dev
```

Open http://localhost:1357/jazzy-dalpeng/. Routes include:

- `/jazzy-dalpeng/tools/chord-finder/`
- `/jazzy-dalpeng/tools/metronome/`
- `/jazzy-dalpeng/practice/core/major-scale/`
- `/jazzy-dalpeng/practice/core/rhythm-test/`

```sh
npm run validate       # Type checking, lint, unit tests, production build
npm run test:watch
npm run format:check
npx playwright install chromium
npm run test:e2e       # Browser checks for fretboard input, beats, and practice
```

SvelteKit 3 configuration lives in `vite.config.ts`. Source imports use the package's
`#src/*`, `#lib/*`, and `#assets/*` subpath imports with explicit file extensions.
The static adapter generates `build/` and a `404.html` SPA fallback for GitHub Pages.
The build also copies the fallback to `index.html` so the project root responds successfully.
Pull requests run validation; pushes to `main` validate before deploying.

Tailwind 3 and daisyUI 4 use their latest patch releases. Their next major upgrades
are deferred because they require a separate theme and CSS migration. Unused PWA
registration/Workbox code was removed; offline installation is not enabled.

## Canvas library

The library is in `src/lib/canvas` and is shared by the fretboard and metronome.

```svelte
<script lang="ts">
	import { Canvas, Circle } from '#canvas';
</script>

<Canvas width={320} height={100} role="img" aria-label="Selected note">
	<Circle x={160} y={50} radius={12} fillStyle="#4338ca" />
</Canvas>
```

- Render callbacks are synchronous. `context.delta` is the frame interval in milliseconds
  (zero for the first frame).
- `Crop` renders a child canvas and composites both its visible surface and hitmap.
  Both surfaces follow dimension changes.
- Shapes expose `active`, `onup`, `ondown`, `onover`, `onout`, `onmove`, `onclick`,
  and `oncancel`. `active` can change at runtime. Shapes are inactive by default;
  standalone `HitRegion` is active by default.
- Pointer input is queued in order so a press and release between frames is retained.
  Dragging more than five canvas units suppresses clicks. Captured pointer cancellation
  is delivered through `oncancel`.
- Hit detection uses an `OffscreenCanvas` when available and an HTML canvas fallback.
  Partially transparent edge pixels are ignored to avoid ambiguous hit colors.
- Unmounting unregisters callbacks and listeners. Subcanvas disposal removes only its
  own hit registrations, preserving sibling regions.

Future extensions can add DPR-aware logical coordinates, shared transforms/clipping,
static layer caching, and redraw-on-change before adding more visual practice tools.
