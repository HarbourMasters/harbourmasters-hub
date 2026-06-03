import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X, Anchor, ChevronDown, FileSearch, Library, MessageSquare, Music } from 'lucide-react'
import { useState, useEffect } from 'react'
import LanguageSwitcher from './LanguageSwitcher'

function Header() {
  const { t } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/downloads', label: t('nav.downloads') },
    { path: '/faq', label: t('nav.faq') },
    { path: '/about', label: t('nav.about') },
    { path: '/ban-appeal', label: t('nav.banAppeal') }
  ]

  const toolsMenuItems = [
    { path: '/tools/rom-checker', label: t('nav.tools.romChecker'), icon: FileSearch, disabled: false },
    { path: '/tools/mods', label: t('nav.tools.modLibrary'), icon: Library, disabled: false },
    { path: '/tools/message-editor', label: t('nav.tools.messageEditor'), icon: MessageSquare, disabled: true },
    { path: '/tools/audio', label: t('nav.tools.audioTool'), icon: Music, disabled: true }
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  // Add glow effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])


  return (
    <>
      {/* Glow Effect */}
      {isScrolled && (
        <div className="fixed top-0 left-0 right-0 h-32 pointer-events-none z-40">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-full">
            <div className="absolute inset-0 bg-[var(--color-primary)]/20 blur-[100px]" />
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50">
        <div className={`glass transition-all duration-500 ${isScrolled ? 'shadow-lg shadow-[var(--color-primary)]/10' : ''}`}>
          <div className="container" style={{ height: 'var(--header-height)' }}>
            <div className="flex items-center justify-between h-full">
              {/* Animated Logo */}
              <Link
                to="/"
                className="group relative flex items-center gap-3 text-xl font-bold"
              >
                {/* Logo Container with Wave Effect */}
                <div className="relative w-12 h-12">
                  {/* Anchor Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Anchor className="w-6 h-6 text-[var(--color-accent)] transition-transform group-hover:rotate-12 group-hover:scale-110" />
                  </div>

                  {/* Rotating Ring */}
                  <div className="absolute inset-0 border-2 border-[var(--color-primary)]/30 rounded-full animate-[spin_8s_linear_infinite]" />
                  <div className="absolute inset-1 border border-[var(--color-accent)]/20 rounded-full animate-[spin_12s_linear_infinite_reverse]" />
                </div>

                {/* Text with Hover Effect */}
                <div className="relative pl-1">
                  <span className="gradient-text block transition-transform group-hover:translate-x-1">
                    {t('siteName')}
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--color-accent)] transition-all duration-300 group-hover:w-full" />
                </div>
              </Link>

              {/* Desktop Navigation with Bold Active State */}
              <nav className="hidden md:flex items-center gap-2">
                {navItems.slice(0, 2).map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      relative px-5 py-2.5 rounded-xl font-semibold transition-all duration-300
                      ${isActive(item.path)
                        ? 'text-[var(--color-accent)] bg-[var(--color-primary)]/10 shadow-lg shadow-[var(--color-primary)]/20'
                        : 'text-[var(--color-text)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
                      }
                    `}
                  >
                    {item.label}
                    {/* Active state glow */}
                    {isActive(item.path) && (
                      <>
                        <div className="absolute inset-0 bg-[var(--color-accent)]/10 rounded-xl animate-pulse" />
                        <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[var(--color-accent)] rounded-full shadow-lg shadow-[var(--color-accent)]/50" />
                      </>
                    )}
                  </Link>
                ))}

                {/* Tools & Modding Dropdown */}
                <div className="relative group">
                  <button
                    className={`
                      relative px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-1.5
                      ${location.pathname.startsWith('/tools')
                        ? 'text-[var(--color-accent)] bg-[var(--color-primary)]/10 shadow-lg shadow-[var(--color-primary)]/20'
                        : 'text-[var(--color-text)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
                      }
                    `}
                  >
                    {t('nav.tools')}
                    <ChevronDown size={14} className="transition-transform duration-200 group-hover:rotate-180" />
                    {location.pathname.startsWith('/tools') && (
                      <>
                        <div className="absolute inset-0 bg-[var(--color-accent)]/10 rounded-xl animate-pulse" />
                        <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[var(--color-accent)] rounded-full shadow-lg shadow-[var(--color-accent)]/50" />
                      </>
                    )}
                  </button>

                  {/* Dropdown */}
                  <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl shadow-[var(--color-primary)]/10 backdrop-blur-xl min-w-[280px] py-2">
                      {toolsMenuItems.map((item) => {
                        const Icon = item.icon
                        if (item.disabled) {
                          return (
                            <div
                              key={item.path}
                              className="flex items-center justify-between px-4 py-3 text-[var(--color-text-muted)] opacity-50 cursor-default select-none"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/5 flex items-center justify-center flex-shrink-0">
                                  <Icon size={16} className="text-[var(--color-text-muted)]" />
                                </div>
                                <span className="font-medium text-sm">{item.label}</span>
                              </div>
                              <span className="text-xs italic animate-[wave_2s_ease-in-out_infinite] origin-bottom-right">
                                {t('nav.tools.comingSoon')}
                              </span>
                            </div>
                          )
                        }
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-text)]"
                          >
                            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                              <Icon size={16} className="text-[var(--color-accent)]" />
                            </div>
                            <span className="font-medium text-sm">{item.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {navItems.slice(2).map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      relative px-5 py-2.5 rounded-xl font-semibold transition-all duration-300
                      ${isActive(item.path)
                        ? 'text-[var(--color-accent)] bg-[var(--color-primary)]/10 shadow-lg shadow-[var(--color-primary)]/20'
                        : 'text-[var(--color-text)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
                      }
                    `}
                  >
                    {item.label}
                    {isActive(item.path) && (
                      <>
                        <div className="absolute inset-0 bg-[var(--color-accent)]/10 rounded-xl animate-pulse" />
                        <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[var(--color-accent)] rounded-full shadow-lg shadow-[var(--color-accent)]/50" />
                      </>
                    )}
                  </Link>
                ))}
              </nav>

              {/* Right Side */}
              <div className="flex items-center gap-3">
                {/* Animated Globe/Language */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-[var(--color-primary)]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <LanguageSwitcher />
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="md:hidden relative p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-all duration-300 group"
                  aria-label={t('common:ariaLabels.toggleMenu')}
                >
                  <div className="absolute inset-0 bg-[var(--color-primary)]/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
                  {isOpen ? (
                    <X size={24} className="relative z-10 transition-transform duration-300 rotate-90" />
                  ) : (
                    <Menu size={24} className="relative z-10" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation with Staggered Animations */}
        {isOpen && (
          <nav className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-xl overflow-hidden">
            <div className="container py-4">
              {navItems.map((item, index) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    block px-4 py-3 rounded-lg font-medium transition-all duration-300 mb-1
                    animate-slide-in-right
                    ${isActive(item.path)
                      ? 'bg-[var(--color-primary)] text-[var(--color-background)] shadow-lg shadow-[var(--color-primary)]/25'
                      : 'text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] hover:translate-x-2'
                    }
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-1 h-4 rounded-full transition-all duration-300 ${isActive(item.path) ? 'bg-[var(--color-background)]' : 'bg-[var(--color-primary)]/30 group-hover:bg-[var(--color-primary)]'}`} />
                    {item.label}
                  </span>
                </Link>
              ))}

              {/* Tools & Modding section */}
              <div className="mt-2 mb-1 animate-slide-in-right" style={{ animationDelay: `${navItems.length * 50}ms` }}>
                <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  {t('nav.tools')}
                </div>
                {toolsMenuItems.map((item, index) => {
                  const Icon = item.icon
                  if (item.disabled) {
                    return (
                      <div
                        key={item.path}
                        className="flex items-center justify-between px-4 py-3 rounded-lg mb-1 text-[var(--color-text-muted)] opacity-50 cursor-default select-none"
                        style={{ animationDelay: `${(navItems.length + 1 + index) * 50}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--color-primary)]/5">
                            <Icon size={16} className="text-[var(--color-text-muted)]" />
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <span className="text-xs italic animate-[wave_2s_ease-in-out_infinite]">
                          {t('nav.tools.comingSoon')}
                        </span>
                      </div>
                    )
                  }
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 mb-1
                        ${isActive(item.path)
                          ? 'bg-[var(--color-primary)] text-[var(--color-background)] shadow-lg shadow-[var(--color-primary)]/25'
                          : 'text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] hover:translate-x-2'
                        }
                      `}
                      style={{ animationDelay: `${(navItems.length + 1 + index) * 50}ms` }}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive(item.path) ? 'bg-white/20' : 'bg-[var(--color-primary)]/10'}`}>
                        <Icon size={16} className={isActive(item.path) ? 'text-[var(--color-background)]' : 'text-[var(--color-accent)]'} />
                      </div>
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          </nav>
        )}
      </header>
    </>
  )
}

export default Header
