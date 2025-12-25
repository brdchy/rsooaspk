'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Region {
  id: string
  name: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [regionId, setRegionId] = useState('')
  const [regions, setRegions] = useState<Region[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/regions')
      .then((res) => res.json())
      .then((data) => setRegions(data))
      .catch((err) => console.error('Error fetching regions:', err))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          regionId: regionId || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Ошибка при регистрации')
        return
      }

      router.push('/account/login')
    } catch (err) {
      setError('Ошибка при регистрации. Попробуйте еще раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-custom py-12">
      <div className="max-w-md mx-auto card p-8">
        <h1 className="text-3xl font-bold mb-6">Регистрация</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Имя
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Ваше имя"
            />
          </div>

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
              minLength={6}
              className="input"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="region" className="block text-sm font-medium mb-2">
              Филиал (необязательно)
            </label>
            <select
              id="region"
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              className="input"
            >
              <option value="">Выберите филиал</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary"
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t text-center">
          <Link
            href="/account/login"
            className="text-primary-600 hover:text-primary-700"
          >
            Уже есть аккаунт? Войти
          </Link>
        </div>
      </div>
    </div>
  )
}

