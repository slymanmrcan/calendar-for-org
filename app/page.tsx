"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import Calendar from "@/components/Calendar"
import EventModal from "@/components/EventModal"
import Header from "@/components/Header"

interface Event {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  imageUrl?: string | null
  speaker?: string | null
  location?: string | null
  platform?: string | null
  url?: string | null
  isOnline?: boolean
}

interface CalendarEvent {
  id: string
  title: string
  description?: string
  imageUrl?: string | null
  speaker?: string | null
  location?: string | null
  platform?: string | null
  url?: string | null
  isOnline?: boolean
  start: Date
  end: Date
}

export default function HomePage() {
  const { data: session } = useSession()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('view')
  const [newEventSlot, setNewEventSlot] = useState<{ start: Date; end: Date } | null>(null)

  const fetchEvents = useCallback(async (start?: Date, end?: Date) => {
    try {
      let url = '/api/events'
      if (start && end) {
        const params = new URLSearchParams({
          start: start.toISOString(),
          end: end.toISOString(),
        })
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      const data: Event[] = await response.json()
      const calendarEvents = data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        imageUrl: event.imageUrl,
        speaker: event.speaker,
        location: event.location,
        platform: event.platform,
        url: event.url,
        isOnline: event.isOnline,
        start: new Date(event.startDate),
        end: new Date(event.endDate),
      }))
      setEvents(calendarEvents)
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }, [])

  // Initial fetch is handled by Calendar's onDatesSet
  
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setModalMode('view')
    setModalOpen(true)
  }

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    if (session) {
      // Aynı gün seçimi: bitişi başlangıç + 1 saat olarak ayarlayalım
      const start = slotInfo.start
      const end = new Date(start.getTime() + 60 * 60 * 1000)
      const normalizedSlot = { start, end }

      setNewEventSlot(normalizedSlot)
      setSelectedEvent({
        id: '',
        title: '',
        description: '',
        imageUrl: '',
        speaker: '',
        location: '',
        platform: '',
        isOnline: false,
        start,
        end,
      })
      setModalMode('create')
      setModalOpen(true)
    }
  }

  const handleSaveEvent = async (event: {
    id?: string
    title: string
    description?: string
    startDate: Date
    endDate: Date
    imageUrl?: string | null
    speaker?: string | null
    location?: string | null
    platform?: string | null
    url?: string | null
    isOnline?: boolean
  }) => {
    try {
      const cleanedImageUrl = event.imageUrl?.toString().trim()
      const imageUrl = cleanedImageUrl ? cleanedImageUrl : null
      const speaker = event.speaker?.toString().trim() || null
      const location = event.location?.toString().trim() || null
      const platform = event.platform?.toString().trim() || null
      const url = event.url?.toString().trim() || null
      const isOnline = Boolean(event.isOnline)

      if (event.id) {
        // Update existing event
        const response = await fetch(`/api/events/${event.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: event.title,
            description: event.description,
            imageUrl,
            speaker,
            location,
            platform,
            url,
            isOnline,
            startDate: event.startDate.toISOString(),
            endDate: event.endDate.toISOString(),
          }),
        })
        
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Etkinlik güncellenemedi')
        }
      } else {
        // Create new event
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: event.title,
            description: event.description,
            imageUrl,
            speaker,
            location,
            platform,
            url,
            isOnline,
            startDate: event.startDate.toISOString(),
            endDate: event.endDate.toISOString(),
          }),
        })
        
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Etkinlik oluşturulamadı')
        }
      }
      await fetchEvents()
      setModalOpen(false)
    } catch (error) {
      console.error('Error saving event:', error)
      throw error // Hatayı yukarı fırlat ki Modal yakalayabilsin
    }
  }

  const handleDeleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete event')
      await fetchEvents()
      setModalOpen(false)
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  return (
    <>
      <Header />

      <main className="relative mx-auto flex w-full max-w-[1800px] flex-col gap-4 px-2 pb-10 pt-4 sm:px-5 lg:px-10">
        <Calendar
          events={events}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onDatesSet={({ start, end }) => fetchEvents(start, end)}
          isAdmin={!!session?.user}
        />
      </main>

      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        event={selectedEvent ? {
          id: selectedEvent.id,
          title: selectedEvent.title,
          description: selectedEvent.description,
          imageUrl: selectedEvent.imageUrl,
          speaker: selectedEvent.speaker,
          location: selectedEvent.location,
          platform: selectedEvent.platform,
          url: selectedEvent.url,
          isOnline: selectedEvent.isOnline,
          startDate: selectedEvent.start,
          endDate: selectedEvent.end,
        } : null}
        isAdmin={!!session}
        mode={modalMode}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </>
  )
}
