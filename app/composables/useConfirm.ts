import { ConfirmModal } from '#components'

export function useConfirm() {
  const overlay = useOverlay()

  return (props: { title: string, description?: string, confirmLabel?: string }): Promise<boolean> => {
    const modal = overlay.create(ConfirmModal, { destroyOnClose: true, props })

    return modal.open().then(Boolean)
  }
}
