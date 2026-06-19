'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

interface Productor {
  id: string
  nombre: string
  localidad: string
  provincia: string
}

interface Vinculacion {
  productor_id: string
  productores: Productor
}

export default function IngenieroDashboard() {
  const router = useRouter()
  const [ingeniero, setIngeniero] = useState<any>(null)
  const [productores, setProductores] = useState<Productor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: ing } = await supabase
        .from('ingenieros').select('*').eq('id', user.id).single()
      setIngeniero(ing)
      const { data: vinc } = await supabase
        .from('ing_vinculaciones').select('productor_id, productores(*)')
.eq('ingeniero_id', user.id)
      if (vinc) setProductores(vinc.map((v: any) => v.productores))
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
          <span style={{ color: '#a09070', fontSize: '13px' }}>
            {ingeniero?.nombre}
          </span>
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
            Campaña 2025/26
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '14px', marginBottom: '24px' }}>
          {productores.length === 0 && (
            <p style={{ color: '#6a5f40', fontSize: '14px' }}>
              No tenés productores vinculados aún.
            </p>
          )}
          {productores.map(p => (
            <div key={p.id} onClick={() => router.push(`/ingeniero/productor/${p.id}`)}
              style={{ background: '#141414', border: '1px solid #2a2200',
                borderRadius: '10px', padding: '16px', cursor: 'pointer',
                borderTop: '2px solid #d4a017' }}>
              <div style={{ color: '#f5f0e8', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                {p.nombre}
              </div>
              <div style={{ color: '#6a5f40', fontSize: '11px', marginBottom: '12px' }}>
                {p.localidad}, {p.provincia}
              </div>
            </div>
          ))}
          <div onClick={() => router.push('/ingeniero/nuevo-productor')}
            style={{ background: '#141414', border: '1px dashed #2a2200',
              borderRadius: '10px', padding: '16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minHeight: '80px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#3a2e00', fontSize: '24px', marginBottom: '4px' }}>+</div>
              <div style={{ color: '#5a5040', fontSize: '12px' }}>Vincular productor</div>
            </div>
          </div>
        </div>

        <button onClick={() => router.push('/ingeniero/aplicacion')}
          style={{ width: '100%', background: '#d4a017', color: '#0a0a0a',
            padding: '16px', borderRadius: '10px', border: 'none',
            fontWeight: '700', fontSize: '15px', cursor: 'pointer', marginBottom: '10px' }}>
          + Nueva Aplicación
        </button>
      </div>
    </main>
  )
}
