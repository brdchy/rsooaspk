import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import DocumentForm from '@/components/admin/DocumentForm'

// Отключаем кэширование для динамического контента
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getDocumentById(id: string) {
  try {
    const document = await prisma.document.findUnique({
      where: { id },
    })
    return document
  } catch (error) {
    return null
  }
}

export default async function EditDocumentPage({
  params,
}: {
  params: { id: string }
}) {
  const document = await getDocumentById(params.id)

  if (!document) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Редактировать документ</h1>
      <DocumentForm document={document} />
    </div>
  )
}


