# JazzyDalpeng

A jazz guitar practice helper with an interactive fretboard, chord finder, and metronome.

## Product planning

[학습과 사용자 경험 설계](docs/product-plan.md) describes the proposed curriculum,
first learning sequence, practice feedback, and mobile and desktop interaction flows.

## Learning experience

The home page opens a complete first course at `/jazzy-dalpeng/learn/major-scale/`:
explore the existing six-string fretboard, find scale degrees, practice one octave,
and select the root, third, and fifth to build a major triad. All twelve keys and
four fret ranges are supported, with key-correct note spelling.

Practice uses the shared `TempoTimer` audio clock, optional four-beat count-in,
ascending/descending sequences, and repeated playback. Sounds are reference tones;
guitar performance is self-assessed. Progress and settings are versioned in browser
local storage, restored without automatic playback, and can be reset from settings.
Changing the root starts the course again in the new key. Later courses shown on the
home page are planned curriculum, not implemented lessons.

The `dalpeng` theme, FinaleJazz/FinaleJazzChord notation, and cropped fretboard hitmap
are reused. The main learning controls fit small portrait screens; concept explanations, guides, alternative note selection, and
settings open in dialogs, and enlarged text can use normal document scrolling.

## Development

Use Node.js 24 LTS (`nvm use` with the included `.nvmrc`).

```sh
npm ci
npm run dev
```

Open http://localhost:1357/jazzy-dalpeng/. Routes include:

- `/jazzy-dalpeng/learn/major-scale/`
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

Canvas dimensions are logical coordinates. The visible backing surface follows the
rendered CSS size and device pixel ratio, including cropped child surfaces. Hitmaps
and pointer events retain logical coordinates; use `data-logical-width` and
`data-logical-height` when inspecting canvas pixels or converting coordinates.

Future extensions can add shared transforms/clipping,
static layer caching, and redraw-on-change before adding more visual practice tools.
