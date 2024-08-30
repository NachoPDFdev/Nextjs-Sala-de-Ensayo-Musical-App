"use client"

import React, { useState, useEffect } from 'react'
import { format, addDays, isSameDay, parse, isAfter } from 'date-fns'
import { es } from 'date-fns/locale'

// Types
type Sala = {
  id: number;
  nombre: string;
  valorPorHora: number;
}

type Instrumento = {
  id: number;
  nombre: string;
  valor: number;
}

type Reserva = {
  fecha: Date;
  salaId: number;
  horas: string[];
  instrumentos: { id: number; horas: number }[];
}

// Data
const salas: Sala[] = [
  { id: 1, nombre: "Sala Rock", valorPorHora: 25 },
  { id: 2, nombre: "Sala Jazz", valorPorHora: 30 },
  { id: 3, nombre: "Sala Acústica", valorPorHora: 20 },
  { id: 4, nombre: "Sala Electrónica", valorPorHora: 35 },
]

const instrumentos: Instrumento[] = [
  { id: 1, nombre: "Guitarra eléctrica", valor: 10 },
  { id: 2, nombre: "Bajo eléctrico", valor: 8 },
  { id: 3, nombre: "Batería", valor: 15 },
  { id: 4, nombre: "Teclado", valor: 12 },
  { id: 5, nombre: "Sistema in-ear", valor: 20 },
  { id: 6, nombre: "Micrófono", valor: 5 },
]

const horas = [
  "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00",
  "20:00", "21:00", "22:00", "23:00"
]

