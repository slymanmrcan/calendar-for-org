import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/events/:id
export async function GET(req: NextRequest, { params }: any) {
    try {
        const id = params.id

        const event = await prisma.event.findUnique({
            where: { id }
        })

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 })
        }

        return NextResponse.json(event)
    } catch (error) {
        console.error('Error fetching event:', error)
        return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
    }
}

// PUT /api/events/:id
export async function PUT(req: NextRequest, { params }: any) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const id = params.id
        const body = await req.json()

        const event = await prisma.event.update({
            where: { id },
            data: {
                title: body.title?.trim(),
                description: body.description?.trim(),
                imageUrl: body.imageUrl,
                speaker: body.speaker?.trim(),
                location: body.location?.trim(),
                platform: body.platform?.trim(),
                url: body.url?.trim(),
                isOnline: Boolean(body.isOnline),
                startDate: new Date(body.startDate),
                endDate: new Date(body.endDate),
            }
        })

        return NextResponse.json(event)
    } catch (error) {
        console.error('Error updating event:', error)
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
    }
}

// DELETE /api/events/:id
export async function DELETE(req: NextRequest, { params }: any) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const id = params.id

        await prisma.event.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting event:', error)
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
    }
}
