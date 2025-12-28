import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' 
      ? [{ level: 'error', emit: 'event' }, { level: 'warn', emit: 'event' }]
      : [{ level: 'query', emit: 'event' }, { level: 'error', emit: 'event' }, { level: 'warn', emit: 'event' }],
  })

// Детальное логирование всех запросов Prisma
if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query' as never, (e: any) => {
    console.log('[PRISMA QUERY]')
    console.log('[PRISMA QUERY] Query:', e.query)
    console.log('[PRISMA QUERY] Params:', e.params)
    console.log('[PRISMA QUERY] Duration:', e.duration, 'ms')
    console.log('[PRISMA QUERY] Timestamp:', new Date().toISOString())
  })
}

prisma.$on('error' as never, (e: any) => {
  console.error('[PRISMA ERROR]')
  console.error('[PRISMA ERROR] Message:', e.message)
  console.error('[PRISMA ERROR] Target:', e.target)
  console.error('[PRISMA ERROR] Timestamp:', new Date().toISOString())
})

prisma.$on('warn' as never, (e: any) => {
  console.warn('[PRISMA WARN]')
  console.warn('[PRISMA WARN] Message:', e.message)
  console.warn('[PRISMA WARN] Timestamp:', new Date().toISOString())
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Проверка подключения к БД при инициализации
console.log('[PRISMA] Инициализация Prisma Client...')
console.log('[PRISMA] DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...' || 'не установлен')
console.log('[PRISMA] NODE_ENV:', process.env.NODE_ENV)

prisma.$connect()
  .then(() => {
    console.log('[PRISMA] ✓ Подключение к БД успешно установлено')
  })
  .catch((error) => {
    console.error('[PRISMA] ✗ Ошибка подключения к БД:', error)
    console.error('[PRISMA] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    })
  })


