import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findMany()
    const settingsObj = settings.reduce(
      (acc, s) => {
        acc[s.key] = s.value
        return acc
      },
      {} as Record<string, string>
    )
    return NextResponse.json(settingsObj)
  } catch (error) {
    return NextResponse.json({}, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { heroBackground } = body

    // Сохраняем настройки
    await prisma.siteSettings.upsert({
      where: { key: 'heroBackground' },
      update: { value: heroBackground || '' },
      create: {
        key: 'heroBackground',
        value: heroBackground || '',
        description: 'Изображение-подложка для главной страницы',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { error: 'Ошибка при сохранении настроек' },
      { status: 500 }
    )
  }
}

