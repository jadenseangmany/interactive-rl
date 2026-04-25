# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**interactive-rl** is an interactive React web app that teaches Reinforcement Learning following Sutton & Barto's "Reinforcement Learning: An Introduction" (2nd ed.). Students manipulate parameters via sliders/controls and see results in real-time — building intuition through exploration.

- **Target audience**: Undergrad beginners. Minimize math notation, maximize visual intuition.
- **Comparable projects**: Seeing Theory (stats), TensorFlow Playground (neural nets).
- **Remote**: https://github.com/jadenseangmany/interactive-rl.git

## Textbook Reference

The primary textbook is **Sutton & Barto, "Reinforcement Learning: An Introduction" (2nd ed., 2020)**. A local copy lives at `assets/RLbook2020.pdf` (git-ignored). Use `Read` with `pages` parameter to reference specific sections. Key chapter mapping:
- Ch 1: Introduction (pp. 1–22)
- Ch 2: Multi-armed Bandits (pp. 25–46)
- Ch 3: Finite MDPs (pp. 47–72)
- Ch 4: Dynamic Programming (pp. 73–92)
- Ch 5: Monte Carlo Methods (pp. 93–118)
- Ch 6: Temporal-Difference Learning (pp. 119–146)
- Ch 7: n-step Bootstrapping (pp. 147–162)
- Ch 8: Planning and Learning (pp. 163–186)

## Commands

```bash
npm run dev          # Start dev server (Vite)
npm run build        # Production build (outputs to dist/)
npm run preview      # Preview production build locally
npx vitest run       # Run unit tests
npx vitest           # Run tests in watch mode
```

## Tech Stack

- **Vite + React 19 + TypeScript** — framework
- **React Router v7** — flat routes (`/ch/2`, `/ch/6`), lazy code-splitting
- **D3.js v7** (modular imports) — SVG gridworlds, policy arrows, heatmaps
- **Recharts** — standard line/bar charts (learning curves, reward plots)
- **KaTeX** via `react-katex` — equation rendering, used sparingly
- **Tailwind CSS v4** — styling
- **shadcn/ui** — UI components (Slider, Tabs, Card, etc.)
- **Motion (Framer Motion)** — animations
- **Zustand** — one store per demo, selector-based subscriptions
- **MDX v3** via `@mdx-js/rollup` — prose in Markdown, demos embedded as React components
- **Vercel** — deployment

## Architecture

### Separation of Concerns
- `src/algorithms/` — Pure TypeScript RL algorithm logic. **Zero React imports.** Takes state, returns new state. Testable in isolation.
- `src/environments/` — Pure TypeScript environment definitions. **Zero React imports.** Gridworld, cliff-walking, blackjack, etc.
- `src/chapters/*/demos/` — React components that wire algorithms + environments to visualizations.
- `src/components/viz/` — Reusable visualization primitives (Gridworld renderer, ValueHeatmap, PolicyArrows, LearningCurve).
- `src/hooks/` — `useSimulation` (rAF loop), `useAlgorithmStepper` (generator-based stepping).

### Algorithm Stepping via Generators
Each algorithm is a `function*` that yields after each step. The `useAlgorithmStepper` hook provides `step()`, `play()`, `reset()`. This reads like textbook pseudocode and makes granularity trivial to control.

### Content Authoring
Each chapter has a `content.mdx` file for explanatory prose with interactive demos embedded inline as React components (e.g., `<BanditTestbed />`). This separates content from code.

### Route Structure
`/` = landing page, `/ch/1` through `/ch/17` = chapter pages. Sections within chapters use hash anchors (`/ch/2#ucb`).

## Project Structure

```
src/
├── main.tsx, App.tsx, router.tsx
├── components/
│   ├── ui/          # shadcn/ui components
│   ├── layout/      # ChapterLayout, Sidebar, SectionNav
│   ├── viz/         # Gridworld, ValueHeatmap, PolicyArrows, LearningCurve, SliderPanel, MathBlock
│   └── common/      # PlaybackControls, ParameterPanel, ExplanationCard
├── chapters/        # ch01-introduction/ through ch17-frontiers/, each with index.tsx + content.mdx + demos/
├── algorithms/      # types.ts, bandits.ts, dp.ts, mc.ts, td.ts, nstep.ts, planning.ts, etc.
├── environments/    # types.ts, gridworld.ts, cliff-walking.ts, windy-gridworld.ts, etc.
├── hooks/           # useSimulation.ts, useAlgorithmStepper.ts, useResizeObserver.ts
├── stores/          # Zustand stores per demo
├── lib/             # colors.ts, math.ts, format.ts
└── styles/          # globals.css
```

## Key Design Decisions

- **D3 + Recharts**: D3 for custom spatial visualizations (gridworlds, backup diagrams), Recharts for standard XY charts. Both needed.
- **Zustand over Context**: Demos have 10-20 params + simulation state. Context would cause re-render storms. Zustand's selectors avoid this.
- **Generators for algorithms**: `function* policyIteration(grid)` yields after every sweep/cell/improvement step. Consumer controls granularity.
- **Web Workers**: Only for expensive computations (bandit testbed with 2000+ runs, MC with 500K+ episodes). Tabular methods on small grids run fine on main thread.
- **MathBlock toggle**: KaTeX equation with "show plain English" toggle — key for beginner audience.

