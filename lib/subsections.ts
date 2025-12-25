/**
 * Предопределенные подразделы для каждого раздела
 * Эти подразделы используются даже если страницы еще не созданы в БД
 */

export const predefinedSubsections: Record<string, string[]> = {
  federation: ['president', 'presidium', 'history', 'contacts'],
  'about-sport': [
    'history',
    'rules',
    'become-athlete',
    'antidoping',
    'about',
  ],
  refereeing: [
    'regulations',
    'requirements',
    'rules',
    'registry',
    'training',
  ],
}

export function getAllSubsectionsForSection(section: string): string[] {
  return predefinedSubsections[section] || []
}

