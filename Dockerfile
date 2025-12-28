# Используем официальный образ Node.js на Debian для лучшей совместимости с Prisma
FROM node:20-slim AS base

# Устанавливаем зависимости только при необходимости
FROM base AS deps
# Устанавливаем необходимые системные библиотеки для Prisma и других зависимостей
RUN apt-get update && apt-get install -y \
    openssl \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Копируем файлы зависимостей
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Устанавливаем зависимости
RUN npm ci

# Ребилдим исходный код только при необходимости
FROM base AS builder
# Убеждаемся что OpenSSL установлен для Prisma генерации
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Генерируем Prisma Client
RUN npx prisma generate

# Собираем приложение (output: standalone будет создан автоматически)
RUN npm run build

# Продакшн образ, копируем только необходимые файлы
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

# Устанавливаем OpenSSL и другие необходимые библиотеки для Prisma
# В Debian-based образах OpenSSL уже установлен, но убеждаемся что всё на месте
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Устанавливаем tsx и prisma глобально для запуска seed скрипта и миграций
RUN npm install -g tsx prisma

# Создаем директории для базы данных и файлов
RUN mkdir -p /app/data /app/public/uploads && \
    chown -R nextjs:nodejs /app/data /app/public/uploads

# Копируем standalone билд
COPY --from=builder /app/public ./public

# Автоматически использует output: 'standalone' в next.config.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Копируем необходимые файлы для инициализации БД
# (prisma уже скопирована выше, но убеждаемся что seed.ts тоже скопирован)
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Убеждаемся что необходимые зависимости доступны для seed скрипта
# Prisma Client, bcryptjs и другие нужные пакеты
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bcryptjs ./node_modules/bcryptjs

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Запускаем инициализацию БД и приложение
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]

