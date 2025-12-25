import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container-custom py-20 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Страница не найдена</h2>
      <p className="text-gray-600 mb-8">
        Страница, которую вы ищете, не существует.
      </p>
      <Link href="/" className="btn btn-primary">
        Вернуться на главную
      </Link>
    </div>
  )
}

