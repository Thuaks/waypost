# DESIGN.md — Waypost

Design tokens and component conventions. Every UI piece we build pulls from this file —
no ad hoc colors, spacing, or fonts introduced elsewhere.

## Color Palette

### Base (charcoal/slate)
| Token | Hex | Use |
|---|---|---|
| `--bg-primary` | `#14161A` | App background |
| `--bg-surface` | `#1C1F24` | Card/panel background |
| `--bg-surface-raised` | `#23262C` | Hover states, nested panels |
| `--border-subtle` | `#2C2F36` | Card borders, dividers |
| `--border-strong` | `#3A3E46` | Input borders, focused elements |

### Accent (muted copper/rust)
| Token | Hex | Use |
|---|---|---|
| `--accent-primary` | `#B4693E` | Primary buttons, active nav, key highlights |
| `--accent-hover` | `#C97A4B` | Hover state on accent elements |
| `--accent-muted` | `#8A5233` | Subtle accent (icons, secondary emphasis) |
| `--accent-glow` | `rgba(180, 105, 62, 0.15)` | Background glow behind accent elements |

### Status colors (for node/target health)
| Token | Hex | Use |
|---|---|---|
| `--status-healthy` | `#5A9367` | Active/healthy targets — muted green, not neon |
| `--status-warning` | `#C9A24B` | Degraded/slow response |
| `--status-error` | `#B4523E` | Down/failed targets |

### Text
| Token | Hex | Use |
|---|---|---|
| `--text-primary` | `#EDEDEF` | Headings, primary content |
| `--text-secondary` | `#A3A7AE` | Labels, secondary info |
| `--text-tertiary` | `#6B6F78` | Timestamps, disabled, placeholder |

## Typography

**Font family:** `Inter, system-ui, -apple-system, sans-serif` — used everywhere, including
numeric/technical data (IPs, latency, routes). To keep numeric columns readable and aligned
without switching fonts, apply `font-variant-numeric: tabular-nums` to any numeric table cells.

| Token | Size | Weight | Use |
|---|---|---|---|
| `--text-h1` | 28px | 600 | Page titles |
| `--text-h2` | 20px | 600 | Section headers, card titles |
| `--text-body` | 14px | 400 | Default body text |
| `--text-small` | 12px | 400 | Labels, captions, timestamps |
| `--text-stat` | 32px | 700 | Large stat numbers on cards |

## Spacing Scale
`4px` base unit: `4, 8, 12, 16, 24, 32, 48, 64`
Use these exclusively for padding/margin/gaps — no arbitrary values.

## Border Radius
| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 6px | Buttons, inputs, small tags |
| `--radius-md` | 10px | Cards, panels |
| `--radius-lg` | 16px | Modals |

## Component Conventions

**Stat card**
- Background: `--bg-surface`, border: `--border-subtle`, radius: `--radius-md`
- Padding: 24px
- Label in `--text-small` / `--text-secondary` above the number
- Number in `--text-stat` / `--text-primary`
- Optional small trend indicator using status colors

**Buttons (primary)**
- Background: `--accent-primary`, text: `--text-primary`
- Hover: `--accent-hover`
- Radius: `--radius-sm`, padding: 10px 18px

**Table (targets/nodes, request log)**
- Row background: transparent, alternating subtle `--bg-surface-raised` optional
- Header text: `--text-small` / `--text-secondary`, uppercase, letter-spacing 0.03em
- Status shown as a small dot + label using status colors, not full-row coloring
- Numeric columns right-aligned with `tabular-nums`

**Chart (traffic over time)**
- Line color: `--accent-primary`
- Fill beneath line: `--accent-glow`
- Grid lines: `--border-subtle`, very low opacity
- Axis labels: `--text-tertiary`

**Motif**
- Signpost/crossroads iconography (simple geometric mark — crossed paths or a directional
  arrow cluster) used in the logo mark and empty states. No globe, no network-node imagery
  (reserved conceptually for a future, different project).

## Decision Log
- 2026-07-06: Chose muted copper/rust over bright amber or gold — premium/subdued feel over
  high-alert feel, since Waypost is positioned as a serious infra tool, not a consumer product.
- 2026-07-06: Chose Inter/sans-serif everywhere over mixed sans+monospace, for visual
  consistency; numeric alignment handled via `tabular-nums` instead of a font change.
