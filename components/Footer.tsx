import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div>
            <h3 className="text-white font-bold mb-4">Федерация</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/federation/president" className="hover:text-white">
                  Президент
                </Link>
              </li>
              <li>
                <Link href="/federation/presidium" className="hover:text-white">
                  Президиум
                </Link>
              </li>
              <li>
                <Link href="/federation/history" className="hover:text-white">
                  История
                </Link>
              </li>
              <li>
                <Link href="/federation/contacts" className="hover:text-white">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">О спорте</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about-sport/history" className="hover:text-white">
                  История вида спорта
                </Link>
              </li>
              <li>
                <Link href="/about-sport/rules" className="hover:text-white">
                  Правила вида спорта
                </Link>
              </li>
              <li>
                <Link
                  href="/about-sport/become-athlete"
                  className="hover:text-white"
                >
                  Стать спортсменом
                </Link>
              </li>
              <li>
                <Link href="/about-sport/antidoping" className="hover:text-white">
                  Антидопинг
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Мероприятия</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/events/calendar" className="hover:text-white">
                  Календарь мероприятий
                </Link>
              </li>
              <li>
                <Link href="/events/plan" className="hover:text-white">
                  Календарный план
                </Link>
              </li>
              <li>
                <Link href="/events/regulations" className="hover:text-white">
                  Положения и регламенты
                </Link>
              </li>
              <li>
                <Link href="/events/protocols" className="hover:text-white">
                  Протоколы соревнований
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Контакты</h3>
            <ul className="space-y-2">
              <li>+7 (999) 616-36-09</li>
              <li>
                <Link href="mailto:info@rsooaspk.ru" className="hover:text-white">
                  info@rsooaspk.ru
                </Link>
              </li>
              <li>
                <Link href="/regions" className="hover:text-white">
                  Филиалы
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p>
            © {currentYear} РСОО "АСПК". Все права защищены.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white">
              Политика конфиденциальности
            </Link>
            <Link href="/personal-data" className="hover:text-white">
              Положение по работе с персональными данными
            </Link>
            <Link href="/terms" className="hover:text-white">
              Пользовательское соглашение
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

