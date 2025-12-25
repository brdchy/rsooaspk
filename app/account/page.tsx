import Link from 'next/link'

export default function AccountPage() {
  return (
    <div className="container-custom py-12">
      <div className="max-w-md mx-auto card p-8">
        <h1 className="text-3xl font-bold mb-6">Личный кабинет</h1>
        <div className="space-y-4">
          <Link
            href="/account/login"
            className="block w-full btn btn-primary text-center"
          >
            Войти
          </Link>
          <Link
            href="/account/register"
            className="block w-full btn btn-secondary text-center"
          >
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  )
}

