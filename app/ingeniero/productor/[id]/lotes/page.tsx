'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../../../lib/supabase'
import { useRouter, useParams } from 'next/navigation'

interface Labor { id: string; fecha: string; tipo: string; productos: any[]; observaciones: string }
interface Fertilizacion { id?: string; fecha: string; producto: string; dosis: string; unidad: string; metodo: string }
interface Cosecha { id?: string; fecha: string; humedad: string; rendimiento: string; destino: string; observaciones: string }

export default function CuadernoCampo() {
  const router = useRouter()
  const params = useParams()
  const loteId = params.loteId as string
  const empresaId = params.id as string
  const [lote, setLote] = useState<any>(null)
  const [labores, setLabores] = useState<Labor[]>([])
  const [fertilizaciones, setFertilizaciones] = useState<Fertilizacion[]>([])
  const [cosecha, setCosecha] = useState<Cosecha>({ fecha: '', humedad: '', rendimiento: '', destino: '', observaciones: '' })
  const [editandoLote, setEditandoLote] = useState(false)
  const [loteEdit, setLoteEdit] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'datos'|'aplicaciones'|'fertilizacion'|'cosecha'>('datos')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: lt } = await supabase.from('lotes').select('*').eq('id', loteId).single()
      setLote(lt)
      setLoteEdit(lt || {})
      const { data: lb } = await supabase.from('lote_labores').select('*')
        .eq('lote_id', loteId).order('fecha', { ascending: false })
      if (lb) setLabores(lb)
      const { data: fert } = await supabase.from('lote_fertilizaciones').select('*')
        .eq('lote_id', loteId).order('fecha')
      if (fert) setFertilizaciones(fert)
      const { data: cos } = await supabase.from('lote_cosecha').select('*')
        .eq('lote_id', loteId).single()
      if (cos) setCosecha(cos)
      setLoading(false)
    }
    init()
  }, [loteId])

  const guardarLote = async () => {
    setGuardando(true)
    await supabase.from('lotes').update({
      variedad: loteEdit.variedad,
      fecha_siembra_real: loteEdit.fecha_siembra_real || null,
      fecha_cosecha_real: loteEdit.fecha_cosecha_real || null,
      sistema_produccion: loteEdit.sistema_produccion,
      objetivo_rinde: loteEdit.objetivo_rinde || null,
      ubicacion: loteEdit.ubicacion,
      obs_generales: loteEdit.obs_generales,
      cultivo: loteEdit.cultivo,
      hectareas: loteEdit.hectareas
    }).eq('id', loteId)
    setLote({ ...lote, ...loteEdit })
    setEditandoLote(false)
    setGuardando(false)
  }

  const agregarFertilizacion = () =>
    setFertilizaciones([...fertilizaciones, { fecha: '', producto: '', dosis: '', unidad: 'kg/ha', metodo: '' }])

  const guardarFertilizacion = async (f: Fertilizacion, i: number) => {
    if (f.id) {
      await supabase.from('lote_fertilizaciones').update(f).eq('id', f.id)
    } else {
      const { data } = await supabase.from('lote_fertilizaciones').insert({ ...f, lote_id: loteId }).select().single()
      if (data) {
        const nuevas = [...fertilizaciones]
        nuevas[i] = data
        setFertilizaciones(nuevas)
      }
    }
  }

  const guardarCosecha = async () => {
    setGuardando(true)
    if (cosecha.id) {
      await supabase.from('lote_cosecha').update(cosecha).eq('id', cosecha.id)
    } else {
      const { data } = await supabase.from('lote_cosecha').insert({ ...cosecha, lote_id: loteId }).select().single()
      if (data) setCosecha(data)
    }
    setGuardando(false)
  }

  const inputStyle: any = {
    background: '#1a1400', border: '1px solid #2a2200', borderRadius: '6px',
    padding: '8px 12px', color: '#f5f0e8', fontSize: '13px', outline: 'none', width: '100%'
  }

  const labelStyle: any = {
    color: '#a09070', fontSize: '10px', textTransform: 'uppercase' as const,
    letterSpacing: '0.5px', display: 'block', marginBottom: '4px'
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex',
      alignItems: 'center', justifyContent: 'center', color: '#d4a017', fontFamily: 'Inter, sans-serif' }}>
      Cargando...
    </div>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#111', borderBottom: '1px solid #2a2200',
        padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => router.back()}
          style={{ background: 'transparent', border: 'none', color: '#d4a017', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#d4a017', fontWeight: '700', fontSize: '15px' }}>{lote?.nombre}</div>
          <div style={{ color: '#6a5f40', fontSize: '11px' }}>{lote?.cultivo} · {lote?.hectareas} has · Campaña 2026/27</div>
        </div>
        <button onClick={() => router.push(`/ingeniero/aplicacion?empresa=${empresaId}`)}
          style={{ background: '#d4a017', border: 'none', color: '#0a0a0a',
            padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
          + Aplicación
        </button>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #2a2200', background: '#111' }}>
        {(['datos', 'aplicaciones', 'fertilizacion', 'cosecha'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, padding: '12px 4px', background: 'transparent',
              border: 'none', borderBottom: tab === t ? '2px solid #d4a017' : '2px solid transparent',
              color: tab === t ? '#d4a017' : '#6a5f40', fontSize: '11px', cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {t === 'datos' ? 'Datos' : t === 'aplicaciones' ? 'Aplicaciones' : t === 'fertilizacion' ? 'Fertilización' : 'Cosecha'}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px' }}>

        {/* TAB DATOS */}
        {tab === 'datos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: '#a09070', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Datos del lote</span>
              <button onClick={() => editandoLote ? guardarLote() : setEditandoLote(true)}
                style={{ background: editandoLote ? '#d4a017' : 'transparent',
                  border: '1px solid #d4a017', color: editandoLote ? '#0a0a0a' : '#d4a017',
                  padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                {guardando ? 'Guardando...' : editandoLote ? '💾 Guardar' : '✏️ Editar'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Cultivo', key: 'cultivo' },
                { label: 'Variedad / Híbrido', key: 'variedad' },
                { label: 'Superficie (has)', key: 'hectareas' },
                { label: 'Sistema de producción', key: 'sistema_produccion' },
                { label: 'Ubicación', key: 'ubicacion' },
                { label: 'Objetivo de rinde (qq/ha)', key: 'objetivo_rinde' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  {editandoLote ? (
                    <input value={loteEdit[key] || ''} onChange={e => setLoteEdit({ ...loteEdit, [key]: e.target.value })}
                      style={inputStyle} />
                  ) : (
                    <div style={{ color: '#f5f0e8', fontSize: '14px', padding: '8px 0' }}>
                      {lote?.[key] || <span style={{ color: '#3a2e00' }}>—</span>}
                    </div>
                  )}
                </div>
              ))}

              <div>
                <label style={labelStyle}>Fecha siembra</label>
                {editandoLote ? (
                  <input type="date" value={loteEdit.fecha_siembra_real || ''}
                    onChange={e => setLoteEdit({ ...loteEdit, fecha_siembra_real: e.target.value })}
                    style={inputStyle} />
                ) : (
                  <div style={{ color: '#f5f0e8', fontSize: '14px', padding: '8px 0' }}>
                    {lote?.fecha_siembra_real ? new Date(lote.fecha_siembra_real + 'T12:00:00').toLocaleDateString('es-AR') : <span style={{ color: '#3a2e00' }}>—</span>}
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Fecha cosecha</label>
                {editandoLote ? (
                  <input type="date" value={loteEdit.fecha_cosecha_real || ''}
                    onChange={e => setLoteEdit({ ...loteEdit, fecha_cosecha_real: e.target.value })}
                    style={inputStyle} />
                ) : (
                  <div style={{ color: '#f5f0e8', fontSize: '14px', padding: '8px 0' }}>
                    {lote?.fecha_cosecha_real ? new Date(lote.fecha_cosecha_real + 'T12:00:00').toLocaleDateString('es-AR') : <span style={{ color: '#3a2e00' }}>—</span>}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <label style={labelStyle}>Observaciones generales</label>
              {editandoLote ? (
                <textarea value={loteEdit.obs_generales || ''} onChange={e => setLoteEdit({ ...loteEdit, obs_generales: e.target.value })}
                  style={{ ...inputStyle, minHeight: '80px', resize: 'none' }} />
              ) : (
                <div style={{ color: lote?.obs_generales ? '#f5f0e8' : '#3a2e00', fontSize: '14px', padding: '8px 0' }}>
                  {lote?.obs_generales || '—'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB APLICACIONES */}
        {tab === 'aplicaciones' && (
          <div>
            <p style={{ color: '#a09070', fontSize: '12px', textTransform: 'uppercase',
              letterSpacing: '1px', marginBottom: '16px' }}>
              {labores.length} aplicaciones registradas
            </p>
            {labores.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#3a2e00' }}>Sin aplicaciones</div>
            )}
            {labores.map(l => (
              <div key={l.id} style={{ background: '#141414', border: '1px solid #2a2200',
                borderRadius: '10px', padding: '14px', marginBottom: '10px', borderLeft: '3px solid #d4a017' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ background: '#1a1400', border: '1px solid #3a2e00', color: '#d4a017',
                    padding: '2px 8px', borderRadius: '4px', fontSize: '10px', textTransform: 'uppercase' }}>
                    {l.tipo}
                  </span>
                  <span style={{ color: '#a09070', fontSize: '12px' }}>
                    {new Date(l.fecha + 'T12:00:00').toLocaleDateString('es-AR')}
                  </span>
                </div>
                {l.productos?.map((p: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
                    padding: '4px 0', borderBottom: '0.5px solid #1a1400' }}>
                    <span style={{ color: '#f5f0e8', fontSize: '13px' }}>{p.nombre}</span>
                    <span style={{ color: '#d4a017', fontSize: '13px', fontWeight: '600' }}>{p.dosis} {p.unidad}</span>
                  </div>
                ))}
                {l.observaciones && <div style={{ color: '#6a5f40', fontSize: '12px', marginTop: '6px', fontStyle: 'italic' }}>{l.observaciones}</div>}
              </div>
            ))}
          </div>
        )}

        {/* TAB FERTILIZACION */}
        {tab === 'fertilizacion' && (
          <div>
            <p style={{ color: '#a09070', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
              Fertilizaciones
            </p>
            {fertilizaciones.map((f, i) => (
              <div key={i} style={{ background: '#141414', border: '1px solid #2a2200',
                borderRadius: '10px', padding: '14px', marginBottom: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <div>
                    <label style={labelStyle}>Fecha</label>
                    <input type="date" value={f.fecha || ''} style={inputStyle}
                      onChange={e => { const n = [...fertilizaciones]; n[i].fecha = e.target.value; setFertilizaciones(n) }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Producto</label>
                    <input value={f.producto || ''} style={inputStyle} placeholder="Ej: Urea"
                      onChange={e => { const n = [...fertilizaciones]; n[i].producto = e.target.value; setFertilizaciones(n) }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Dosis</label>
                    <input value={f.dosis || ''} style={inputStyle} placeholder="100"
                      onChange={e => { const n = [...fertilizaciones]; n[i].dosis = e.target.value; setFertilizaciones(n) }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Unidad</label>
                    <select value={f.unidad} style={inputStyle}
                      onChange={e => { const n = [...fertilizaciones]; n[i].unidad = e.target.value; setFertilizaciones(n) }}>
                      <option>kg/ha</option>
                      <option>lt/ha</option>
                      <option>u/ha</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <label style={labelStyle}>Método</label>
                  <input value={f.metodo || ''} style={inputStyle} placeholder="Ej: A la siembra, Voleo"
                    onChange={e => { const n = [...fertilizaciones]; n[i].metodo = e.target.value; setFertilizaciones(n) }} />
                </div>
                <button onClick={() => guardarFertilizacion(f, i)}
                  style={{ background: '#d4a017', border: 'none', color: '#0a0a0a',
                    padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                  💾 Guardar
                </button>
              </div>
            ))}
            <button onClick={agregarFertilizacion}
              style={{ width: '100%', background: 'transparent', color: '#d4a017',
                padding: '12px', borderRadius: '10px', border: '1px dashed #3a2e00',
                fontSize: '13px', cursor: 'pointer' }}>
              + Agregar fertilización
            </button>
          </div>
        )}

        {/* TAB COSECHA */}
        {tab === 'cosecha' && (
          <div>
            <p style={{ color: '#a09070', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
              Datos de cosecha
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              {[
                { label: 'Fecha cosecha', key: 'fecha', type: 'date' },
                { label: 'Humedad (%)', key: 'humedad', type: 'number' },
                { label: 'Rendimiento (qq/ha)', key: 'rendimiento', type: 'number' },
                { label: 'Destino', key: 'destino', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input type={type} value={(cosecha as any)[key] || ''} style={inputStyle}
                    onChange={e => setCosecha({ ...cosecha, [key]: e.target.value })} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Observaciones</label>
              <textarea value={cosecha.observaciones || ''} style={{ ...inputStyle, minHeight: '80px', resize: 'none' }}
                onChange={e => setCosecha({ ...cosecha, observaciones: e.target.value })} />
            </div>
            <button onClick={guardarCosecha}
              style={{ width: '100%', background: '#d4a017', color: '#0a0a0a',
                padding: '14px', borderRadius: '10px', border: 'none',
                fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
              {guardando ? 'Guardando...' : '💾 Guardar cosecha'}
            </button>
          </div>
        )}

      </div>
    </main>
  )
}
