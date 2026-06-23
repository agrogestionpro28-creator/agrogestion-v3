'use client'
import html2canvas from 'html2canvas'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

interface Empresa { id: string; nombre: string }
interface Lote { id: string; nombre: string; cultivo: string; hectareas: number }
interface Producto { nombre: string; dosis: string; unidad: string }

export default function NuevaAplicacion() {
  const router = useRouter()
  const [paso, setPaso] = useState(1)
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [lotes, setLotes] = useState<Lote[]>([])
  const [empresaId, setEmpresaId] = useState('')
  const [empresaNombre, setEmpresaNombre] = useState('')
  const [lotesSeleccionados, setLotesSeleccionados] = useState<Lote[]>([])
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [productos, setProductos] = useState<Producto[]>([{ nombre: '', dosis: '', unidad: 'lt/ha' }])
  const [observaciones, setObservaciones] = useState('')
  const [ingeniero, setIngeniero] = useState<any>(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: ing } = await supabase.from('ingenieros').select('*').eq('id', user.id).single()
      setIngeniero(ing)
      const { data: vinc } = await supabase
        .from('vinculaciones').select('empresa_id').eq('profesional_id', user.id)
      if (vinc) {
        const ids = vinc.map((v: any) => v.empresa_id)
        const { data: emps } = await supabase.from('empresas').select('id, nombre').in('id', ids).order('nombre')
        if (emps) setEmpresas(emps)
      }
    }
    init()
  }, [])

  const seleccionarEmpresa = async (emp: Empresa) => {
    setEmpresaId(emp.id)
    setEmpresaNombre(emp.nombre)
    const { data: campana } = await supabase
      .from('campanas').select('id')
      .eq('nombre', '2026/2027').eq('empresa_id', emp.id).single()
    const { data: lts } = await supabase
      .from('lotes').select('*')
      .eq('empresa_id', emp.id)
      .eq('campana_id', campana?.id)
      .order('nombre')
    if (lts) setLotes(lts)
    setPaso(2)
  }

  const toggleLote = (lote: Lote) => {
    setLotesSeleccionados(prev =>
      prev.find(l => l.id === lote.id)
        ? prev.filter(l => l.id !== lote.id)
        : [...prev, lote]
    )
  }

  const agregarProducto = () =>
    setProductos([...productos, { nombre: '', dosis: '', unidad: 'lt/ha' }])

  const actualizarProducto = (i: number, campo: string, valor: string) => {
    const nuevos = [...productos]
    nuevos[i] = { ...nuevos[i], [campo]: valor }
    setProductos(nuevos)
  }

  const guardarYGenerar = async () => {
    setGuardando(true)
    const { data: { user } } = await supabase.auth.getUser()
    for (const lote of lotesSeleccionados) {
      await supabase.from('lote_labores').insert({
        lote_id: lote.id,
        ingeniero_id: user?.id,
        fecha,
        tipo: 'aplicacion',
        productos: productos.filter(p => p.nombre),
        observaciones
      })
    }
    setPaso(4)
    setGuardando(false)
  }

  const inputStyle = {
    background: '#141414', border: '1px solid #2a2200', borderRadius: '8px',
    padding: '10px 14px', color: '#f5f0e8', fontSize: '14px', outline: 'none', width: '100%'
  }

  const totalHas = lotesSeleccionados.reduce((a, l) => a + (Number(l.hectareas) || 0), 0)

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#111', borderBottom: '1px solid #2a2200',
        padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => paso > 1 ? setPaso(paso - 1) : router.push('/ingeniero')}
          style={{ background: 'transparent', border: 'none', color: '#d4a017', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#d4a017', fontWeight: '700', fontSize: '15px' }}>Nueva Aplicación</div>
          <div style={{ color: '#6a5f40', fontSize: '11px' }}>
            Paso {paso} de {paso < 4 ? '3' : '3'}
            {paso >= 2 && ` · ${empresaNombre}`}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>

        {/* PASO 1 - ELEGIR PRODUCTOR */}
        {paso === 1 && (
          <div>
            <p style={{ color: '#a09070', fontSize: '13px', marginBottom: '16px' }}>Seleccioná el productor</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {empresas.map(e => (
                <div key={e.id} onClick={() => seleccionarEmpresa(e)}
                  style={{ background: '#141414', border: '1px solid #2a2200', borderRadius: '10px',
                    padding: '16px', cursor: 'pointer', borderLeft: '3px solid #d4a017' }}>
                  <div style={{ color: '#f5f0e8', fontWeight: '600', fontSize: '14px' }}>{e.nombre}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2 - FECHA Y LOTES */}
        {paso === 2 && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#a09070', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Fecha</label>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inputStyle} />
            </div>
            <p style={{ color: '#a09070', fontSize: '13px', marginBottom: '12px' }}>
              Seleccioná los lotes ({lotesSeleccionados.length} seleccionados · {totalHas.toFixed(0)} has)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', marginBottom: '20px' }}>
              {lotes.map(l => {
                const sel = lotesSeleccionados.find(x => x.id === l.id)
                return (
                  <div key={l.id} onClick={() => toggleLote(l)}
                    style={{ background: sel ? '#1a1400' : '#141414',
                      border: `1px solid ${sel ? '#d4a017' : '#2a2200'}`,
                      borderRadius: '10px', padding: '12px', cursor: 'pointer' }}>
                    <div style={{ color: '#f5f0e8', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>{l.nombre}</div>
                    <div style={{ color: '#d4a017', fontSize: '11px' }}>{l.cultivo} · {l.hectareas} has</div>
                    {sel && <div style={{ color: '#d4a017', fontSize: '11px', marginTop: '4px' }}>✓ Seleccionado</div>}
                  </div>
                )
              })}
            </div>
            <button onClick={() => setPaso(3)} disabled={lotesSeleccionados.length === 0}
              style={{ width: '100%', background: lotesSeleccionados.length > 0 ? '#d4a017' : '#2a2200',
                color: '#0a0a0a', padding: '14px', borderRadius: '10px', border: 'none',
                fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
              Continuar →
            </button>
          </div>
        )}

        {/* PASO 3 - PRODUCTOS */}
        {paso === 3 && (
          <div>
            <p style={{ color: '#a09070', fontSize: '13px', marginBottom: '16px' }}>
              Productos aplicados en {lotesSeleccionados.length} lote/s · {totalHas.toFixed(0)} has
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {productos.map((p, i) => (
                <div key={i} style={{ background: '#141414', border: '1px solid #2a2200',
                  borderRadius: '10px', padding: '14px' }}>
                  <div style={{ color: '#a09070', fontSize: '11px', marginBottom: '8px' }}>Producto {i + 1}</div>
                  <input placeholder="Nombre del producto" value={p.nombre}
                    onChange={e => actualizarProducto(i, 'nombre', e.target.value)}
                    style={{ ...inputStyle, marginBottom: '8px' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input placeholder="Dosis" value={p.dosis}
                      onChange={e => actualizarProducto(i, 'dosis', e.target.value)}
                      style={inputStyle} />
                    <select value={p.unidad} onChange={e => actualizarProducto(i, 'unidad', e.target.value)}
                      style={{ ...inputStyle }}>
                      <option>lt/ha</option>
                      <option>kg/ha</option>
                      <option>cc/ha</option>
                      <option>g/ha</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={agregarProducto}
              style={{ width: '100%', background: 'transparent', color: '#d4a017',
                padding: '12px', borderRadius: '10px', border: '1px dashed #3a2e00',
                fontSize: '13px', cursor: 'pointer', marginBottom: '12px' }}>
              + Agregar producto
            </button>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#a09070', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                Observaciones (opcional)
              </label>
              <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)}
                placeholder="Clima, estado del cultivo, etc."
                style={{ ...inputStyle, minHeight: '80px', resize: 'none' }} />
            </div>
            <button onClick={guardarYGenerar} disabled={guardando}
              style={{ width: '100%', background: '#d4a017', color: '#0a0a0a',
                padding: '16px', borderRadius: '10px', border: 'none',
                fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
              {guardando ? 'Guardando...' : 'Guardar y Generar Receta →'}
            </button>
          </div>
        )}

        {/* PASO 4 - RECETA GENERADA */}
        {paso === 4 && (
          <div>
            <div style={{ background: '#141414', border: '1px solid #d4a017', borderRadius: '10px',
              overflow: 'hidden', marginBottom: '16px' }} id="receta">
              <div style={{ background: '#0a0a0a', padding: '16px 20px',
                borderBottom: '2px solid #d4a017', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <svg width="36" height="36" viewBox="0 0 56 56">
                  <polygon points="28,3 51,16 51,40 28,53 5,40 5,16" fill="#1a1400" stroke="#d4a017" strokeWidth="2"/>
                  <text x="28" y="33" textAnchor="middle" fontSize="11" fontWeight="700" fill="#d4a017">AG</text>
                </svg>
                <div>
                  <div style={{ color: '#f5f0e8', fontWeight: '700', fontSize: '13px' }}>{ingeniero?.nombre}</div>
                  {ingeniero?.matricula && <div style={{ color: '#d4a017', fontSize: '11px' }}>M.P. {ingeniero.matricula}</div>}
                </div>
              </div>
              <div style={{ background: '#d4a017', padding: '8px', textAlign: 'center' }}>
                <span style={{ color: '#0a0a0a', fontWeight: '700', fontSize: '11px', letterSpacing: '2px' }}>
                  RECETA FITOSANITARIA
                </span>
              </div>
              <div style={{ padding: '16px 20px', background: '#fff' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px',
                  paddingBottom: '14px', borderBottom: '0.5px solid #e8e0cc' }}>
                  <div>
                    <div style={{ fontSize: '9px', color: '#a09070', textTransform: 'uppercase', letterSpacing: '1px' }}>Productor</div>
                    <div style={{ fontSize: '13px', color: '#1a1200', fontWeight: '500' }}>{empresaNombre.replace(' (Ing)', '')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '9px', color: '#a09070', textTransform: 'uppercase', letterSpacing: '1px' }}>Fecha</div>
                    <div style={{ fontSize: '13px', color: '#1a1200', fontWeight: '500' }}>
                      {new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR')}
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: '0.5px solid #e8e0cc' }}>
                  <div style={{ fontSize: '9px', color: '#a09070', textTransform: 'uppercase',
                    letterSpacing: '1px', marginBottom: '8px' }}>Lotes tratados</div>
                  {lotesSeleccionados.map(l => (
                    <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between',
                      padding: '6px 10px', background: '#fdf9f0', borderLeft: '2px solid #d4a017',
                      borderRadius: '0 4px 4px 0', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '500', color: '#1a1200' }}>{l.nombre}</span>
                      <span style={{ fontSize: '10px', color: '#a09070' }}>{l.cultivo} · {l.hectareas} has</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: '0.5px solid #e8e0cc' }}>
                  <div style={{ fontSize: '9px', color: '#a09070', textTransform: 'uppercase',
                    letterSpacing: '1px', marginBottom: '8px' }}>Productos aplicados</div>
                  {productos.filter(p => p.nombre).map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
                      padding: '5px 0', borderBottom: '0.5px solid #f0ece0' }}>
                      <span style={{ fontSize: '12px', color: '#1a1200' }}>{p.nombre}</span>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#d4a017',
                        background: '#fdf5df', padding: '2px 8px', borderRadius: '4px' }}>
                        {p.dosis} {p.unidad}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  {[
                    { val: totalHas.toFixed(0), lbl: 'Has totales' },
                    { val: lotesSeleccionados.length, lbl: 'Lotes' },
                    { val: productos.filter(p => p.nombre).length, lbl: 'Productos' }
                  ].map(({ val, lbl }) => (
                    <div key={lbl} style={{ flex: 1, background: '#0a0a0a', borderRadius: '6px',
                      padding: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#d4a017' }}>{val}</div>
                      <div style={{ fontSize: '9px', color: '#6a5f40', textTransform: 'uppercase' }}>{lbl}</div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '0.5px solid #1a1200', paddingTop: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', color: '#a09070', letterSpacing: '0.5px' }}>Firma y sello profesional</div>
                </div>
              </div>
            </div>
            <button onClick={async () => {
  const el = document.getElementById('receta')
  if (!el) return
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' })
  const link = document.createElement('a')
  link.download = `receta-${empresaNombre}-${fecha}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}}
  style={{ width: '100%', background: '#d4a017', color: '#0a0a0a',
    padding: '14px', borderRadius: '10px', border: 'none',
    fontWeight: '700', fontSize: '15px', cursor: 'pointer', marginBottom: '10px' }}>
  📸 Descargar imagen
</button>
<button onClick={() => { setPaso(1); setLotesSeleccionados([]); setProductos([{ nombre: '', dosis: '', unidad: 'lt/ha' }]) }}
  style={{ width: '100%', background: 'transparent', color: '#d4a017',
    padding: '12px', borderRadius: '10px', border: '1px solid #3a2e00',
    fontSize: '13px', cursor: 'pointer' }}>
  Nueva aplicación
</button>
          </div>
