import Link from 'next/link'

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg width="56" height="56" viewBox="0 0 56 56" style={{ marginBottom: '16px' }}>
          <polygon points="28,3 51,16 51,40 28,53 5,40 5,16"
            fill="#1a1400" stroke="#d4a017" strokeWidth="2"/>
          <text x="28" y="33" textAnchor="middle"
            fontSize="14" fontWeight="700" fill="#d4a017" fontFamily="Inter">AG</text>
        </svg>
        <h1 style={{ color: '#d4a017', fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
          AgroGestión Pro
        </h1>
        <p style={{ color: '#6a5f40', fontSize: '14px', marginBottom: '32px' }}>
          Sistema de gestión agronómica
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '280px' }}>
          <Link href="/login" style={{
            background: '#d4a017',
            color: '#0a0a0a',
            padding: '14px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '15px'
          }}>
            Iniciar sesión
          </Link>
          <Link href="/registro" style={{
            background: 'transparent',
            color: '#d4a017',
            padding: '14px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '15px',
            border: '1px solid #3a2e00'
          }}>
            Registrarse como ingeniero
          </Link>
        </div>
      </div>
    </main>
  )
}