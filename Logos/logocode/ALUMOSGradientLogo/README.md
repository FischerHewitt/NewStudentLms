# ALUMOSGradientLogo

Finalized logo lockup component. Decided via `/proto/logo` prototype session.

## Decision

- **Icon**: `ALogoTransBack.png` (transparent background) → served as `/alogo-trans.png`
- **Font**: Orbitron 600 (load via Google Fonts or next/font)
- **Cap-height**: 77% of icon height (`fontSize = iconSize * 0.77 / 0.70`)
- **Letter-spacing**: 0.12em
- **Alignment**: `flex-end` (baseline-aligned) with `translateY(2px)` nudge down
- **Gap**: 0.4rem, with `marginLeft: -1px` to tighten the L toward the A
- **Gradient**: `135deg, #F59E0B → #EC4899 → #7C3AED`

## Usage

```tsx
import { ALUMOSGradientLogo } from '@/Logos/logocode/ALUMOSGradientLogo/ALUMOSGradientLogo'

// Sidebar (26px icon)
<ALUMOSGradientLogo iconSize={26} />

// Header (28px icon)
<ALUMOSGradientLogo iconSize={28} />

// Landing page (36px icon — default)
<ALUMOSGradientLogo />
```

## Font loading

Orbitron must be loaded. Either add to `app/layout.tsx`:

```tsx
import { Orbitron } from 'next/font/google'
const orbitron = Orbitron({ subsets: ['latin'], weight: ['600'], variable: '--font-orbitron' })
```

Or keep the Google Fonts `<link>` tag.
