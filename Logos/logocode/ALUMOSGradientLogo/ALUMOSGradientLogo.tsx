/**
 * ALUMOSGradientLogo
 *
 * The finalized logo lockup: ALogoTransBack icon + "LUMOS" in Orbitron,
 * baseline-aligned, with the gradient matched to the A icon.
 *
 * Values locked in from /proto/logo prototype session.
 *
 * Props:
 *   iconSize  — icon height in px (default 36). Text scales proportionally.
 *   className — forwarded to the outer wrapper div
 */

import Image from 'next/image'

// Orbitron cap-height ratio ≈ 0.70
// fontSize = iconSize * 0.77 / 0.70
// At iconSize=36 → fontSize ≈ 2.475rem
const CAP_RATIO = 0.77
const ORBITRON_CAP_HEIGHT_RATIO = 0.70

const GRADIENT = 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #7C3AED 100%)'

interface ALUMOSGradientLogoProps {
  iconSize?: number
  className?: string
}

export function ALUMOSGradientLogo({
  iconSize = 36,
  className,
}: ALUMOSGradientLogoProps) {
  const fontSize = `${(iconSize * CAP_RATIO / ORBITRON_CAP_HEIGHT_RATIO / 16).toFixed(3)}rem`

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'flex-end',
        gap: 'calc(0.4rem - 1px)',
      }}
    >
      <Image
        src="/alogo-trans.png"
        alt="ALUMOS"
        width={iconSize}
        height={iconSize}
        style={{ display: 'block', objectFit: 'contain', flexShrink: 0 }}
      />
      <span
        style={{
          fontFamily: "'Orbitron', system-ui",
          fontSize,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          background: GRADIENT,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1,
          display: 'block',
          transform: 'translateY(1px)',
          marginLeft: '-1px',
        }}
      >
        LUMOS
      </span>
    </div>
  )
}
