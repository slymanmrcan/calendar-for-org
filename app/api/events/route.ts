import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

// GET /api/events - Fetch events (optionally filtered by date range)
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const start = searchParams.get('start')
        const end = searchParams.get('end')

        const whereClause: any = {}

        if (start && end) {
            whereClause.OR = [
                {
                    // Event starts within the range
                    startDate: {
                        gte: new Date(start),
                        lte: new Date(end),
                    },
                },
                {
                    // Event ends within the range
                    endDate: {
                        gte: new Date(start),
                        lte: new Date(end),
                    },
                },
                {
                    // Event spans across the range
                    startDate: { lte: new Date(start) },
                    endDate: { gte: new Date(end) },
                },
            ]
        }

        const events = await prisma.event.findMany({
            where: whereClause,
            orderBy: { startDate: 'asc' },
        })
        return NextResponse.json(events)
    } catch (error) {
        console.error('Error fetching events:', error)
        return NextResponse.json(
            { error: 'Failed to fetch events' },
            { status: 500 }
        )
    }
}

// POST /api/events - Create new event (Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const {
            title,
            description,
            startDate,
            endDate,
            imageUrl,
            speaker,
            location,
            platform,
            url,
            isOnline,
        } = body

        if (!title || !startDate || !endDate) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Base64 koruması: URL çok uzunsa reddet
        if (imageUrl && imageUrl.length > 2048) {
            return NextResponse.json(
                { error: 'Resim linki çok uzun. Lütfen Base64 yerine geçerli bir URL kullanın.' },
                { status: 400 }
            )
        }

        const parsedStart = new Date(startDate)
        const parsedEnd = new Date(endDate)

        if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
            return NextResponse.json(
                { error: 'Invalid date format' },
                { status: 400 }
            )
        }

        const event = await prisma.event.create({
            data: {
                title: title.trim(),
                description: description?.trim(),
                imageUrl,
                speaker: speaker?.trim(),
                location: location?.trim(),
                platform: platform?.trim(),
                url: url?.trim(),
                isOnline: Boolean(isOnline),
                startDate: parsedStart,
                endDate: parsedEnd,
            },
        })

        return NextResponse.json(event, { status: 201 })
    } catch (error) {
        console.error('Error creating event:', error)
        return NextResponse.json(
            { error: 'Failed to create event' },
            { status: 500 }
        )
    }
}
