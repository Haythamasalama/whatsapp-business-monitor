<script setup lang="ts">
const { accounts, accountId, current, loading, templates, lastLoadedAt, screen, summaryLoading, summaryLoadedAt, loadAccounts, loadAccountData, loadSummary, switchAccount, showOverview } = useManager()

const onAccount = computed(() => screen.value === 'account')
const { signOut } = useSession()
const toast = useToast()

useStatusAlerts()

// Like a query cache: data older than STALE_MS is refetched when the tab regains focus, and while a
// template waits for review the page polls, so an approval shows up without touching anything.
const STALE_MS = 30_000
const POLL_MS = 60_000
let poll: ReturnType<typeof setInterval> | undefined

const onOverview = computed(() => screen.value === 'overview')
const refreshing = computed(() => (onOverview.value ? summaryLoading.value : onAccount.value && loading.value))
const loadedAt = computed(() => (onOverview.value ? summaryLoadedAt.value : lastLoadedAt.value))

function refresh(silent = false): Promise<void> {
  if (screen.value === 'accounts' || screen.value === 'settings') {
    return loadAccounts()
  }

  // The button reads Meta again; quiet refreshes take the server's cache, which renews itself in the background.
  return onOverview.value ? loadSummary({ silent, fresh: !silent }) : loadAccountData({ silent, fresh: !silent })
}

function refreshIfStale(): void {
  if (document.visibilityState === 'visible' && accounts.value.length && !refreshing.value && Date.now() - loadedAt.value > STALE_MS) {
    void refresh(true)
  }
}

const lastLoaded = computed(() => (loadedAt.value ? timeOfDay(loadedAt.value) : ''))

// Errors and sample names come back from the server in the request's language, so a switch asks again.
watch(locale, () => {
  if (accounts.value.length) {
    void refresh(true)
  }
})

