# ENA Landing Page — Portable Export Package

A fully self-contained landing page for **Engage Now Africa (ENA)**. Drop this folder into any React/Next.js project and it works immediately.

---

## 📁 Folder Structure

```
ena-landing-page/
│
├── Landing.tsx          ← Main React component (React + Tailwind)
├── landing.css          ← All custom styles, fonts, colors, animations
├── tailwind.config.js   ← Tailwind config with ENA brand colors & animations
├── postcss.config.js    ← PostCSS config (required by Tailwind)
├── README.md            ← This file
│
└── public/              ← All static assets
    ├── logo.jpg                    ← ENA site logo (footer + nav)
    ├── engage.jpg                  ← ENA engagement image
    ├── africa-collage.png          ← Hero section collage
    ├── world-map.png               ← World map image
    ├── brand/
    │   ├── world-map.svg           ← Animated SVG map background
    │   └── engage-now-africa-logo.svg
    ├── programs/
    │   ├── education.jpg
    │   ├── health.jpeg
    │   ├── water.webp
    │   ├── women.jpg
    │   └── anti-traffic.png
    └── partners/
        ├── stirling-foundation.jpg
        ├── forever-young.jpeg
        ├── lds-church.png
        ├── cure-blindness.png
        ├── thinking-schools.jpg
        └── chris-shoko-trust.png
```

---

## 🎨 Design System

### Brand Colors
| Token | Value | Usage |
|---|---|---|
| `--ena-primary` | `#1273de` | Buttons, links, accents |
| `--ena-primary-dark` | `#0f60c2` | Hover states |
| `--ena-primary-light` | `#e8f1fd` | Backgrounds |
| `--ena-slate-900` | `#0f172a` | Main text |
| `--ena-slate-500` | `#64748b` | Body text |
| `--ena-slate-100` | `#f1f5f9` | Section backgrounds |

### Font
- **Inter** (Google Fonts, loaded in `landing.css`)
- Weights used: 400, 500, 600, 700, 800, 900

### Animations (defined in `landing.css` & `tailwind.config.js`)
| Name | Effect |
|---|---|
| `ena-float` | Floating up-down motion |
| `ena-pulse-opacity` | Subtle opacity pulse |
| `ena-marquee` | Infinite horizontal scroll |
| `ena-fade-in` | Fade-in with slight slide-up |

---

## ⚡ Quick Integration Steps

### Step 1 — Copy Config Files (if your project doesn't have them)
```bash
cp tailwind.config.js   your-project/
cp postcss.config.js    your-project/
```
If your project **already has** these, just **merge** the relevant `content`, `colors`, `animation`, and `keyframes` entries into your existing config.

### Step 2 — Copy Assets
```bash
cp -r public/*  your-project/public/
```

### Step 3 — Copy the Landing Component
```bash
cp Landing.tsx  your-project/src/features/landing/
# or for Next.js:
cp Landing.tsx  your-project/app/landing/Landing.tsx
```

### Step 4 — Import the CSS
In your global CSS file (e.g. `globals.css` or `index.css`), add at the top:
```css
/* Option A: Use Tailwind (recommended) */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Option B: Import the landing-specific custom styles */
@import './landing.css';
```

> **Note:** If your project already has `@tailwind` directives, just add the `@import './landing.css'` line after them.

### Step 5 — Add the Route

**For Next.js (App Router):**
```jsx
// app/page.jsx or app/landing/page.jsx
import Landing from './Landing';
export default function Page() { return <Landing />; }
```

**For React Router (Vite / CRA):**
```tsx
import Landing from './features/landing/Landing';
// In your router:
<Route path="/" element={<Landing />} />
```

### Step 6 — Adjust the Navigation Import
The component imports `useNavigate` from `react-router-dom` (for Vite/CRA projects).

**For Next.js**, replace line 1 in `Landing.tsx`:
```diff
- import { useNavigate } from 'react-router-dom'
+ import { useRouter } from 'next/navigation'
```
And replace all `nav('/login')` calls with `router.push('/login')`, and `nav` variable with `router`.

---

## ✅ Dependencies Required in Target Project

```bash
npm install tailwindcss postcss autoprefixer
# Plus one of these for routing:
npm install react-router-dom   # for Vite/CRA
# OR Next.js already includes its router
```

---

## 🔧 Sections Included

| # | Section | Description |
|---|---|---|
| 1 | **Navbar** | Sticky top nav with logo, section links, login button |
| 2 | **Hero** | Full-width hero with headline, CTA, and Africa collage image |
| 3 | **About** | Who We Are, Mission, Vision, Theory of Change |
| 4 | **Programs** | 5 program areas with images and descriptions |
| 5 | **Impact** | 4 impact statistics with animated counters |
| 6 | **Partners** | Government partners list + auto-scrolling logo marquee |
| 7 | **Footer** | 4-column footer with logo, links, contact info, social icons |
