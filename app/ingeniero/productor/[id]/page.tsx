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
  const [totalHas, setTotalHas] = useState(0)

  useEffect(() => {
    const init = async () => {
      const { data: emp } = await supabase
        .from('empresas').select('*').eq('id', empresaId).single()
      setEmpresa(emp)

      const { data: campana } = await supabase
        .from('campanas')
        .select('id')
        .eq('nombre', '2026/2027')
        .eq('empresa_id', empresaId)
        .single()

      const { data: lts } = await supabase
        .from('lotes').select('*')
        .eq('empresa_id', empresaId)
        .eq('campana_id', campana?.id)
        .order('nombre')

      if (lts) {
        setLotes(lts)
        setTotalHas(lts.reduce((a, l) => a + (l.hectareas || 0), 0))
      }
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
        <div style={{ flex: 1 }}>
          <div style={{ color: '#d4a017', fontWeight: '700', fontSize: '15px' }}>
            {empresa?.nombre}
          </div>
          <div style={{ color: '#6a5f40', fontSize: '11px' }}>
            {lotes.length} lotes · {totalHas.toFixed(0)} has · Campaña 2026/27
          </div>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '14px', marginBottom: '24px' }}>
          {lotes.map(l => (
            <div key={l.id}
              style={{ background: '#141414', border: '1px solid #2a2200',
                borderRadius: '10px', padding: '16px', cursor: 'pointer',
                borderTop: '2px solid #d4a017', position: 'relative', overflow: 'hidden' }}>
              <svg style={{ position: 'absolute', bottom: '-8px', right: '-8px', opacity: 0.06 }}
                width="60" height="60" viewBox="0 0 60 60">
                <polygon points="30,5 52,17 52,43 30,55 8,43 8,17" fill="none" stroke="#d4a017" strokeWidth="1"/>
              </svg>
              <div style={{ color: '#f5f0e8', fontWeight: '600', fontSize: '14px', marginBottom: '6px' }}>
                {l.nombre}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ background: '#1a1400', border: '1px solid #3a2e00',
                  color: '#d4a017', padding: '3px 8px', borderRadius: '4px',
                  fontSize: '11px', textTransform: 'uppercase' }}>
                  {l.cultivo}
                </div>
                <div style={{ color: '#d4a017', fontWeight: '700', fontSize: '15px' }}>
                  {l.hectareas} has
                </div>
              </div>
            </div>
          ))}

          <div onClick={() => router.push(`/ingeniero/productor/${empresaId}/nuevo-lote`)}
            style={{ background: '#141414', border: '1px dashed #2a2200',
              borderRadius: '10px', padding: '16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minHeight: '90px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#3a2e00', fontSize: '24px', marginBottom: '4px' }}>+</div>
              <div style={{ color: '#5a5040', fontSize: '12px' }}>Agregar lote</div>
            </div>
          </div>
        </div>

        <button onClick={() =>
