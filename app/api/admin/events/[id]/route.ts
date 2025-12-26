import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, slug, description, startDate, endDate, location, type, status } = body

    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        location,
        type,
        status,
      },
    })

    return NextResponse.json(event)
  } catch (error: any) {
    console.error('Error updating event:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Мероприятие с таким URL уже существует' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Ошибка при обновлении мероприятия' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.event.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении мероприятия' },
      { status: 500 }
    )
  }
}


