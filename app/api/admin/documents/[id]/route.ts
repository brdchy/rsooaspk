import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, slug, category, content, fileUrl, published } = body

    const document = await prisma.document.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        category,
        content,
        fileUrl,
        published,
      },
    })

    return NextResponse.json(document)
  } catch (error: any) {
    console.error('Error updating document:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Документ с таким URL уже существует' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Ошибка при обновлении документа' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.document.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении документа' },
      { status: 500 }
    )
  }
}