// Components
const Button = ({ children, onClick, className = "", disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
)

export default function RehearsalRoomBooking() {
  const [fecha, setFecha] = useState<Date>(new Date())
  const [salaId, setSalaId] = useState<number | null>(null)
  const [horasSeleccionadas, setHorasSeleccionadas] = useState<string[]>([])
  const [instrumentosSeleccionados, setInstrumentosSeleccionados] = useState<{ id: number, horas: number }[]>([])
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [totalValor, setTotalValor] = useState(0)

  useEffect(() => {
    calcularTotal()
  }, [salaId, horasSeleccionadas, instrumentosSeleccionados])

  const calcularTotal = () => {
    if (salaId === null) return

    const sala = salas.find(s => s.id === salaId)
    if (!sala) return

    const valorSala = sala.valorPorHora * horasSeleccionadas.length
    const valorInstrumentos = instrumentosSeleccionados.reduce((total, inst) => {
      const instrumento = instrumentos.find(i => i.id === inst.id)
      return total + (instrumento ? instrumento.valor * inst.horas : 0)
    }, 0)

    setTotalValor(valorSala + valorInstrumentos)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value)
    setFecha(newDate)
    setSalaId(null)
    setHorasSeleccionadas([])
    setInstrumentosSeleccionados([])
  }

  const handleSalaSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSalaId = parseInt(e.target.value)
    setSalaId(newSalaId)
    setHorasSeleccionadas([])
    setInstrumentosSeleccionados([])
  }

  const toggleHora = (hora: string) => {
    setHorasSeleccionadas(prev => {
      const horaIndex = horas.indexOf(hora);
      
      if (prev.includes(hora)) {
        // Si la hora ya estaba seleccionada
        if (horaIndex === prev.length - 1 || horaIndex === 0) {
          // Si es la última o la primera hora seleccionada, simplemente la quitamos
          return prev.filter(h => h !== hora);
        } else {
          // Si es una hora intermedia, mantenemos solo las horas hasta la hora anterior
          const lastContinuousIndex = prev.findIndex((h, index) => 
            index > 0 && horas.indexOf(h) - horas.indexOf(prev[index - 1]) > 1
          );
          return lastContinuousIndex === -1 ? prev.slice(0, horaIndex) : prev.slice(0, lastContinuousIndex);
        }
      } else {
        // Si la hora no estaba seleccionada, la añadimos y seleccionamos todas las horas intermedias
        const newHoras = [...prev, hora].sort((a, b) => horas.indexOf(a) - horas.indexOf(b));
        const firstIndex = horas.indexOf(newHoras[0]);
        const lastIndex = horas.indexOf(newHoras[newHoras.length - 1]);
        return horas.slice(firstIndex, lastIndex + 1);
      }
    });
  }

  const toggleInstrumento = (instrumentoId: number) => {
    setInstrumentosSeleccionados(prev => {
      const exists = prev.find(i => i.id === instrumentoId)
      if (exists) {
        return prev.filter(i => i.id !== instrumentoId)
      } else {
        return [...prev, { id: instrumentoId, horas: 1 }]
      }
    })
  }

  const changeInstrumentoHoras = (instrumentoId: number, change: number) => {
    setInstrumentosSeleccionados(prev => 
      prev.map(i => 
        i.id === instrumentoId 
          ? { ...i, horas: Math.max(1, Math.min(i.horas + change, horasSeleccionadas.length)) }
          : i
      )
    )
  }

  const handleReserva = () => {
    if (salaId === null || horasSeleccionadas.length === 0) {
      alert("Por favor, selecciona una sala y al menos una hora.")
      return
    }

    const nuevaReserva: Reserva = {
      fecha,
      salaId,
      horas: horasSeleccionadas,
      instrumentos: instrumentosSeleccionados,
    }

    setReservas([...reservas, nuevaReserva])
    alert(`Reserva confirmada para ${format(fecha, "dd 'de' MMMM", { locale: es })} en ${salas.find(s => s.id === salaId)?.nombre}`)

    // Reset form
    setSalaId(null)
    setHorasSeleccionadas([])
    setInstrumentosSeleccionados([])
  }

  const isHoraDisponible = (hora: string) => {
    const now = new Date()
    const horaDate = parse(hora, "HH:mm", fecha)

    // Si la fecha seleccionada es hoy, verificamos si la hora ya ha pasado
    if (isSameDay(fecha, now) && !isAfter(horaDate, now)) {
      return false
    }

    return !reservas.some(r => 
      r.fecha.getTime() === fecha.getTime() && 
      r.salaId === salaId && 
      r.horas.includes(hora)
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Reserva tu sala de ensayo</h1>

      <div className="mb-4">
        <label className="block mb-2">Fecha:</label>
        <input 
          type="date" 
          value={format(fecha, "yyyy-MM-dd")}
          onChange={handleDateChange}
          min={format(new Date(), "yyyy-MM-dd")}
          max={format(addDays(new Date(), 30), "yyyy-MM-dd")}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Sala:</label>
        <select 
          value={salaId || ""}
          onChange={handleSalaSelect}
          className="w-full p-2 border rounded"
        >
          <option value="">Selecciona una sala</option>
          {salas.map(sala => (
            <option key={sala.id} value={sala.id}>
              {sala.nombre} - ${sala.valorPorHora}/hora
            </option>
          ))}
        </select>
      </div>

      {salaId !== null && (
        <div className="mb-4">
          <label className="block mb-2">Horas disponibles:</label>
          <div className="grid grid-cols-4 gap-2">
            {horas.map(hora => (
              <Button
                key={hora}
                onClick={() => toggleHora(hora)}
                disabled={!isHoraDisponible(hora)}
                className={horasSeleccionadas.includes(hora) ? 'bg-green-500' : ''}
              >
                {hora}
              </Button>
            ))}
          </div>
        </div>
      )}

      {horasSeleccionadas.length > 0 && (
        <div className="mb-4">
          <label className="block mb-2">Instrumentos adicionales:</label>
          {instrumentos.map(instrumento => (
            <div key={instrumento.id} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={instrumentosSeleccionados.some(i => i.id === instrumento.id)}
                onChange={() => toggleInstrumento(instrumento.id)}
                className="mr-2"
              />
              <span>{instrumento.nombre} - ${instrumento.valor}/hora</span>
              {instrumentosSeleccionados.some(i => i.id === instrumento.id) && (
                <div className="ml-auto">
                  <Button onClick={() => changeInstrumentoHoras(instrumento.id, -1)}>-</Button>
                  <span className="mx-2">
                    {instrumentosSeleccionados.find(i => i.id === instrumento.id)?.horas || 0}
                  </span>
                  <Button onClick={() => changeInstrumentoHoras(instrumento.id, 1)}>+</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mb-4">
        <strong>Total: ${totalValor}</strong>
      </div>

      <Button onClick={handleReserva} disabled={salaId === null || horasSeleccionadas.length === 0}>
        Confirmar Reserva
      </Button>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Reservas actuales</h2>
        {reservas.map((reserva, index) => (
          <div key={index} className="mb-2 p-2 border rounded">
            <p>Fecha: {format(reserva.fecha, "dd 'de' MMMM", { locale: es })}</p>
            <p>Sala: {salas.find(s => s.id === reserva.salaId)?.nombre}</p>
            <p>Horas: {reserva.horas.join(", ")}</p>
          </div>
        ))}
      </div>
    </div>
  )
}