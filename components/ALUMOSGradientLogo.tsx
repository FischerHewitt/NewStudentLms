/**
 * ALUMOSGradientLogo
 * Finalized in /proto/logo prototype session.
 * Requires Orbitron font to be loaded (added to app/layout.tsx).
 */
import Image from 'next/image'

const CAP_RATIO = 0.77
const ORBITRON_CAP_HEIGHT_RATIO = 0.70
const GRADIENT = 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #7C3AED 100%)'

interface ALUMOSGradientLogoProps {
  /** Icon height in px. Text scales proportionally. Default 36. */
  iconSize?: number
  className?: string
}

export function ALUMOSGradientLogo({ iconSize = 36, className }: ALUMOSGradientLogoProps) {
  const fontSize = `${(iconSize * CAP_RATIO / ORBITRON_CAP_HEIGHT_RATIO / 16).toFixed(3)}rem`

  return (
    <div
      className={className}
      style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 'calc(0.4rem - 1px)' }}
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
          fontFamily: "var(--font-orbitron, 'Orbitron', system-ui)",
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
