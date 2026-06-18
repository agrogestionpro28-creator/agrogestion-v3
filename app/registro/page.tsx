'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Registro() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [matricula, setMatricula] = useState('')
  const [provincia, setProvincia] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegistro = async () => {
    setLoading(true)
    setError('')
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (data.user) {
      const { error: profileError } = await supabase.from('ingenieros').insert({
        id: data.user.id,
        nombre,
        matricula,
        provincia
      })
      if (profileError) { setError(profileError.message); setLoading(false); return }
      router.push('/ingeniero')
    }
    setLoading(false)
  }

  const inputStyle = {
    background: '#141414',
    border: '1px solid #2a2200',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#f5f0e8',
    fontSize: '14px',
    outline: 'none',
    width: '100%'
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      padding: '24px'
    }}>
      <div style={{ width: '320px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <svg width="44" height="44" viewBox="0 0 56 56" style={{ marginBottom: '12px' }}>
            <polygon points="28,3 51,16 51,40 28,53 5,40 5,16"
              fill="#1a1400" stroke="#d4a017" strokeWidth="2"/>
            <text x="28" y="33" textAnchor="middle"
              fontSize="14" fontWeight="700" fill="#d4a017" fontFamily="Inter">AG</text>
          </svg>
          <h1 style={{ color: '#d4a017', fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
            Registro de ingeniero
          </h1>
          <p style={{ color: '#6a5f40', fontSize: '13px' }}>AgroGestión Pro</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="text" placeholder="Nombre completo *" value={nombre}
            onChange={e => setNombre(e.target.value)} style={inputStyle} />
          <input type="email" placeholder="Email *" value={email}
            onChange={e => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Contraseña *" value={password}
            onChange={e => setPassword(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Matrícula (ej: 882-1-1075)" value={matricula}
            onChange={e => setMatricula(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Provincia" value={provincia}
            onChange={e => setProvincia(e.target.value)} style={inputStyle} />

          {error && <p style={{ color: '#e24b4a', fontSize: '13px', margin: '0' }}>{error}</p>}

          <button onClick={handleRegistro} disabled={loading} style={{
            background: '#d4a017',
            color: '#0a0a0a',
            padding: '13px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            fontSize: '15px',
            cursor: 'pointer',
            marginTop: '4px'
          }}>
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>

          <Link href="/login" style={{
            color: '#6a5f40',
            fontSize: '13px',
            textAlign: 'center',
            textDecoration: 'none',
            marginTop: '8px'
          }}>
            ¿Ya tenés cuenta? Iniciá sesión
          </Link>
        </div>
      </div>
    </main>
  )
}