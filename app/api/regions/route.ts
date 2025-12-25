import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const regions = await prisma.region.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    })
    return NextResponse.json(regions)
  } catch (error) {
    console.error('Error fetching regions:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении филиалов' },
      { status: 500 }
    )
  }
}

