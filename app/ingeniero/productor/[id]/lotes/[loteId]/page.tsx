'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../../../lib/supabase'
import { useRouter, useParams } from 'next/navigation'

interface Labor {
  id: string
  fecha: string
  tipo: string
  productos: any[]
  observaciones: string
}

export default function CuadernoCampo() {
  const router = useRouter()
  const params = useParams()
  const loteId = params.loteId as string
  const empresaId = params.id as string
  const [lote, setLote] = useState<any>(null)
  const [labores, setLabores] = useState<Labor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: lt } = await supabase
        .from('lotes').select('*').eq('id', loteId).single()
      setLote(lt)
      const { data: lb } = await supabase
        .from('lote_labores').select('*')
        .eq('lote_id', loteId)
        .order('fecha', { ascending: false })
      if (lb) setLabores(lb)
      setLoading(false)
    }
    init()
  }, [loteId])

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
          <div style={{ color: '#d4a017', fontWeight: '700', fontSize: '15px' }}>{lote?.nombre}</div>
          <div style={{ color: '#6a5f40', fontSize: '11px' }}>
            {lote?.cultivo} · {lote?.hectareas} has · {labores.length} labores
          </div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {labores.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ color: '#3a2e00', fontSize: '32px', marginBottom: '8px' }}>📋</div>
            <div style={{ color: '#6a5f40', fontSize: '14px' }}>Sin labores registradas</div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {labores.map(l => (
            <div key={l.id} style={{ background: '#141414', border: '1px solid #2a2200',
              borderRadius: '10px', padding: '16px', borderLeft: '3px solid #d4a017' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ background: '#1a1400', border: '1px solid #3a2e00',
                  color: '#d4a017', padding: '3px 10px', borderRadius: '4px',
                  fontSize: '11px', textTransform: 'uppercase' }}>{l.tipo}</span>
                <span style={{ color: '#a09070', fontSize: '12px' }}>
                  {new Date(l.fecha + 'T12:00:00').toLocaleDateString('es-AR')}
                </span>
              </div>
              {l.productos && l.productos.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {l.productos.map((p: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
                      padding: '4px 0', borderBottom: '0.5px solid #1a1400' }}>
                      <span style={{ color: '#f5f0e8', fontSize: '13px' }}>{p.nombre}</span>
                      <span style={{ color: '#d4a017', fontSize: '13px', fontWeight: '600' }}>
                        {p.dosis} {p.unidad}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {l.observaciones && (
                <div style={{ marginTop: '8px', color: '#6a5f40', fontSize: '12px',
                  fontStyle: 'italic' }}>{l.observaciones}</div>
              )}
            </div>
          ))}
        </div>

        <button onClick={() => router.push(`/ingeniero/aplicacion?empresa=${empresaId}`)}
          style={{ width: '100%', background: '#d4a017', color: '#0a0a0a',
            padding: '16px', borderRadius: '10px', border: 'none',
            fontWeight: '700', fontSize: '15px', cursor: 'pointer', marginTop: '20px' }}>
          + Nueva Aplicación
        </button>
      </div>
    </main>
  )
}
