'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos')
    } else {
      router.push('/ingeniero')
    }
    setLoading(false)
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ width: '320px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <svg width="44" height="44" viewBox="0 0 56 56" style={{ marginBottom: '12px' }}>
            <polygon points="28,3 51,16 51,40 28,53 5,40 5,16"
              fill="#1a1400" stroke="#d4a017" strokeWidth="2"/>
            <text x="28" y="33" textAnchor="middle"
              fontSize="14" fontWeight="700" fill="#d4a017" fontFamily="Inter">AG</text>
          </svg>
          <h1 style={{ color: '#d4a017', fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
            Iniciar sesión
          </h1>
          <p style={{ color: '#6a5f40', fontSize: '13px' }}>AgroGestión Pro</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              background: '#141414',
              border: '1px solid #2a2200',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#f5f0e8',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              background: '#141414',
              border: '1px solid #2a2200',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#f5f0e8',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          {error && <p style={{ color: '#e24b4a', fontSize: '13px', margin: '0' }}>{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              background: '#d4a017',
              color: '#0a0a0a',
              padding: '13px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              fontSize: '15px',
              cursor: 'pointer',
              marginTop: '4px'
            }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
          <Link href="/registro" style={{
            color: '#6a5f40',
            fontSize: '13px',
            textAlign: 'center',
            textDecoration: 'none',
            marginTop: '8px'
          }}>
            ¿No tenés cuenta? Registrate
          </Link>
        </div>
      </div>
    </main>
  )
}