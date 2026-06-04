# CWAY Academy Web Platform

A premium, modern, and fully responsive web platform built for **CWAY Academy** to train and commission church leaders and pastors. The application features a hybrid SPA-style tab system combined with rich Next.js dynamic routing, modern glassmorphic aesthetics, and highly optimized performance assets.

---

## 🚀 Tech Stack & Design System

- **Frontend Framework**: Next.js 15+ (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS & Vanilla CSS (Harmonious Cream, Forest Green, and Gold Palette)
- **Animations & Effects**: Framer Motion (micro-interactions & page transitions), Lenis (smooth inertia scrolling)
- **Iconography**: Lucide React
- **Typography**: Jost & Karla (Sans-serif bodies), Fraunces & Cinzel (Serif headlines), JetBrains Mono (Monospace)

---

## 🛠 Key Features & Components Developed

### 1. Hybrid Navigation & Page Architecture
- Engineered a hybrid routing solution combining SPA-style tabbed hash-routing (`#home`, `#about`, `#courses`, `#involved`, `#blog`, `#contact`) on the landing page with separate dedicated pages for dynamic deep-linking (e.g., `/blog/[slug]`, `/courses/[slug]`, `/leadership`).
- Implemented a sticky, responsive navigation header that adjusts height and depth dynamically on scroll.

### 2. Multi-Action Interactive Email Card (`EmailCard.tsx`)
- Designed and built a premium contact widget styled with warm cream base tokens, gold-gradient gradients, and smooth shadow elevations.
- **Direct Gmail Compose**: Utilizes direct web URL intents (`mail.google.com/mail/?view=cm...`) to instantly trigger a draft compose window pre-filled with the support address, bypassing native pop-up blockers.
- **Native Mail Client Fallback**: Implements standard `mailto:` schema triggers.
- **Clipboard Utility**: Integrated a clipboard copy button showing real-time feedback state (check/copy icon transitions) when saving the contact email.

### 3. Responsive Layout Safeguards
- Restructured CSS layouts by replacing inline grid sizing with media-query-driven classes (`.contact-layout-grid`), allowing dynamic side-by-side structures on desktop to collapse to single column viewports cleanly.
- Added a `5rem` top padding safety system to contact page content containers to prevent overlap with the fixed header navbar on short viewports.

### 4. Performance & Preload Optimizations
- Resolved Chrome console warnings related to unused preloads by opting out of Next.js automatic route prefetching (`prefetch={false}`) on primary links. This reduced initial load footprint and prevented background network request bloat for unvisited tabs.

---

## 📄 Resume Bullet Points (Copy & Paste)

Here are bullet points tailored for your resume, highlighting technical achievements, design, and performance optimizations:

```markdown
* Designed and built a hybrid SPA/multi-page web application using Next.js 15+, React 19, and TypeScript, resulting in a seamless, high-performance user experience.
* Engineered a custom theme design system featuring warm cream, forest green, and gold palettes, utilizing Jost and Fraunces font pairings, Framer Motion transitions, and Lenis smooth scroll inertia.
* Built a custom, multi-action email communications widget (EmailCard) featuring direct Gmail compose intents, a native mail client launcher (mailto), and an interactive clipboard copy utility.
* Resolved layout constraints and improved viewport responsiveness on mobile screens by replacing inline column overrides with fluid CSS grids and adding fixed-header padding safety zones.
* Optimized web performance and eliminated browser asset preload warnings by disabling automatic route prefetching (prefetch={false}) on viewport-visible links, reducing background asset loading footprint.
```

---

## 💻 Running Locally

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
