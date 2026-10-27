export function useCopy() {
  const toast = useToast()

  return async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
      toast.add({ title: t('common.copied'), color: 'success', icon: 'i-lucide-check' })
    }
    catch {
      toast.add({ title: t('common.copyFailed'), color: 'error' })
    }
  }
}
