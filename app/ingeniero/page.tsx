'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

interface Empresa {
  id: string
  nombre: string
  localidad: string
  provincia: string
}

export default function IngenieroDashboard() {
  const router = useRouter()
  const [ingeniero, setIngeniero] = useState<any>(null)
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: ing } = await supabase
        .from('ingenieros').select('*').eq('id', user.id).single()
      setIngeniero(ing)

      const { data: vinc } = await supabase
        .from('vinculaciones')
        .select('empresa_id, empresas(*)')
        .eq('profesional_id', user.id)

      if (vinc) setEmpresas(vinc.map((v: any) => v.empresas).filter(Boolean))
      setLoading(false)
    }
    init()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex',
      alignItems: 'center', justifyContent: 'center', color: '#d4a017',
      fontFamily: 'Inter, sans-serif' }}>
      Cargando...
    </div>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#111', borderBottom: '1px solid #2a2200',
        padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="32" height="32" viewBox="0 0 56 56">
            <polygon points="28,3 51,16 51,40 28,53 5,40 5,16"
              fill="#1a1400" stroke="#d4a017" strokeWidth="2"/>
            <text x="28" y="33" textAnchor="middle"
              fontSize="14" fontWeight="700" fill="#d4a017" fontFamily="Inter">AG</text>
          </svg>
          <span style={{ color: '#d4a017', fontWeight: '700', fontSize: '15px' }}>AgroGestión Pro</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#a09070', fontSize: '13px' }}>{ingeniero?.nombre}</span>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
            style={{ background: 'transparent', border: '1px solid #3a2e00',
              color: '#6a5f40', padding: '6px 12px', borderRadius: '6px',
              fontSize: '12px', cursor: 'pointer' }}>
            Salir
          </button>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ color: '#a09070', fontSize: '12px', letterSpacing: '1px',
            textTransform: 'uppercase' }}>Mis Productores</span>
          <span style={{ color: '#d4a017', fontSize: '12px', background: '#1a1400',
            border: '1px solid #3a2e00', padding: '4px 12px', borderRadius: '6px' }}>
            Campaña 2026/27
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '14px', marginBottom: '24px' }}>
          {empresas.length === 0 && (
            <p style={{ color: '#6a5f40', fontSize: '14px' }}>
              No tenés productores vinculados aún.
            </p>
          )}
          {empresas.map(e => (
            <div key={e.id} onClick={() => router.push(`/ingeniero/productor/${e.id}`)}
              style={{ background: '#141414', border: '1px solid #2a2200',
                borderRadius: '10px', padding: '16px', cursor: 'pointer',
                borderTop: '2px solid #d4a017', position: 'relative', overflow: 'hidden' }}>
              <svg style={{ position: 'absolute', bottom: '-8px', right: '-8px', opacity: 0.06 }}
                width="60" height="60" viewBox="0 0 60 60">
                <polygon points="30,5 52,17 52,43 30,55 8,43 8,17" fill="none" stroke="#d4a017" strokeWidth="1"/>
              </svg>
              <div style={{ color: '#f5f0e8', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                {e.nombre}
              </div>
              <div style={{ color: '#6a5f40', fontSize: '11px' }}>
                {e.localidad}{e.provincia ? `, ${e.provincia}` : ''}
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => router.push('/ingeniero/aplicacion')}
          style={{ width: '100%', background: '#d4a017', color: '#0a0a0a',
            padding: '16px', borderRadius: '10px', border: 'none',
            fontWeight: '700', fontSize: '15px', cursor: 'pointer', marginBottom: '10px' }}>
          + Nueva Aplicación
        </button>

        <button onClick={() => router.push('/ingeniero/recorrida')}
          style={{ width: '100%', background: 'transparent', color: '#d4a017',
            padding: '12px', borderRadius: '10px', border: '1px solid #3a2e00',
            fontWeight: '500', fontSize: '13px', cursor: 'pointer' }}>
          Exportar Hoja de Recorrida
        </button>
      </div>
    </main>
  )
}
