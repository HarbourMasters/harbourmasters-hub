import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageSquare, Users, Crown, ExternalLink } from 'lucide-react'

interface DiscordData {
  name: string
  memberCount: number
  onlineCount: number
  description: string
  icon: string
  banner: string
  splash: string
  tag: string
}

export function DiscordWidget() {
  const { t } = useTranslation(['common'])
  const [data, setData] = useState<DiscordData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch Discord invite data
    fetch('https://discord.com/api/v9/invites/shipofharkinian?with_counts=true')
      .then(res => res.json())
      .then(json => {
        setData({
          name: json.guild?.name || 'Harbour Masters 64',
          memberCount: json.approximate_member_count || 0,
          onlineCount: json.approximate_presence_count || 0,
          description: json.guild?.description || '',
          icon: json.guild?.icon || '',
          banner: json.guild?.banner || '',
          splash: json.profile?.custom_banner_hash || '',
          tag: json.profile?.tag || 'HM64'
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8 animate-pulse">
        <div className="h-6 w-48 bg-[var(--color-border)] rounded mb-4" />
        <div className="h-4 w-64 bg-[var(--color-border)] rounded" />
      </div>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toString()
  }

  const iconUrl = data?.icon
    ? `https://cdn.discordapp.com/icons/808039310850130000/${data.icon}.gif`
    : null
  const bannerUrl = data?.splash
    ? `https://cdn.discordapp.com/splashes/808039310850130000/${data.splash}.jpg`
    : null

  return (
    <a
      href="https://discord.gg/shipofharkinian"
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block"
    >
      {/* Banner Background */}
      {bannerUrl && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${bannerUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/80 to-[var(--color-background)]/50" />
        </div>
      )}

      <div className="relative bg-[var(--color-surface)]/80 backdrop-blur border border-[var(--color-border)] rounded-2xl overflow-hidden transition-all duration-300 hover:border-[var(--color-accent)] hover:shadow-2xl hover:shadow-[var(--color-accent)]/10">
        {/* Top Section - Icon & Stats */}
        <div className="p-6 border-b border-[var(--color-border)]">
          <div className="flex items-start justify-between gap-4">
            {/* Server Icon */}
            <div className="relative shrink-0">
              {iconUrl ? (
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[var(--color-accent)]/30 shadow-lg">
                  <img
                    src={iconUrl}
                    alt={data?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <MessageSquare size={32} className="text-white" />
                </div>
              )}
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-[var(--color-surface)]" />
            </div>

            {/* Server Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-display font-bold text-xl truncate">{data?.name}</h3>
                {data?.tag && (
                  <span className="px-2 py-0.5 rounded-md bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-bold shrink-0">
                    {data.tag}
                  </span>
                )}
              </div>
              {data?.description && (
                <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">{data.description}</p>
              )}
            </div>

            {/* Crown Badge (Level 3 server) */}
            <div className="shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
                <Crown size={24} className="text-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Member Stats */}
        <div className="p-6">
          {/* Main Stats Row - Swapped: Total Left, Online Right */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Total Members - Now on Left */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
              <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Users size={24} className="text-indigo-400" />
              </div>
              <div>
                <div className="text-2xl font-bold leading-none text-indigo-300">
                  {formatNumber(data?.memberCount || 0)}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">{t('common:discord.totalMembers')}</div>
              </div>
            </div>

            {/* Online Members - Now on Right */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center relative">
                <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
              </div>
              <div>
                <div className="text-2xl font-bold leading-none text-green-300">
                  {formatNumber(data?.onlineCount || 0)}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">{t('common:discord.onlineNow')}</div>
              </div>
            </div>
          </div>

          {/* Activity Indicators */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 rounded-lg bg-[var(--color-background)]/50">
              <div className="text-lg font-bold text-amber-400">🔥 {t('common:discord.activeStatus')}</div>
              <div className="text-xs text-[var(--color-text-muted)]">{t('common:discord.activeChat')}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-[var(--color-background)]/50">
              <div className="text-lg font-bold text-blue-400">🎮 {t('common:discord.gamingStatus')}</div>
              <div className="text-xs text-[var(--color-text-muted)]">{t('common:discord.gamingEvents')}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-[var(--color-background)]/50">
              <div className="text-lg font-bold text-purple-400">🛠️ {t('common:discord.supportStatus')}</div>
              <div className="text-xs text-[var(--color-text-muted)]">{t('common:discord.helpDesk')}</div>
            </div>
          </div>

          {/* Join Button */}
          <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-colors">
            <MessageSquare size={20} />
            <span>{t('common:discord.joinDiscord')}</span>
            <ExternalLink size={16} className="opacity-70" />
          </div>
        </div>
      </div>
    </a>
  )
}

// Compact version for footer/sidebar
export function DiscordWidgetCompact() {
  const { t } = useTranslation(['common'])
  const [data, setData] = useState<{ memberCount: number; onlineCount: number } | null>(null)

  useEffect(() => {
    fetch('https://discord.com/api/v9/invites/shipofharkinian?with_counts=true')
      .then(res => res.json())
      .then(json => {
        setData({
          memberCount: json.approximate_member_count || 0,
          onlineCount: json.approximate_presence_count || 0
        })
      })
  }, [])

  if (!data) return null

  return (
    <a
      href="https://discord.gg/shipofharkinian"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors"
    >
      <div className="relative">
        <MessageSquare size={18} className="text-indigo-400" />
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[var(--color-background)]" />
      </div>
      <div className="text-sm">
        <span className="font-bold text-indigo-400">{data.onlineCount.toLocaleString()}</span>
        <span className="text-[var(--color-text-muted)]"> {t('common:discord.online')}</span>
      </div>
    </a>
  )
}
