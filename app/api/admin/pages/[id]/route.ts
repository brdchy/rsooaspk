import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, slug, section, subsection, content, published } = body

    const page = await prisma.page.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        section,
        subsection: subsection || null,
        content,
        published,
      },
    })

    return NextResponse.json(page)
  } catch (error: any) {
    console.error('Error updating page:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Страница с таким URL уже существует' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Ошибка при обновлении страницы' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.page.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting page:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении страницы' },
      { status: 500 }
    )
  }
}

