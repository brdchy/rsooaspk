import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, slug, section, subsection, content, published } = body

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        section,
        subsection: subsection || null,
        content,
        published: published ?? true,
      },
    })

    return NextResponse.json(page)
  } catch (error: any) {
    console.error('Error creating page:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Страница с таким URL уже существует' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Ошибка при создании страницы' },
      { status: 500 }
    )
  }
}