onMounted(() => {
  window.addEventListener('focus', refreshIfStale)
  document.addEventListener('visibilitychange', refreshIfStale)
  poll = setInterval(() => {
    if (onAccount.value && templates.value.some(template => ['PENDING', 'IN_APPEAL'].includes(template.status))) {
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
const exportOpen = ref(false)
const importOpen = ref(false)
const editingAccount = ref<AccountSummary | null>(null)
const pasteOpen = ref(false)
const draftsOpen = ref(false)
const templateOpen = ref(false)
const drafts = ref<Draft[]>([])
const draftsTitle = ref('')
const opened = ref<{ name: string | null, id?: string }>({ name: null })
const templateMode = ref<'view' | 'edit'>('view')
const booting = ref(true)
const { accountTab } = useManager()
const address = useAddress()
const accountTabs = computed(() => [
  { label: t('business.templatesTab'), value: 'home', icon: 'i-lucide-house' },
  { label: t('home.templatesTab'), value: 'templates', icon: 'i-lucide-file-text' },
  { label: t('reports.tab'), value: 'reports', icon: 'i-lucide-chart-column' },
  { label: t('business.tab'), value: 'business', icon: 'i-lucide-settings' },
])

// Account ids start with a letter or digit, so '*' can stand for the overview in the mobile picker.
const OVERVIEW = '*'
const MANAGE = '+'
const SETTINGS = '#'

const accountItems = computed(() => [
  { value: OVERVIEW, label: t('nav.overview') },
  { value: MANAGE, label: t('nav.accounts') },
  { value: SETTINGS, label: t('nav.settings') },
  ...accounts.value.map(account => ({ value: account.id, label: accountTitle(account) })),
])

function pick(value: string): void {
  if (value === MANAGE || value === SETTINGS) {
    screen.value = value === MANAGE ? 'accounts' : 'settings'

    return
  }

  void (value === OVERVIEW ? showOverview() : switchAccount(value))
}

const subtitle = computed(() => {
  if (!current.value) {
    return ''
  }

  return current.value.phones.map(phone => phone.display_phone_number).join(t('common.listSeparator'))
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
    const path = address.initialPath()

    await loadAccounts()

    if (!accounts.value.length) {
      openAccount()
    }
    else if (path !== '/') {
      await address.open(path)
    }

    address.start()
  }
  catch (error) {
    toast.add({ title: t('accounts.loadFailed'), description: (error as Error).message, color: 'error' })
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
        <button
          type="button"
          class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          :class="onOverview ? 'bg-elevated text-highlighted' : 'text-toned hover:bg-elevated/70'"
          :aria-current="onOverview ? 'page' : undefined"
          @click="showOverview()"
        >
          <UIcon name="i-lucide-layout-dashboard" class="size-4.5" /> {{ t('nav.overview') }}
        </button>
        <button
          type="button"
          class="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          :class="screen === 'accounts' ? 'bg-elevated text-highlighted' : 'text-toned hover:bg-elevated/70'"
          :aria-current="screen === 'accounts' ? 'page' : undefined"
          @click="screen = 'accounts'"
        >
          <UIcon name="i-lucide-users" class="size-4.5" /> {{ t('nav.accounts') }}
        </button>
        <button
          type="button"
          class="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          :class="screen === 'settings' ? 'bg-elevated text-highlighted' : 'text-toned hover:bg-elevated/70'"
          :aria-current="screen === 'settings' ? 'page' : undefined"
          @click="screen = 'settings'"
        >
          <UIcon name="i-lucide-settings" class="size-4.5" /> {{ t('nav.settings') }}
        </button>
      </nav>

      <USeparator />

      <AccountsSidebar />
    </aside>

    <div class="flex min-w-0 flex-1 flex-col gap-3 p-3 lg:ps-0">
      <header class="flex flex-wrap items-center justify-between gap-3 px-1 lg:min-h-10">
        <div class="flex min-w-0 items-center gap-2 lg:hidden">
          <AppBrand compact />
          <USelect
            v-if="accounts.length"
            :model-value="onOverview ? OVERVIEW : screen === 'accounts' ? MANAGE : screen === 'settings' ? SETTINGS : accountId ?? undefined"
            :items="accountItems"
            class="w-52 max-w-full"
            :aria-label="t('accounts.picker')"
            @update:model-value="(id) => pick(String(id))"
          />
        </div>
        <span class="hidden lg:block" />

        <div class="flex items-center gap-1 rounded-lg border border-default bg-default p-1">
          <UTooltip :text="lastLoaded ? t('header.refreshedAt', { time: lastLoaded }) : t('header.refresh')">
            <UButton icon="i-lucide-refresh-cw" color="neutral" variant="ghost" size="sm" :aria-label="t('header.refresh')" :loading="refreshing" :disabled="!accounts.length" @click="refresh()" />
          </UTooltip>
          <UTooltip :text="t('accounts.add')">
            <UButton icon="i-lucide-user-plus" color="neutral" variant="ghost" size="sm" :aria-label="t('accounts.add')" class="lg:hidden" @click="openAccount()" />
          </UTooltip>
          <UTooltip :text="t('header.language')">
            <UButton
              :label="locale === 'ar' ? 'EN' : 'AR'"
              color="neutral"
              variant="ghost"
              size="sm"
              class="font-mono font-semibold"
              :aria-label="t('header.language')"
              @click="setLocale(locale === 'ar' ? 'en' : 'ar')"
            />
          </UTooltip>
          <UTooltip :text="t('settings.signOut')">
            <UButton icon="i-lucide-log-out" color="neutral" variant="ghost" size="sm" :aria-label="t('settings.signOut')" @click="signOut()" />
          </UTooltip>
          <UTooltip :text="t('header.colorMode')">
            <UColorModeButton size="sm" />
          </UTooltip>
        </div>
      </header>

      <main class="flex-1 space-y-6 rounded-2xl border border-default bg-default p-4 sm:p-6 lg:p-8">
        <div v-if="current && onAccount" class="flex flex-wrap items-start justify-between gap-3">
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
                {{ t('accounts.business') }} <bdi dir="ltr" class="font-mono text-xs">{{ current.waba_id }}</bdi>
              </span>
            </p>
          </div>
          <UButton :label="t('accounts.edit')" icon="i-lucide-pencil" color="neutral" variant="outline" size="sm" @click="openAccount(current)" />
        </div>

        <UAlert
          v-if="current?.error && onAccount"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          :title="t('accounts.unreachable')"
          :description="current.error"
        />

        <div v-if="booting" class="space-y-4">
          <USkeleton class="h-8 w-56" />
          <USkeleton class="h-32 w-full rounded-xl" />
        </div>

        <div v-else-if="!accounts.length && (onOverview || onAccount)" class="grid place-items-center gap-3 py-20 text-center">
          <span class="grid size-14 place-items-center rounded-full bg-elevated text-muted">
            <UIcon name="i-lucide-message-circle-plus" class="size-6" />
          </span>
          <p class="font-semibold text-highlighted">
            {{ t('accounts.empty') }}
          </p>
          <div class="flex flex-wrap justify-center gap-2">
            <UButton :label="t('accounts.add')" icon="i-lucide-plus" @click="openAccount()" />
            <UButton :label="t('transfer.import')" icon="i-lucide-upload" color="neutral" variant="outline" @click="importOpen = true" />
          </div>
        </div>

        <OverviewPage v-else-if="onOverview" @open="switchAccount" />

        <SettingsPage v-else-if="screen === 'settings'" @export="exportOpen = true" @import="importOpen = true" />

        <AccountsPage
          v-else-if="screen === 'accounts'"
          @add="openAccount()"
          @edit="openAccount"
          @open="switchAccount"
          @export="exportOpen = true"
          @import="importOpen = true"
        />

        <template v-else-if="accountId">
          <UTabs v-model="accountTab" :items="accountTabs" :content="false" variant="link" />
          <BusinessPanel v-if="accountTab === 'business'" />
          <ReportsPanel v-else-if="accountTab === 'reports'" />
          <template v-else-if="accountTab === 'home'">
            <StatsCards />
            <AccountAttention @open="(name, id) => openTemplate(name, 'view', id)" />
          </template>
          <template v-else>
            <TemplatesPanel
              @open="openTemplate"
              @create="openDrafts([newDraft()], t('templates.new'))"
              @paste="pasteOpen = true"
            />
          </template>
        </template>
      </main>

      <AppFooter />
    </div>

    <AccountModal v-model:open="accountOpen" :account="editingAccount" />
    <ExportAccountsModal v-model:open="exportOpen" />
    <ImportAccountsModal v-model:open="importOpen" />
    <PasteModal v-model:open="pasteOpen" @parsed="(list) => openDrafts(list, list.length > 1 ? t('paste.draftsTitleMany', { n: list.length }) : t('paste.draftsTitle'))" />
    <DraftsModal v-model:open="draftsOpen" v-model:drafts="drafts" :title="draftsTitle" />
    <TemplateModal v-model:open="templateOpen" v-model:mode="templateMode" :name="opened.name" :initial-id="opened.id" />
  </div>
</template>
