import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  getAllSubsectionsForSection,
  predefinedSubsections,
} from '@/lib/subsections'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const section = searchParams.get('section')

    if (!section) {
      return NextResponse.json(
        { error: 'Section parameter is required' },
        { status: 400 }
      )
    }

    // Начинаем с предопределенных подразделов
    const predefined = predefinedSubsections[section] || []
    const allSubsections = new Set(predefined)

    // Добавляем подразделы из базы данных
    const pages = await prisma.page.findMany({
      where: {
        section,
        subsection: {
          not: null,
        },
      },
      select: {
        subsection: true,
      },
      distinct: ['subsection'],
    })

    pages.forEach((p) => {
      if (p.subsection) {
        allSubsections.add(p.subsection)
      }
    })

    // Возвращаем отсортированный массив
    const subsections = Array.from(allSubsections).sort()

    return NextResponse.json(subsections)
  } catch (error) {
    console.error('Error fetching subsections:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении подразделов' },
      { status: 500 }
    )
  }
}

