import { prisma } from './prisma'

export async function getSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findMany()
    return settings.reduce(
      (acc, s) => {
        acc[s.key] = s.value
        return acc
      },
      {} as Record<string, string>
    )
  } catch (error) {
    return {}
  }
}