## Pedagogical Design Philosophy

**Concrete first, abstract later.** Every section should follow this pattern:
1. **You play it** — A relatable, narrative scenario the student interacts with directly
2. **Name the concept** — After they've felt the tension/idea, give it a name
3. **Watch the agent** — Same scenario, but now an algorithm plays it step-by-step with narration
4. **Generalize** — Introduce formal notation grounded in the scenario they already understand

**No abstract k's and Q(a)'s up front.** Students understand "3 people to date, 5 Friday nights" before they understand "k arms, T timesteps."

## Chapter 2.1 Plan — "A k-Armed Bandit Problem"

The current abstract bar-chart demos are being replaced with a narrative-driven experience. Here is the plan:

### Phase 1: "You Play It" — DatingGame component
`src/chapters/ch02-bandits/demos/DatingGame.tsx`

**Scenario**: You just moved to a new city. There are 3 people you could ask out. Each has a hidden "compatibility" with you (their true mean score). Each date gives a noisy happiness rating (1-10). You have 5 Friday nights. Goal: maximize total happiness.

**The 3 partners** (with names, emoji avatars, one-line vibes):
- Alex (artsy), Jordan (outdoorsy), Casey (foodie)
- Hidden true scores spread across a range (e.g., 4.5, 6.5, 8.0)
- Noise: each date = randomNormal(trueScore, 1.5), clamped to 1-10

**Interaction**:
- Student sees 3 character cards. Clicks one to go on a date.
- Short "Going on a date..." animation (~600ms), then the result appears:
  "Night 3 with Jordan — 8.2/10 ❤️❤️❤️❤️🖤"
- Card updates to show: number of dates, running average
- Compact timeline of all past dates (emoji + score chips)
- After 5 nights: "Reveal True Compatibility Scores" button
  - Animated bar chart showing true scores, who they picked most, personalized debrief:
    - "You never tried Casey — they were actually your best match!" (didn't explore enough)
    - "Nice, you found Casey and committed!" (good exploit)
    - Etc.

**Key feeling**: The student naturally experiences the explore/exploit dilemma without being told about it.

### Phase 2: "Name the Dilemma" — Prose section
Short prose block (no demo). Now that they've felt it:
- "Did you try everyone? Or did you commit early?"
- "If you explored too much, you wasted nights on bad matches."
- "If you committed too early, you might have missed someone better."
- "This tension — **explore vs. exploit** — is the central problem of reinforcement learning."

No math. Just naming what they experienced.

### Phase 3: "Watch the Agent" — AgentPlaysDemo component
`src/chapters/ch02-bandits/demos/AgentPlaysDemo.tsx`

Same 3 partners, same scenario. But now an epsilon-greedy agent plays.

**Interaction**:
- Same character cards, but the agent picks (highlighted with a pulsing border)
- **Very slow, narrated step-by-step** with clear text:
  - "The agent decides to **explore** (random)... picks Sam..."
  - *date animation*
  - "Sam: 4.3/10. Agent's estimate for Sam drops from 6.0 → 5.4"
  - "The agent decides to **exploit** (best known)... picks Casey..."
  - etc.
- Play/Pause/Step controls. Default: paused, student steps through one at a time.
- Epsilon slider: adjust and reset to see how behavior changes.
- After completion: same reveal + comparison of agent's score vs student's score from Phase 1.

**Key feeling**: "Oh, the agent is doing the same thing I was doing, but with a rule."

### Phase 4: "Generalize" — Prose + notation section
Now introduce the formal framing:
- "What you just played is called the **k-armed bandit problem**."
- "Each person is an **arm** (k=3). Each date is a **pull**. The happiness rating is the **reward**."
- "The true compatibility score is q*(a) — the true value of action a."
- "Your running average is Q_t(a) — your estimate of that value at time t."
- "The agent's epsilon rule: with probability ε explore, otherwise exploit."
- Brief KaTeX for q*(a) = E[R_t | A_t = a], but with the English always alongside.

### Files to modify
- `src/chapters/ch02-bandits/demos/DatingGame.tsx` — new, Phase 1
- `src/chapters/ch02-bandits/demos/AgentPlaysDemo.tsx` — new, Phase 3
- `src/chapters/ch02-bandits/index.tsx` — rewrite to wire all 4 phases together
- `src/algorithms/bandits.ts` — keep as-is, used by AgentPlaysDemo
- `src/chapters/ch02-bandits/demos/BanditTestbed.tsx` — keep for now, may reuse later
- `src/chapters/ch02-bandits/demos/BanditArmsViz.tsx` — may remove or adapt
- `src/chapters/ch02-bandits/demos/EpsilonComparison.tsx` — keep for later sections
