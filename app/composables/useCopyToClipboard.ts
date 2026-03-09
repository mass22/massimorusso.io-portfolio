/**
 * Composable pour copier du texte dans le presse-papiers.
 * Doit être appelé au top-level du setup pour que useToast/useI18n fonctionnent.
 * @param successMessage - Message par défaut en cas de succès (optionnel)
 */
export function useCopyToClipboard(successMessage?: string) {
  const toast = useToast()
  const { t } = useI18n()
  const defaultMessage = successMessage ?? t('clipboard.copied')

  return (toCopy: string, message?: string) => {
    if (!toCopy || typeof toCopy !== 'string') {
      return
    }

    const msg = message ?? defaultMessage

    const showSuccess = () => {
      toast.add({ color: 'success', icon: 'i-lucide-check-circle', title: msg })
    }

    const showError = () => {
      toast.add({ color: 'error', icon: 'i-lucide-alert-circle', title: t('clipboard.error') })
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(toCopy).then(showSuccess).catch(() => {
        if (tryCopyWithExecCommand(toCopy)) {
          showSuccess()
        } else {
          showError()
        }
      })
    } else {
      if (tryCopyWithExecCommand(toCopy)) {
        showSuccess()
      } else {
        showError()
      }
    }
  }
}

function tryCopyWithExecCommand(text: string): boolean {
  if (typeof document === 'undefined') return false
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  Object.assign(textarea.style, {
    position: 'fixed',
    left: '-9999px',
    top: '0',
    opacity: '0.01',
    pointerEvents: 'none'
  })
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  textarea.setSelectionRange(0, text.length)
  try {
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    document.body.removeChild(textarea)
  }
}
