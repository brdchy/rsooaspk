'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Ошибка при входе')
        return
      }

      // Сохраняем данные пользователя в localStorage (в реальном приложении используйте сессии/JWT)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/admin')
      router.refresh()
    } catch (err) {
      setError('Ошибка при входе. Попробуйте еще раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-custom py-12">
      <div className="max-w-md mx-auto card p-8">
        <h1 className="text-3xl font-bold mb-6">Вход в личный кабинет</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/account/register"
            className="text-primary-600 hover:text-primary-700"
          >
            Забыли пароль?
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/account/register"
            className="text-primary-600 hover:text-primary-700"
          >
            Зарегистрироваться
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t">
          <Link
            href="/account"
            className="text-gray-600 hover:text-gray-800"
          >
            ← Назад
          </Link>
        </div>
      </div>
    </div>
  )
}

