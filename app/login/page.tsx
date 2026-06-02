'use client'

import { useState } from 'react'
import { ALUMOSGradientLogo } from '@/components/ALUMOSGradientLogo'
import { createClient } from '@/lib/supabase/browser'

const GRADIENT = 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #7C3AED 100%)'

function OAuthButton({
  onClick,
  loading,
  logo,
  label,
}: {
  onClick: () => void
  loading: boolean
  logo: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '13px 20px',
        fontSize: 15,
        fontWeight: 600,
        color: '#1b1b1d',
        background: '#fff',
        border: '1.5px solid #E2E8F0',
        borderRadius: 12,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#7C3AED'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(124,58,237,0.12)'
        }
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'
        ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
      }}
    >
      {logo}
      <span>{loading ? 'Redirecting…' : label}</span>
    </button>
  )
}

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function MicrosoftLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <rect x="1" y="1" width="10.5" height="10.5" fill="#F25022"/>
      <rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00"/>
      <rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF"/>
      <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900"/>
    </svg>
  )
}

export default function LoginPage() {
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'azure' | null>(null)
  const [error, setError] = useState('')

  const signIn = async (provider: 'google' | 'azure') => {
    setLoadingProvider(provider)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoadingProvider(null)
    }
    // On success Supabase redirects the browser — no state cleanup needed
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#fcf8fa',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '24px',
      }}
    >
      {/* Background gradient blobs */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', left: '-5%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo + tagline */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <ALUMOSGradientLogo iconSize={56} />
        <p style={{ marginTop: 16, fontSize: 15, color: '#64748b', letterSpacing: '0.01em' }}>
          A Brighter Path Through Every Class.
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #E2E8F0',
        borderRadius: 24,
        padding: '40px 44px',
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1b1b1d', margin: '0 0 6px' }}>
          Sign in to Alumos
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 28px' }}>
          Use your university account to continue.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <OAuthButton
            onClick={() => signIn('google')}
            loading={loadingProvider === 'google'}
            logo={<GoogleLogo />}
            label="Continue with Google"
          />
          <OAuthButton
            onClick={() => signIn('azure')}
            loading={loadingProvider === 'azure'}
            logo={<MicrosoftLogo />}
            label="Continue with Microsoft"
          />
        </div>

        {error && (
          <p style={{ fontSize: 13, color: '#EF4444', marginTop: 16, textAlign: 'center' }}>
            {error}
          </p>
        )}

        <div style={{ margin: '28px 0 0', borderTop: '1px solid #F1F5F9', paddingTop: 20 }}>
          <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
            By signing in you agree to Alumos&apos;s terms of service.
            Your university credentials are never stored by Alumos.
          </p>
        </div>
      </div>

      {/* Gradient accent line at bottom of card area */}
      <div style={{
        marginTop: 32,
        width: 48, height: 3, borderRadius: 2,
        background: GRADIENT,
      }} />

      <p style={{ marginTop: 16, fontSize: 12, color: '#94a3b8' }}>
        © 2026 Alumos · All rights reserved
      </p>
    </div>
  )
}
