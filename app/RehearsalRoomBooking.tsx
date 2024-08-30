"use client"

import React, { useState, useEffect } from 'react'
import { format, addDays, isSameDay, parse, isAfter } from 'date-fns'
import { es } from 'date-fns/locale'

// Types
type Sala = {
  id: number;
  nombre: string;
  valorPorHora: number; // Valor por hora en $CLP
}

type Instrumento = {
  id: number;
  nombre: string;
  valor: number; // Valor en $CLP
}

type Reserva = {
  fecha: Date;
  salaId: number;
  horas: string[];
  instrumentos: { id: number; horaInicio: string; horaFin: string }[];
}

// Data
const salas: Sala[] = [
  { id: 1, nombre: "Sala Rock", valorPorHora: 25000 }, // Convertido a $CLP
  { id: 2, nombre: "Sala Jazz", valorPorHora: 30000 }, // Convertido a $CLP
  { id: 3, nombre: "Sala Acústica", valorPorHora: 20000 }, // Convertido a $CLP
  { id: 4, nombre: "Sala Electrónica", valorPorHora: 35000 }, // Convertido a $CLP
]

const instrumentos: Instrumento[] = [
  { id: 1, nombre: "Guitarra eléctrica", valor: 10000 }, // Convertido a $CLP
  { id: 2, nombre: "Bajo eléctrico", valor: 8000 }, // Convertido a $CLP
  { id: 3, nombre: "Batería", valor: 15000 }, // Convertido a $CLP
  { id: 4, nombre: "Teclado", valor: 12000 }, // Convertido a $CLP
  { id: 5, nombre: "Sistema in-ear", valor: 20000 }, // Convertido a $CLP
  { id: 6, nombre: "Micrófono", valor: 5000 }, // Convertido a $CLP
]

const horas = [
  "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00",
  "20:00", "21:00", "22:00", "23:00"
]

// Components
const Button = ({ children, onClick, className = "", disabled = false }: { 
    children: React.ReactNode; // Definir el tipo de children
    onClick: () => void; 
    className?: string; 
    disabled?: boolean; 
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={className}
    >
        {children}
    </button>
);

export default function RehearsalRoomBooking() {
  const [fecha, setFecha] = useState<Date>(new Date())
  const [salaId, setSalaId] = useState<number | null>(null)
  const [horasSeleccionadas, setHorasSeleccionadas] = useState<string[]>([])
  const [instrumentosSeleccionados, setInstrumentosSeleccionados] = useState<{ id: number, horaInicio: string, horaFin: string }[]>([])
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
      const horasInstrumento = horas.indexOf(inst.horaFin) - horas.indexOf(inst.horaInicio) + 1
      return total + (instrumento ? instrumento.valor * horasInstrumento : 0)
    }, 0)

    setTotalValor(valorSala + valorInstrumentos)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    const [year, month, day] = selectedDate.split('-').map(Number);
    const newDate = new Date(year, month - 1, day);
    newDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
    setFecha(newDate);
    setSalaId(null);
    setHorasSeleccionadas([]);
    setInstrumentosSeleccionados([]);
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
      let newHoras;
      
      if (prev.includes(hora)) {
        // Si la hora ya estaba seleccionada
        if (horaIndex === prev.length - 1 || horaIndex === 0) {
          // Si es la última o la primera hora seleccionada, simplemente la quitamos
          newHoras = prev.filter(h => h !== hora);
        } else {
          // Si es una hora intermedia, mantenemos solo las horas hasta la hora anterior
          const lastContinuousIndex = prev.findIndex((h, index) => 
            index > 0 && horas.indexOf(h) - horas.indexOf(prev[index - 1]) > 1
          );
          newHoras = lastContinuousIndex === -1 ? prev.slice(0, horaIndex) : prev.slice(0, lastContinuousIndex);
        }
      } else {
        // Si la hora no estaba seleccionada, la añadimos y seleccionamos todas las horas intermedias
        newHoras = [...prev, hora].sort((a, b) => horas.indexOf(a) - horas.indexOf(b));
        const firstIndex = horas.indexOf(newHoras[0]);
        const lastIndex = horas.indexOf(newHoras[newHoras.length - 1]);
        newHoras = horas.slice(firstIndex, lastIndex + 1);
      }
      
      // Aplicar la clase 'selected' inmediatamente
      horas.forEach(h => {
        const button = document.querySelector(`button[data-hora="${h}"]`);
        if (button) {
          if (newHoras.includes(h)) {
            button.classList.add('selected');
          } else {
            button.classList.remove('selected');
          }
        }
      });
      
      return newHoras;
    });
  }

  const toggleInstrumento = (instrumentoId: number) => {
    setInstrumentosSeleccionados(prev => {
      const exists = prev.find(i => i.id === instrumentoId)
      if (exists) {
        return prev.filter(i => i.id !== instrumentoId)
      } else {
        return [...prev, { id: instrumentoId, horaInicio: horasSeleccionadas[0], horaFin: horasSeleccionadas[horasSeleccionadas.length - 1] }]
      }
    })
  }

  const changeInstrumentoHoras = (instrumentoId: number, tipo: 'inicio' | 'fin', hora: string) => {
    setInstrumentosSeleccionados(prev =>
      prev.map(i =>
        i.id === instrumentoId
          ? { ...i, [tipo === 'inicio' ? 'horaInicio' : 'horaFin']: hora }
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
          className="w-full p-2 border rounded date-input" // Añadido 'date-input' para estilos
          onClick={(e) => e.currentTarget.showPicker()} // Despliega el calendario al hacer clic
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Sala:</label>
        <select 
          value={salaId || ""}
          onChange={handleSalaSelect}
          className="w-full p-2 border rounded"
        >
          <option value="" style={{ color: 'white' }}>Selecciona una sala</option> {/* Color blanco */}
          {salas.map(sala => (
            <option key={sala.id} value={sala.id} style={{ color: 'white' }}>
              {sala.nombre} - ${sala.valorPorHora}/hora
            </option>
          ))}
        </select>
      </div>

      {salaId !== null && (
        <div className="mb-4 hours-container">
          <h2>Horas disponibles:</h2>
          <div className="grid grid-cols-4 gap-4">
            {horas.map((hora) => (
              <button 
                key={hora} 
                data-hora={hora}
                className={`hour-button ${horasSeleccionadas.includes(hora) ? 'selected' : ''} ${!isHoraDisponible(hora) ? 'disabled' : ''}`}
                onClick={() => toggleHora(hora)}
                disabled={!isHoraDisponible(hora)} // Deshabilita el botón si no está disponible
              >
                {hora}
              </button>
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
                <div className="ml-auto flex items-center">
                  <select
                    value={instrumentosSeleccionados.find(i => i.id === instrumento.id)?.horaInicio}
                    onChange={(e) => changeInstrumentoHoras(instrumento.id, 'inicio', e.target.value)}
                    className="mr-2"
                  >
                    {horasSeleccionadas.map(hora => (
                      <option key={hora} value={hora}>{hora}</option>
                    ))}
                  </select>
                  <span>a</span>
                  <select
                    value={instrumentosSeleccionados.find(i => i.id === instrumento.id)?.horaFin}
                    onChange={(e) => changeInstrumentoHoras(instrumento.id, 'fin', e.target.value)}
                    className="ml-2"
                  >
                    {horasSeleccionadas.map(hora => (
                      <option key={hora} value={hora}>{hora}</option>
                    ))}
                  </select>
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