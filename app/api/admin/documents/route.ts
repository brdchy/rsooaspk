import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, slug, category, content, fileUrl, published } = body

    const document = await prisma.document.create({
      data: {
        title,
        slug,
        category,
        content,
        fileUrl,
        published: published ?? true,
      },
    })

    return NextResponse.json(document)
  } catch (error: any) {
    console.error('Error creating document:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Документ с таким URL уже существует' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Ошибка при создании документа' },
      { status: 500 }
    )
  }
}

