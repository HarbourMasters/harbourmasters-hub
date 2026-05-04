import { useTranslation } from 'react-i18next'
import { useState, useRef, useEffect } from 'react'
import 'flag-icons/css/flag-icons.min.css'

const languages = [
  { code: 'en', name: 'English', flag: 'us' },
  { code: 'fr', name: 'Français', flag: 'fr' },
  { code: 'de', name: 'Deutsch', flag: 'de' },
  { code: 'es', name: 'Español', flag: 'es' },
  { code: 'it', name: 'Italiano', flag: 'it' }
]

function LanguageSwitcher() {
  const { t, i18n } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
        aria-label={t('ariaLabels.selectLanguage')}
      >
        <span className={`fi fi-${currentLang.flag} rounded-sm shadow-sm`} />
        <span className="hidden sm:inline">{currentLang.code.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 min-w-[160px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg animate-fade-in">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code)
                setIsOpen(false)
              }}
              className={`
                w-full px-4 py-2 text-left flex items-center gap-3 transition-colors
                ${i18n.language === lang.code
                  ? 'bg-[var(--color-primary)] text-[var(--color-background)]'
                  : 'hover:bg-[var(--color-surface-hover)]'
                }
              `}
            >
              <span className={`fi fi-${lang.flag} rounded-sm shadow-sm`} />
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher
