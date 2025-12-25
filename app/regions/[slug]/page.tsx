import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

async function getRegionBySlug(slug: string) {
  try {
    const region = await prisma.region.findUnique({
      where: { slug },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
    return region
  } catch (error) {
    return null
  }
}

export default async function RegionPage({
  params,
}: {
  params: { slug: string }
}) {
  const region = await getRegionBySlug(params.slug)

  if (!region) {
    notFound()
  }

  return (
    <div className="container-custom py-12">
      <Link
        href="/regions"
        className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
      >
        ← Назад к филиалам
      </Link>

      <h1 className="text-4xl font-bold mb-8">{region.name}</h1>

      {region.description && (
        <div
          className="prose prose-lg max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: region.description }}
        />
      )}

      {region.users.length > 0 && (
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-4">Члены Федерации</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {region.users.map((user) => (
              <div key={user.id} className="p-4 bg-gray-50 rounded">
                <p className="font-medium">{user.name || user.email}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

