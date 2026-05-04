import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { RomDropZone } from './RomDropZone'
import { RomResultSummary } from './RomResultSummary'
import { verifyRomFile, RomVerificationResult } from '@/utils/romVerifier'
import { AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

interface RomVerifierProps {
  onHashVerified?: (hash: string) => void
}

export function RomVerifier({ onHashVerified }: RomVerifierProps) {
  const { t } = useTranslation(['tools', 'common'])
  const [verifying, setVerifying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<RomVerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = useCallback(async (file: File) => {
    setVerifying(true)
    setProgress(0)
    setError(null)
    setResult(null)

    try {
      const verificationResult = await verifyRomFile(file, (prog) => {
        setProgress(prog)
      })
      setResult(verificationResult)
      onHashVerified?.(verificationResult.sha1)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('verification.error'))
    } finally {
      setVerifying(false)
    }
  }, [t, onHashVerified])

  const handleReset = useCallback(() => {
    setResult(null)
    setError(null)
    setProgress(0)
    onHashVerified?.('')
  }, [onHashVerified])

  return (
    <div className="rom-verifier">
      {/* Info Banner */}
      <div className="flex items-start gap-4 p-6 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 mb-8">
        <AlertCircle className="text-[var(--color-accent)] flex-shrink-0 mt-1" size={24} />
        <div>
          <h3 className="font-display font-bold mb-2">{t('verification.title')}</h3>
          <p className="text-[var(--color-text-muted)] mb-2">
            {t('verification.description')}
          </p>
          <Link
            to="/faq"
            className="text-[var(--color-accent)] hover:underline font-medium text-sm"
          >
            {t('verification.howToDump')}
          </Link>
        </div>
      </div>

      {/* Drop Zone */}
      <RomDropZone
        verifying={verifying}
        progress={progress}
        onFileSelect={handleFileSelect}
        disabled={verifying}
      />

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {result && !verifying && (
        <div className="mt-8">
          <RomResultSummary
            result={result}
            onReset={handleReset}
          />
        </div>
      )}
    </div>
  )
}
