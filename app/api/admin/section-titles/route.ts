import { NextRequest, NextResponse } from 'next/server'
import { getSectionTitles, saveSectionTitles } from '@/lib/sectionTitles'

// Отключаем кэширование для динамического контента
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const titles = await getSectionTitles()
    return NextResponse.json(titles)
  } catch (error: any) {
    console.error('Error fetching section titles:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении названий разделов' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sectionTitles, subsectionTitles } = body

    if (!sectionTitles || !subsectionTitles) {
      return NextResponse.json(
        { error: 'Необходимо указать sectionTitles и subsectionTitles' },
        { status: 400 }
      )
    }

    await saveSectionTitles({
      sectionTitles,
      subsectionTitles,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error saving section titles:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка при сохранении названий разделов' },
      { status: 500 }
    )
  }
}

