'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useRouter, useParams } from 'next/navigation'

interface Lote { id: string; nombre: string; cultivo: string; hectareas: number }

export default function LotesProductor() {
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
      const { data: campana } = await supabase
        .from('campanas').select('id')
        .eq('nombre', '2026/2027').eq('empresa_id', empresaId).single()
      const { data: lts } = await supabase
        .from('lotes').select('*')
        .eq('empresa_id', empresaId)
        .eq('campana_id', campana?.id)
        .order('nombre')
      if (lts) setLotes(lts)
      setLoading(false)
    }
    init()
  }, [empresaId])

  const totalHas = lotes.reduce((a, l) => a + (Number(l.hectareas) || 0), 0)

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex',
      alignItems: 'center', justifyContent: 'center', color: '#d4a017',
      fontFamily: 'Inter, sans-serif' }}>Cargando...</div>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#111', borderBottom: '1px solid #2a2200',
        padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => router.back()}
          style={{ background: 'transparent', border: 'none', color: '#d4a017',
            fontSize: '20px', cursor: 'pointer' }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#d4a017', fontWeight: '700', fontSize: '15px' }}>
            {empresa?.nombre} — Lotes
          </div>
          <div style={{ color: '#6a5f40', fontSize: '11px' }}>
            {lotes.length} lotes · {totalHas.toFixed(0)} has
          </div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '14px', marginBottom: '20px' }}>
          {lotes.map(l => {
  const cultivoColor: any = {
    'soja': '#22c55e', 'soja 1º': '#22c55e', 'soja 1°': '#22c55e',
    'soja 2º': '#86efac', 'soja 2°': '#86efac',
    'maiz': '#f59e0b', 'maíz': '#f59e0b', 'maiz 1º': '#f59e0b', 'maíz 1º': '#f59e0b',
    'maiz 2º': '#fcd34d', 'maíz 2º': '#fcd34d',
    'trigo': '#d4a017',
    'girasol': '#3b82f6',
    'sorgo': '#ef4444',
    'cebada': '#a78bfa',
  }
  const color = cultivoColor[(l.cultivo || '').toLowerCase()] || '#6a5f40'
  return (
    <div key={l.id}
      onClick={() => router.push(`/ingeniero/productor/${empresaId}/lotes/${l.id}`)}
      style={{ background: '#141414', border: `1px solid ${color}44`,
        borderRadius: '10px', padding: '16px', cursor: 'pointer',
        borderTop: `3px solid ${color}`, position: 'relative', overflow: 'hidden' }}>
      <svg style={{ position: 'absolute', bottom: '-8px', right: '-8px', opacity: 0.06 }}
        width="60" height="60" viewBox="0 0 60 60">
        <polygon points="30,5 52,17 52,43 30,55 8,43 8,17"
          fill="none" stroke="#d4a017" strokeWidth="1"/>
      </svg>
      <div style={{ color: '#f5f0e8', fontWeight: '700', fontSize: '14px',
        marginBottom: '10px', textAlign: 'center' }}>
        {l.nombre}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ background: `${color}22`, border: `1px solid ${color}66`,
          color: color, padding: '3px 8px', borderRadius: '4px',
          fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>
          {l.cultivo}
        </div>
        <div style={{ color: color, fontWeight: '700', fontSize: '15px' }}>
          {l.hectareas} has
        </div>
      </div>
    </div>
  )
})}
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
