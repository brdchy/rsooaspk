# Инструкция по развертыванию на хостинге

## Подготовка к развертыванию

1. **Клонируйте репозиторий на сервер:**
```bash
git clone <your-repo-url>
cd sfed
```

2. **Создайте файл `.env` на сервере:**
```bash
# База данных
DATABASE_URL="file:./data/prisma.db"

# Next.js
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# Секретный ключ (сгенерируйте новый)
NEXTAUTH_SECRET="your-strong-secret-key-here"
NEXTAUTH_URL="https://rsooaspk.ru"

# VK (опционально)
VK_GROUP_ID=225463959
```

## Способ 1: Развертывание с Docker

### Требования
- Docker 20.10+
- Docker Compose 2.0+

### Запуск

1. **Соберите и запустите контейнер:**
```bash
docker-compose up -d --build
```

2. **Проверьте логи:**
```bash
docker-compose logs -f app
```

3. **Остановка:**
```bash
docker-compose down
```

### Обновление

```bash
git pull
docker-compose up -d --build
```

## Способ 2: Развертывание без Docker

### Требования
- Node.js 20+
- npm или yarn

### Установка

1. **Установите зависимости:**
```bash
npm install
```

2. **Создайте директорию для базы данных:**
```bash
mkdir -p data
```

3. **Инициализируйте базу данных:**
```bash
npm run db:push
npm run db:seed
```

4. **Соберите приложение:**
```bash
npm run build
```

5. **Запустите сервер:**
```bash
npm start
```

### Запуск с PM2 (рекомендуется)

```bash
# Установите PM2
npm install -g pm2

# Запустите приложение
pm2 start npm --name "rsooaspk" -- start

# Сохраните конфигурацию PM2
pm2 save

# Настройте автозапуск
pm2 startup
```

## Настройка Nginx (реверс-прокси)

Создайте файл `/etc/nginx/sites-available/rsooaspk`:

```nginx
server {
    listen 80;
    server_name rsooaspk.ru www.rsooaspk.ru;

    # Редирект на HTTPS (после настройки SSL)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Максимальный размер загружаемых файлов
    client_max_body_size 50M;
}
```

Активируйте конфигурацию:
```bash
sudo ln -s /etc/nginx/sites-available/rsooaspk /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Настройка SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d rsooaspk.ru -d www.rsooaspk.ru
```

## Резервное копирование базы данных

Для SQLite:
```bash
# Создание резервной копии
cp data/prisma.db data/prisma.db.backup-$(date +%Y%m%d-%H%M%S)

# Восстановление
cp data/prisma.db.backup-YYYYMMDD-HHMMSS data/prisma.db
```

## Мониторинг и логи

### Docker
```bash
# Просмотр логов
docker-compose logs -f app

# Использование ресурсов
docker stats rsooaspk-app
```

### PM2
```bash
# Просмотр логов
pm2 logs rsooaspk

# Мониторинг
pm2 monit

# Статус
pm2 status
```

## Обновление приложения

### С Docker:
```bash
git pull
docker-compose up -d --build
```

### Без Docker:
```bash
git pull
npm install
npm run build
pm2 restart rsooaspk
# или
npm start
```

## Переключение на PostgreSQL (рекомендуется для продакшна)

1. **Обновите `prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. **Обновите `DATABASE_URL` в `.env`:**
```
DATABASE_URL="postgresql://user:password@localhost:5432/rsooaspk?schema=public"
```

3. **Обновите `docker-compose.yml`** для добавления PostgreSQL сервиса (если используете Docker)

4. **Примените миграции:**
```bash
npm run db:push
```

## Автоматическая синхронизация с VK

Создайте cron задачу:
```bash
# Редактируйте crontab
crontab -e

# Добавьте строку (синхронизация каждый час)
0 * * * * cd /path/to/sfed && docker-compose exec -T app npm run vk:sync
```

Или используйте PM2 с cron:
```bash
pm2 start scripts/vk-sync-daemon.ts --name vk-sync --interpreter tsx
```

## Решение проблем

### Приложение не запускается
- Проверьте логи: `docker-compose logs app` или `pm2 logs`
- Убедитесь, что порт 3000 не занят: `netstat -tulpn | grep 3000`
- Проверьте переменные окружения в `.env`

### База данных не создается
- Проверьте права доступа к директории `data/`
- Убедитесь, что `DATABASE_URL` правильно настроен
- Запустите вручную: `npx prisma db push`

### Ошибки при сборке
- Очистите кэш: `rm -rf .next node_modules`
- Переустановите зависимости: `npm install`
- Проверьте версию Node.js: `node --version` (должна быть 20+)

