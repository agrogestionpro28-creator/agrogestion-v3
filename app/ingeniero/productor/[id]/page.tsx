'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter, useParams } from 'next/navigation'

interface Lote {
  id: string
  nombre: string
  cultivo: string
  hectareas: number
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

  const cultivoStats = lotes.reduce((acc: any, l) => {
    const c = (l.cultivo || 'Sin cultivo').toUpperCase()
    if (!acc[c]) acc[c] = 0
    acc[c] += Number(l.hectareas) || 0
    return acc
  }, {})

  const cultivoColors: any = {
    'SOJA': '#22c55e', 'SOJA 1º': '#22c55e', 'SOJA 2º': '#86efac',
    'MAIZ': '#f59e0b', 'MAÍZ': '#f59e0b', 'MAIZ 1º': '#f59e0b', 'MAÍZ 1º': '#f59e0b',
    'TRIGO': '#d4a017', 'GIRASOL': '#ef4444', 'SORGO': '#8b5cf6'
  }

  const getColor = (cultivo: string) => cultivoColors[cultivo.toUpperCase()] || '#6a5f40'

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
          <div style={{ color: '#d4a017', fontWeight: '700', fontSize: '15px' }}>{empresa?.nombre}</div>
          <div style={{ color: '#6a5f40', fontSize: '11px' }}>{empresa?.localidad} · Campaña 2026/27</div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: '#141414', border: '1px solid #2a2200', borderRadius: '10px', padding: '16px' }}>
            <div style={{ color: '#6a5f40', fontSize: '11px', marginBottom: '4px' }}>Hectáreas</div>
            <div style={{ color: '#d4a017', fontSize: '28px', fontWeight: '700' }}>{totalHas.toFixed(0)}</div>
            <div style={{ color: '#6a5f40', fontSize: '11px' }}>ha · {lotes.length} lotes</div>
          </div>
          <div style={{ background: '#141414', border: '1px solid #2a2200', borderRadius: '10px', padding: '16px' }}>
            <div style={{ color: '#6a5f40', fontSize: '11px', marginBottom: '4px' }}>Campaña</div>
            <div style={{ color: '#f5f0e8', fontSize: '18px', fontWeight: '700' }}>2026/27</div>
            <div style={{ color: '#6a5f40', fontSize: '11px' }}>activa</div>
          </div>
        </div>

        <div style={{ background: '#141414', border: '1px solid #2a2200', borderRadius: '10px',
          padding: '16px', marginBottom: '16px' }}>
          <div style={{ color: '#a09070', fontSize: '11px', letterSpacing: '1px',
            textTransform: 'uppercase', marginBottom: '12px' }}>Distribución de cultivos</div>
          {Object.entries(cultivoStats).map(([cultivo, has]: any) => (
            <div key={cultivo} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#f5f0e8', fontSize: '12px' }}>{cultivo}</span>
                <span style={{ color: '#a09070', fontSize: '12px' }}>
                  {((has / totalHas) * 100).toFixed(0)}% · {has} ha
                </span>
              </div>
              <div style={{ background: '#1a1400', borderRadius: '4px', height: '6px' }}>
                <div style={{ background: getColor(cultivo), borderRadius: '4px', height: '6px',
                  width: `${(has / totalHas) * 100}%` }}/>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          {Object.keys(cultivoStats).map(cultivo => (
            <div key={cultivo} style={{ background: '#141414', border: `1px solid ${getColor(cultivo)}33`,
              borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%',
                background: getColor(cultivo), flexShrink: 0 }}/>
              <span style={{ color: '#f5f0e8', fontSize: '13px', fontWeight: '500' }}>{cultivo}</span>
            </div>
          ))}
        </div>

        <button onClick={() => router.push(`/ingeniero/productor/${empresaId}/lotes`)}
          style={{ width: '100%', background: '#1a1400', color: '#d4a017',
            padding: '14px', borderRadius: '10px', border: '1px solid #3a2e00',
            fontWeight: '600', fontSize: '14px', cursor: 'pointer', marginBottom: '10px' }}>
          🌱 Mis Lotes
        </button>

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
