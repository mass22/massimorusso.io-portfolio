export function copyToClipboard(toCopy: string, message?: string) {
  const toast = useToast()
  const { t } = useI18n()
  const defaultMessage = t('clipboard.copied')
  navigator.clipboard.writeText(toCopy).then(() => {
    toast.add({ title: message || defaultMessage, color: 'success', icon: 'i-lucide-check-circle' })
  })
}
