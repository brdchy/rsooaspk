import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, slug, description, startDate, endDate, location, type, status } = body

    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        location,
        type,
        status: status || 'planned',
      },
    })

    return NextResponse.json(event)
  } catch (error: any) {
    console.error('Error creating event:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Мероприятие с таким URL уже существует' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Ошибка при создании мероприятия' },
      { status: 500 }
    )
  }
}

