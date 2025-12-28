import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import DeleteRegionButton from '@/components/admin/DeleteRegionButton'

// Отключаем кэширование для динамического контента
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getAllRegions() {
  try {
    const regions = await prisma.region.findMany({
      orderBy: { name: 'asc' },
    })
    return regions
  } catch (error) {
    return []
  }
}

export default async function AdminRegionsPage() {
  const regions = await getAllRegions()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Филиалы</h1>
        <Link href="/admin/regions/new" className="btn btn-primary">
          Добавить филиал
        </Link>
      </div>

      {/* Desktop Table */}
      <div className="card overflow-hidden hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Название
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {regions.map((region) => (
              <tr key={region.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {region.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {region.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/admin/regions/${region.id}`}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Редактировать
                    </Link>
                    <DeleteRegionButton
                      regionId={region.id}
                      regionName={region.name}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {regions.map((region) => (
          <div key={region.id} className="card p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
                {region.name}
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">URL: {region.slug}</p>
            <div className="flex flex-col gap-2">
              <Link
                href={`/admin/regions/${region.id}`}
                className="btn btn-primary text-center text-sm"
              >
                Редактировать
              </Link>
              <DeleteRegionButton
                regionId={region.id}
                regionName={region.name}
              />
            </div>
          </div>
        ))}
        {regions.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Филиалы не найдены. Создайте первый филиал.
          </div>
        )}
      </div>

      {/* Empty state for desktop */}
      {regions.length === 0 && (
        <div className="hidden md:block p-8 text-center text-gray-500">
          Филиалы не найдены. Создайте первый филиал.
        </div>
      )}
    </div>
  )
}

