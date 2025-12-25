import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, slug, description } = body

    const region = await prisma.region.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description,
      },
    })

    return NextResponse.json(region)
  } catch (error: any) {
    console.error('Error updating region:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Филиал с таким URL уже существует' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Ошибка при обновлении филиала' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.region.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting region:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении филиала' },
      { status: 500 }
    )
  }
}

