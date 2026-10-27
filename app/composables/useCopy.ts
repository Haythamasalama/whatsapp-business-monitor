export function useCopy() {
  const toast = useToast()

  return async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
      toast.add({ title: 'نُسخ النص', color: 'success', icon: 'i-lucide-check' })
    }
    catch {
      toast.add({ title: 'تعذّر النسخ', color: 'error' })
    }
  }
}
