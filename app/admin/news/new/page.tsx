import NewsForm from '@/components/admin/NewsForm'
import Breadcrumbs from '@/components/Breadcrumbs'

export default function NewNewsPage() {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Админ-панель', href: '/admin' },
          { label: 'Новости', href: '/admin/news' },
          { label: 'Добавить' },
        ]}
      />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
        Добавить новость
      </h1>
      <NewsForm />
    </div>
  )
}

