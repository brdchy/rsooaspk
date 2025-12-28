import { prisma } from '@/lib/prisma'
import Breadcrumbs from '@/components/Breadcrumbs'
import SectionTitlesForm from '@/components/admin/SectionTitlesForm'
import { getSectionTitles } from '@/lib/sectionTitles'

// Отключаем кэширование для динамического контента
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminSectionTitlesPage() {
  const titles = await getSectionTitles()

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Админ-панель', href: '/admin' },
          { label: 'Названия разделов' },
        ]}
      />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
        Управление названиями разделов
      </h1>
      <p className="text-gray-600 mb-6">
        Здесь вы можете редактировать названия разделов и подразделов сайта.
        Изменения отобразятся в меню навигации и на страницах разделов.
      </p>
      <SectionTitlesForm initialData={titles} />
    </div>
  )
}

