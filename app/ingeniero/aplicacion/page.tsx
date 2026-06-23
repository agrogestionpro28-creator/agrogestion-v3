'use client'
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
