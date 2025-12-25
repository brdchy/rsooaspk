import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, description } = body

    const region = await prisma.region.create({
      data: {
        name,
        slug,
        description,
      },
    })

    return NextResponse.json(region)
  } catch (error: any) {
    console.error('Error creating region:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Филиал с таким URL уже существует' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Ошибка при создании филиала' },
      { status: 500 }
    )
  }
}

