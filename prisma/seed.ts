import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Создаем администратора
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rsooaspk.ru' },
    update: {},
    create: {
      email: 'admin@rsooaspk.ru',
      password: adminPassword,
      name: 'Администратор',
      role: 'admin',
    },
  })

  // Создаем регионы
  const regions = [
    'Москва и Московская область',
    'Санкт-Петербург',
    'Краснодарский край (Кубань)',
    'Краснодарский край (Дукалис)',
    'Республика Башкортостан',
    'Республика Алтай',
    'Ставропольский край',
    'Волгоградская область',
    'Иркутская область',
    'Калининградская область',
    'Кемеровская область',
    'Костромская область',
    'Нижегородская область',
    'Новосибирская область',
    'Омская область',
    'Псковская область',
    'Ростовская область',
    'Самарская область',
    'Саратовская область',
    'Сахалинская область',
    'Свердловская область',
    'Тульская область',
    'Тюменская область',
    'Ульяновская область',
    'Ханты-Мансийский автономный округ - Югра',
    'Ярославская область',
    'Республика Крым',
    'Ленинградская область',
    'Республика Дагестан',
    'Республика Ингушетия',
    'Ивановская область',
    'Челябинская область',
    'Республика Карелия',
    'Алтайский край',
    'Хабаровский край',
    'Республика Марий Эл',
    'Рязанская область',
    'Кировская область',
    'Чувашская Республика',
    'город Оренбург',
    'Забайкальский край',
    'Тверская область',
    'Томская область',
  ]

  for (const regionName of regions) {
    const slug = regionName.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')
    await prisma.region.upsert({
      where: { slug },
      update: {},
      create: {
        name: regionName,
        slug,
      },
    })
  }

  // Создаем пример новости
  const news = await prisma.news.create({
    data: {
      title: 'Международное физкультурное мероприятие «Кубок Евразии 2025»',
      slug: 'kubok-evrazii-2025',
      content: 'В Екатеринбурге успешно прошли международные соревнования по страйкболу.',
      excerpt: 'В Екатеринбурге успешно прошли международные соревнования по страйкболу.',
      published: true,
      publishedAt: new Date('2025-11-24'),
      authorId: admin.id,
    },
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

