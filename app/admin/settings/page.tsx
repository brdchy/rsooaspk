import { prisma } from '@/lib/prisma'
import SettingsForm from '@/components/admin/SettingsForm'
import Breadcrumbs from '@/components/Breadcrumbs'

// Отключаем кэширование для динамического контента
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getSettings() {
  try {
    const settings = await prisma.siteSettings.findMany({
      orderBy: { key: 'asc' },
    })
    return settings.reduce(
      (acc, s) => {
        acc[s.key] = s.value
        return acc
      },
      {} as Record<string, string>
    )
  } catch (error) {
    return {}
  }
}

export default async function AdminSettingsPage() {
  const settings = await getSettings()

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Админ-панель', href: '/admin' },
          { label: 'Настройки' },
        ]}
      />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
        Настройки сайта
      </h1>
      <SettingsForm settings={settings} />
    </div>
  )
}

