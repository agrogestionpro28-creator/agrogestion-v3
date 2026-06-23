'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter, useParams } from 'next/navigation'

interface Lote {
  id: string
  nombre: string
  cultivo: string
  hectareas: number
  estado: string
}

export default function ProductorDetalle() {
  const router = useRouter()
  const params = useParams()
  const empresaId = params.id as string
  const [empresa, setEmpresa] = useState<any>(null)
  const [lotes, setLotes] = useState<Lote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: emp } = await supabase
        .from('empresas').select('*').eq('id', empresaId).single()
      setEmpresa(emp)
      const { data: lts } = await supabase
        .from('lotes').select('*').eq('empresa_id', empresaId)
        .order('nombre')
      if (lts) setLotes(lts)
      setLoading(false)
    }
    init()
  }, [empresaId])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex',
      alignItems: 'center', justifyContent: 'center', color: '#d4a017',
      fontFamily: 'Inter, sans-serif' }}>Cargando...</div>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#111', borderBottom: '1px solid #2a2200',
        padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => router.push('/ingeniero')}
          style={{ background: 'transparent', border: 'none', color: '#d4a017',
            fontSize: '20px', cursor: 'pointer' }}>←</button>
        <span style={{ color: '#d4a017', fontWeight: '700', fontSize: '15px' }}>
          {empresa?.nombre}
        </span>
      </div>

      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#a09070', fontSize: '12px', letterSpacing: '1px',
            textTransform: 'uppercase' }}>Lotes</span>
          <span style={{ color: '#d4a017', fontSize: '12px' }}>
            {lotes.length} lotes · {lotes.reduce((a, l) => a + (l.hectareas || 0), 0).toFixed(0)} has
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {lotes.map(l => (
            <div key={l.id} style={{ background: '#141414', border: '1px solid #2a2200',
              borderRadius: '10px', padding: '14px 16px', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#f5f0e8', fontWeight: '600', fontSize: '14px' }}>{l.nombre}</div>
                <div style={{ color: '#6a5f40', fontSize: '12px', marginTop: '2px' }}>{l.cultivo}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#d4a017', fontWeight: '600', fontSize: '14px' }}>{l.hectareas} has</div>
                <div style={{ color: '#6a5f40', fontSize: '11px', marginTop: '2px' }}>{l.estado}</div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => router.push(`/ingeniero/aplicacion?empresa=${empresaId}`)}
          style={{ width: '100%', background: '#d4a017', color: '#0a0a0a',
            padding: '16px', borderRadius: '10px', border: 'none',
            fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
          + Nueva Aplicación
        </button>
      </div>
    </main>
  )
}
