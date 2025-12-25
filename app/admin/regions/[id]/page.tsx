import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import RegionForm from '@/components/admin/RegionForm'

async function getRegionById(id: string) {
  try {
    const region = await prisma.region.findUnique({
      where: { id },
    })
    return region
  } catch (error) {
    return null
  }
}

export default async function EditRegionPage({
  params,
}: {
  params: { id: string }
}) {
  const region = await getRegionById(params.id)

  if (!region) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Редактировать филиал</h1>
      <RegionForm region={region} />
    </div>
  )
}

