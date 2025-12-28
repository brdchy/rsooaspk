import { prisma } from './prisma'
import { predefinedSubsections } from './subsections'

// Структура для хранения названий
interface SectionTitlesData {
  sectionTitles: Record<string, string>
  subsectionTitles: Record<string, Record<string, string>>
}

// Названия по умолчанию
const defaultSectionTitles: Record<string, string> = {
  federation: 'Федерация',
  'about-sport': 'О спорте',
  refereeing: 'Судейство',
  events: 'Мероприятия',
  news: 'Новости',
  documents: 'Документы',
  regions: 'Филиалы',
}

const defaultSubsectionTitles: Record<string, Record<string, string>> = {
  federation: {
    president: 'Президент',
    presidium: 'Президиум',
    history: 'История',
    contacts: 'Контакты',
  },
  'about-sport': {
    history: 'История вида спорта',
    rules: 'Правила вида спорта',
    'become-athlete': 'Стать спортсменом',
    antidoping: 'Антидопинг',
    about: 'О страйкболе',
  },
  refereeing: {
    regulations: 'Положения о судьях',
    requirements: 'Квалификационные требования',
    rules: 'Правила соревнований',
    registry: 'Реестр судей',
    training: 'Обучение судей',
  },
  events: {
    calendar: 'Календарь мероприятий',
    plan: 'Календарный план',
    regulations: 'Положения и регламенты',
    protocols: 'Протоколы соревнований',
  },
  documents: {
    ministry: 'Министерство спорта',
    decisions: 'Решения руководящих органов',
    teams: 'Сборные команды',
    samples: 'Образцы документов',
    charter: 'Устав',
  },
}

/**
 * Получить все названия разделов и подразделов из БД
 */
export async function getSectionTitles(): Promise<SectionTitlesData> {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { key: 'sectionTitles' },
    })

    if (settings?.value) {
      const data = JSON.parse(settings.value) as SectionTitlesData
      // Мерджим с дефолтными значениями на случай, если что-то новое добавилось
      return {
        sectionTitles: { ...defaultSectionTitles, ...data.sectionTitles },
        subsectionTitles: {
          ...defaultSubsectionTitles,
          ...data.subsectionTitles,
        },
      }
    }

    return {
      sectionTitles: defaultSectionTitles,
      subsectionTitles: defaultSubsectionTitles,
    }
  } catch (error) {
    console.error('Error fetching section titles:', error)
    return {
      sectionTitles: defaultSectionTitles,
      subsectionTitles: defaultSubsectionTitles,
    }
  }
}

/**
 * Получить название раздела
 */
export async function getSectionTitle(section: string): Promise<string> {
  const titles = await getSectionTitles()
  return titles.sectionTitles[section] || section
}

/**
 * Получить название подраздела
 */
export async function getSubsectionTitle(
  section: string,
  subsection: string
): Promise<string> {
  const titles = await getSectionTitles()
  return titles.subsectionTitles[section]?.[subsection] || subsection
}

/**
 * Получить все подразделы для раздела с названиями
 */
export async function getSubsectionsWithTitles(
  section: string
): Promise<Array<{ key: string; title: string }>> {
  const titles = await getSectionTitles()
  const subsections = predefinedSubsections[section] || []

  return subsections.map((key) => ({
    key,
    title: titles.subsectionTitles[section]?.[key] || key,
  }))
}

/**
 * Сохранить названия разделов и подразделов в БД
 */
export async function saveSectionTitles(
  data: SectionTitlesData
): Promise<void> {
  await prisma.siteSettings.upsert({
    where: { key: 'sectionTitles' },
    update: { value: JSON.stringify(data) },
    create: {
      key: 'sectionTitles',
      value: JSON.stringify(data),
      description: 'Названия разделов и подразделов сайта',
    },
  })
}

