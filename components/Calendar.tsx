"use client"

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import trLocale from '@fullcalendar/core/locales/tr'
import { useState, useEffect } from 'react'
import '@/app/calendar.css'

interface Event {
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

interface CalendarProps {
    events: Event[]
    onSelectEvent: (event: Event) => void
    onSelectSlot: (slotInfo: { start: Date; end: Date }) => void
    onDatesSet?: (arg: { start: Date; end: Date }) => void
    isAdmin: boolean
}

export default function Calendar({ events, onSelectEvent, onSelectSlot, onDatesSet, isAdmin }: CalendarProps) {
    // FullCalendar için event formatını dönüştür
    const calendarEvents = events.map(event => ({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        extendedProps: {
            description: event.description,
            imageUrl: event.imageUrl,
            speaker: event.speaker,
            location: event.location,
            platform: event.platform,
            url: event.url,
            isOnline: event.isOnline
        },
        // Renk ataması (ID'ye göre)
        backgroundColor: getColorForEvent(event.id),
        borderColor: 'transparent'
    }))

    function getColorForEvent(id: string) {
        const colors = [
            '#0ea5e9', // Sky
            '#22c55e', // Green
            '#f59e0b', // Amber
            '#38bdf8', // Light blue
            '#f97316', // Orange
            '#14b8a6', // Teal
        ]
        const index = id ? parseInt(id.slice(-1), 36) % colors.length : 0
        return colors[index]
    }

    const renderEventContent = (eventInfo: any) => {
        const { event } = eventInfo
        const props = event.extendedProps
        const startTime = event.start.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        const endTime = event.end?.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        
        const venue = props.isOnline ? props.platform : props.location

        return (
            <div className="flex flex-col gap-0.5 overflow-hidden w-full h-full px-1 py-0.5">
                <div className="flex items-center gap-1 text-[10px] font-bold opacity-90">
                    <span>{startTime}</span>
                    {endTime && <span>- {endTime}</span>}
                </div>
                <div className="font-semibold text-xs truncate leading-tight">
                    {event.title}
                </div>
                {venue && (
                    <div className="text-[10px] opacity-80 truncate">
                        {props.isOnline ? '🌐 ' : '📍 '}{venue}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="w-full h-full rounded-2xl border border-border bg-card text-card-foreground p-4 shadow-xl backdrop-blur overflow-hidden">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                locale={trLocale}
                events={calendarEvents}
                selectable={isAdmin}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                datesSet={(arg) => {
                    if (onDatesSet) {
                        onDatesSet({ start: arg.start, end: arg.end })
                    }
                }}
                select={(info) => {
                    onSelectSlot({ start: info.start, end: info.end })
                }}
                eventClick={(info) => {
                    const e = info.event
                    onSelectEvent({
                        id: e.id,
                        title: e.title,
                        start: e.start!,
                        end: e.end!,
                        description: e.extendedProps.description,
                        imageUrl: e.extendedProps.imageUrl,
                        speaker: e.extendedProps.speaker,
                        location: e.extendedProps.location,
                        platform: e.extendedProps.platform,
                        url: e.extendedProps.url,
                        isOnline: e.extendedProps.isOnline
                    })
                }}
                eventContent={renderEventContent}
                height="auto"
                contentHeight="auto"
                aspectRatio={1.8}
            />
        </div>
    )
}
