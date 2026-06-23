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
