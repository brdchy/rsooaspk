import { prisma } from '@/lib/prisma'
import Link from 'next/link'

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
    console.error('Error fetching regions:', error)
    return []
  }
}

export default async function RegionsPage() {
  const regions = await getAllRegions()

  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold mb-8">Филиалы</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regions.map((region) => (
          <Link
            key={region.id}
            href={`/regions/${region.slug}`}
            className="card p-4 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg font-bold">{region.name}</h2>
            {region.description && (
              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                {region.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

