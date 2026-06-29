# Personal Portfolio — immersive WebGL site

An **original** immersive personal-portfolio site built with the techniques you
see on award-winning agency sites (smooth scroll, WebGL, kinetic type, custom
cursor). It is *inspired by* that class of work — not a copy of any specific
site's design, assets, or copy.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Three.js** via **@react-three/fiber** — WebGL hero + cursor-following project planes
- **Lenis** — smooth momentum scrolling
- **GSAP + ScrollTrigger** — preloader, reveals, parallax, magnetic cursor
- Hand-written CSS design system (no UI framework) — fonts via `next/font`

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Edit your content

Everything lives in [`data/site.ts`](data/site.ts): name, role, hero lines,
about copy, services, socials, and the project list. Each project's `colors`
tuple drives its procedural WebGL hover plane.

## The pieces

| File | What it does |
| --- | --- |
| `components/Preloader.tsx` | Counter 0→100, then curtain wipe; fires the hero intro |
| `components/SmoothScroll.tsx` | Lenis instance synced to the GSAP ticker + ScrollTrigger |
| `components/Cursor.tsx` | Custom magnetic cursor; reads `data-cursor` labels |
| `components/Hero.tsx` + `HeroCanvas.tsx` | Kinetic masked title over a flowing duotone noise shader |
| `components/Work.tsx` + `WorkCanvas.tsx` | Project list with a cursor-following, rippling WebGL plane |
| `components/About.tsx` | Scroll-triggered word reveals + services |
| `components/Marquee.tsx` | Seamless infinite marquee |
| `components/Footer.tsx` | Big magnetic contact CTA |

### Swapping procedural planes for real screenshots

The work planes are procedural shaders so the site runs with zero image assets.
To use real thumbnails, load a `THREE.TextureLoader` texture per project in
`WorkCanvas.tsx` and sample it in the fragment shader instead of the duotone mix.

## Accessibility

Respects `prefers-reduced-motion` (skips the preloader, smooth scroll and
transforms) and hides the custom cursor on touch / coarse pointers.
