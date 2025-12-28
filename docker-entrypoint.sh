#!/bin/sh
set -e

# Устанавливаем путь к базе данных (если не задан в переменных окружения)
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:./data/prisma.db"
fi

# Создаем директорию для базы данных, если её нет
mkdir -p /app/data

# Инициализируем базу данных, если используется SQLite и файл базы не существует
if echo "$DATABASE_URL" | grep -q "file:"; then
  # Извлекаем путь к файлу из DATABASE_URL (file:./data/prisma.db -> ./data/prisma.db)
  DB_FILE=$(echo "$DATABASE_URL" | sed 's|^file:||')
  
  # Если путь относительный, делаем его абсолютным
  case "$DB_FILE" in
    /*) ;;  # Уже абсолютный путь
    *) DB_FILE="/app/$DB_FILE" ;;  # Относительный путь
  esac
  
  # Создаем директорию для файла базы данных, если её нет
  DB_DIR=$(dirname "$DB_FILE")
  mkdir -p "$DB_DIR"
  
  if [ ! -f "$DB_FILE" ]; then
    echo "=========================================="
    echo "База данных не найдена. Инициализируем..."
    echo "=========================================="
    prisma db push --skip-generate --accept-data-loss || echo "Предупреждение: Не удалось применить схему базы данных"
    
    # Заполняем базу данных начальными данными
    if [ -f "/app/prisma/seed.ts" ]; then
      echo "Заполняем базу данных начальными данными..."
      tsx /app/prisma/seed.ts || echo "Предупреждение: Сидирование базы данных не удалось (возможно, данные уже существуют)"
      echo "Инициализация завершена!"
    fi
  else
    echo "База данных найдена. Проверяем схему..."
    prisma db push --skip-generate --accept-data-loss || echo "Предупреждение: Не удалось обновить схему базы данных"
  fi
fi

# Запускаем команду, переданную как аргумент
exec "$@"

