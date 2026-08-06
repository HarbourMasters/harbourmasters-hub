import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageSquare, Users, Crown, ExternalLink, Shield, Sparkles } from 'lucide-react'

interface DiscordData {
  name: string
  memberCount: number
  onlineCount: number
  description: string
  icon: string
  banner: string
  tag: string
  premiumTier: number
  premiumSubscriptionCount: number
  verificationLevel: number
  nsfwLevel: number
}

export function DiscordWidget() {
  const { t } = useTranslation(['common'])
  const [data, setData] = useState<DiscordData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('https://discord.com/api/v9/invites/shipofharkinian?with_counts=true')
      .then(res => res.json())
      .then(json => {
        setData({
          name: json.guild?.name || 'Harbour Masters',
          memberCount: json.approximate_member_count || 0,
          onlineCount: json.approximate_presence_count || 0,
          description: json.guild?.description || '',
          icon: json.guild?.icon || '',
          banner: json.guild?.banner || '',
          tag: json.profile?.tag || 'HM',
          premiumTier: json.profile?.premium_tier || 0,
          premiumSubscriptionCount: json.profile?.premium_subscription_count || 0,
          verificationLevel: json.guild?.verification_level || 0,
          nsfwLevel: json.guild?.nsfw_level || 0
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
  const bannerUrl = `https://cdn.discordapp.com/splashes/808039310850130000/4dee99299239dbe553112200095a8f8d.webp?size=2048`

  const activities = [
    { emoji: '🔥', label: t('common:discord.activeStatus'), desc: t('common:discord.activeChat'), color: 'text-amber-400', hoverBorder: 'hover:border-amber-400/30' },
    { emoji: '🎮', label: t('common:discord.gamingStatus'), desc: t('common:discord.gamingEvents'), color: 'text-blue-400', hoverBorder: 'hover:border-blue-400/30' },
    { emoji: '🛠️', label: t('common:discord.supportStatus'), desc: t('common:discord.helpDesk'), color: 'text-purple-400', hoverBorder: 'hover:border-purple-400/30' },
    { emoji: '🎨', label: t('common:discord.moddingStatus'), desc: t('common:discord.moddingDesc'), color: 'text-emerald-400', hoverBorder: 'hover:border-emerald-400/30' },
    { emoji: '🏁', label: t('common:discord.racesStatus'), desc: t('common:discord.racesDesc'), color: 'text-red-400', hoverBorder: 'hover:border-red-400/30' },
    { emoji: '🎉', label: t('common:discord.communityStatus'), desc: t('common:discord.communityDesc'), color: 'text-pink-400', hoverBorder: 'hover:border-pink-400/30' }
  ]

  return (
    <a
      href="https://discord.gg/shipofharkinian"
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block min-w-0"
    >
      <div className="relative border border-[var(--color-border)] rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#5865F2]/50 hover:shadow-2xl hover:shadow-[#5865F2]/15 animate-discord-glow">
        {/* Splash Background */}
        <div className="absolute inset-0">
          <img
            src={bannerUrl}
            alt=""
            className="w-full h-full object-contain object-bottom transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-background)]/30 to-[var(--color-background)]/90 backdrop-blur-[2px]" />

        {/* Content */}
        <div className="relative">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-[var(--color-border)]">
            <div className="flex items-start justify-between gap-4">
              {/* Server Icon */}
              <div className="relative shrink-0">
                {iconUrl ? (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-[var(--color-accent)]/30 shadow-lg">
                    <img
                      src={iconUrl}
                      alt={data?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <MessageSquare size={32} className="text-white" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-[var(--color-surface)]" />
              </div>

              {/* Server Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-display font-bold text-lg sm:text-xl truncate">{data?.name}</h3>
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

              {/* Crown + boost */}
              <div className="shrink-0 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
                  <Crown size={24} className="text-yellow-500" />
                </div>
                {data && data.premiumTier >= 3 && (
                  <div className="mt-1 text-[10px] font-bold text-yellow-400/80">
                    Lv.{data.premiumTier}
                  </div>
                )}
              </div>
            </div>

            {/* Trust badges */}
            {data && data.nsfwLevel === 0 && (
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--color-border)]/30">
                <div className="flex items-center gap-1.5 text-xs text-green-400/70">
                  <Shield size={12} />
                  <span>{t('common:discord.safeServer')}</span>
                </div>
                {data.premiumSubscriptionCount > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-pink-400/70">
                    <Sparkles size={12} />
                    <span>{t('common:discord.boostCount', { count: data.premiumSubscriptionCount })}</span>
                  </div>
                )}
              </div>
            )}
          </div>

        {/* Bottom Section - Member Stats */}
        <div className="p-4 sm:p-6">
          {/* Main Stats Row */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Users size={24} className="text-indigo-400" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold leading-none text-indigo-300">
                  {formatNumber(data?.memberCount || 0)}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">{t('common:discord.totalMembers')}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-500/20 flex items-center justify-center relative">
                <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold leading-none text-green-300">
                  {formatNumber(data?.onlineCount || 0)}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">{t('common:discord.onlineNow')}</div>
              </div>
            </div>
          </div>

          {/* Activity Indicators with hover effects */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            {activities.map((act, i) => (
              <div
                key={i}
                className={`text-center p-2 rounded-lg bg-[var(--color-background)]/50 border border-transparent transition-all duration-200 ${act.hoverBorder} hover:bg-[var(--color-background)]/80 hover:scale-105 cursor-default`}
              >
                <div className={`text-xs sm:text-sm font-bold truncate ${act.color}`}>{act.emoji} {act.label}</div>
                <div className="text-[10px] sm:text-xs text-[var(--color-text-muted)] truncate">{act.desc}</div>
              </div>
            ))}
          </div>

          {/* Join Button */}
          <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25">
            <MessageSquare size={20} />
            <span>{t('common:discord.joinDiscord')}</span>
            <ExternalLink size={16} className="opacity-70" />
          </div>
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
