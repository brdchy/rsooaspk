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
    // Проверяем, есть ли пользователи, связанные с этим филиалом
    const usersCount = await prisma.user.count({
      where: { regionId: params.id },
    })

    if (usersCount > 0) {
      return NextResponse.json(
        { 
          error: `Невозможно удалить филиал. С ним связано ${usersCount} пользователей. Сначала удалите или переместите пользователей.` 
        },
        { status: 400 }
      )
    }

    await prisma.region.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting region:', error)
    
    // Обработка ошибки внешнего ключа
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Невозможно удалить филиал. С ним связаны другие данные.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Ошибка при удалении филиала' },
      { status: 500 }
    )
  }
}

