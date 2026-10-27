<script setup lang="ts">
const { accounts, accountId, current, loading, templates, lastLoadedAt, loadAccounts, loadAccountData, switchAccount } = useManager()
const toast = useToast()

useStatusAlerts()

// Like a query cache: data older than STALE_MS is refetched when the tab regains focus, and while a
// template waits for review the page polls, so an approval shows up without touching anything.
const STALE_MS = 30_000
const POLL_MS = 60_000
let poll: ReturnType<typeof setInterval> | undefined

function refreshIfStale(): void {
  if (document.visibilityState === 'visible' && accountId.value && !loading.value && Date.now() - lastLoadedAt.value > STALE_MS) {
    void loadAccountData({ silent: true })
  }
}

const lastLoaded = computed(() => (lastLoadedAt.value
  ? new Intl.DateTimeFormat('ar-u-nu-latn', { hour: 'numeric', minute: '2-digit' }).format(lastLoadedAt.value)
  : ''))

onMounted(() => {
  window.addEventListener('focus', refreshIfStale)
  document.addEventListener('visibilitychange', refreshIfStale)
  poll = setInterval(() => {
    if (templates.value.some(template => ['PENDING', 'IN_APPEAL'].includes(template.status))) {
      refreshIfStale()
    }
  }, POLL_MS)
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', refreshIfStale)
  document.removeEventListener('visibilitychange', refreshIfStale)
  clearInterval(poll)
})

const accountOpen = ref(false)
const editingAccount = ref<AccountSummary | null>(null)
const pasteOpen = ref(false)
const draftsOpen = ref(false)
const templateOpen = ref(false)
const drafts = ref<Draft[]>([])
const draftsTitle = ref('')
const opened = ref<{ name: string | null, id?: string }>({ name: null })
const templateMode = ref<'view' | 'edit'>('view')
const booting = ref(true)

const accountItems = computed(() => accounts.value.map(account => ({
  value: account.id,
  label: accountTitle(account),
})))

const subtitle = computed(() => {
  if (!current.value) {
    return ''
  }

  return current.value.phones.map(phone => phone.display_phone_number).join('، ')
})

function openAccount(account: AccountSummary | null = null): void {
  editingAccount.value = account
  accountOpen.value = true
}

function openDrafts(list: Draft[], title: string): void {
  drafts.value = list
  draftsTitle.value = title
  draftsOpen.value = true
}

function openTemplate(name: string, mode: 'view' | 'edit', id?: string): void {
  opened.value = { name, id }
  templateMode.value = mode
  templateOpen.value = true
}

onMounted(async () => {
  try {
    await loadAccounts()

    if (!accounts.value.length) {
      openAccount()
    }
  }
  catch (error) {
    toast.add({ title: 'تعذّر تحميل الحسابات', description: (error as Error).message, color: 'error' })
  }
  finally {
    booting.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-muted lg:flex">
    <aside class="hidden w-64 shrink-0 flex-col gap-6 px-3 py-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:overflow-y-auto">
      <AppBrand class="px-2" />

      <nav>
        <span class="flex items-center gap-2.5 rounded-lg bg-elevated px-3 py-2 text-sm font-medium text-highlighted">
          <UIcon name="i-lucide-layout-dashboard" class="size-4.5" /> لوحة المراقبة
        </span>
      </nav>

      <USeparator />

      <AccountsSidebar @add="openAccount()" @edit="openAccount" />
    </aside>

    <div class="flex min-w-0 flex-1 flex-col gap-3 p-3 lg:ps-0">
      <header class="flex flex-wrap items-center justify-between gap-3 px-1 lg:min-h-10">
        <div class="flex min-w-0 items-center gap-2 lg:hidden">
          <AppBrand compact />
          <USelect
            v-if="accounts.length"
            :model-value="accountId ?? undefined"
            :items="accountItems"
            class="w-52 max-w-full"
            aria-label="الحساب"
            @update:model-value="(id) => switchAccount(String(id))"
          />
        </div>
        <span class="hidden lg:block" />

        <div class="flex items-center gap-1 rounded-lg border border-default bg-default p-1">
          <UTooltip :text="lastLoaded ? `تحديث البيانات · آخر تحديث ${lastLoaded}` : 'تحديث البيانات'">
            <UButton icon="i-lucide-refresh-cw" color="neutral" variant="ghost" size="sm" aria-label="تحديث البيانات" :loading="loading" :disabled="!accountId" @click="loadAccountData()" />
          </UTooltip>
          <UTooltip text="إضافة حساب">
            <UButton icon="i-lucide-user-plus" color="neutral" variant="ghost" size="sm" aria-label="إضافة حساب" class="lg:hidden" @click="openAccount()" />
          </UTooltip>
          <UTooltip text="الوضع الفاتح أو الداكن">
            <UColorModeButton size="sm" />
          </UTooltip>
        </div>
      </header>

      <main class="flex-1 space-y-6 rounded-2xl border border-default bg-default p-4 sm:p-6 lg:p-8">
        <div v-if="current" class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <h1 class="text-2xl font-bold text-highlighted">
              {{ accountTitle(current) }}
            </h1>
            <p class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
              <span v-if="subtitle" class="inline-flex items-center gap-1.5">
                <UIcon name="i-lucide-phone" class="size-3.5 text-dimmed" />
                <bdi dir="ltr">{{ subtitle }}</bdi>
              </span>
              <span class="inline-flex items-center gap-1.5">
                <UIcon name="i-lucide-building-2" class="size-3.5 text-dimmed" />
                حساب الأعمال <bdi dir="ltr" class="font-mono text-xs">{{ current.waba_id }}</bdi>
              </span>
            </p>
          </div>
          <UButton label="تعديل الحساب" icon="i-lucide-pencil" color="neutral" variant="outline" size="sm" @click="openAccount(current)" />
        </div>

        <UAlert
          v-if="current?.error"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          title="تعذّر الوصول إلى الحساب"
          :description="current.error"
        />

        <div v-if="booting" class="space-y-4">
          <USkeleton class="h-8 w-56" />
          <USkeleton class="h-32 w-full rounded-xl" />
        </div>

        <div v-else-if="!accounts.length" class="grid place-items-center gap-3 py-20 text-center">
          <span class="grid size-14 place-items-center rounded-full bg-elevated text-muted">
            <UIcon name="i-lucide-message-circle-plus" class="size-6" />
          </span>
          <p class="font-semibold text-highlighted">
            لا يوجد حساب بعد
          </p>
          <UButton label="إضافة حساب" icon="i-lucide-plus" @click="openAccount()" />
        </div>

        <template v-else-if="accountId">
          <StatsCards />
          <TemplatesPanel
            @open="openTemplate"
            @create="openDrafts([newDraft()], 'قالب جديد')"
            @paste="pasteOpen = true"
          />
        </template>
      </main>

      <AppFooter />
    </div>

    <AccountModal v-model:open="accountOpen" :account="editingAccount" />
    <PasteModal v-model:open="pasteOpen" @parsed="(list) => openDrafts(list, list.length > 1 ? `من كود القالب (${list.length} قوالب)` : 'من كود القالب')" />
    <DraftsModal v-model:open="draftsOpen" v-model:drafts="drafts" :title="draftsTitle" />
    <TemplateModal v-model:open="templateOpen" v-model:mode="templateMode" :name="opened.name" :initial-id="opened.id" />
  </div>
</template>
