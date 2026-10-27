<script setup lang="ts">
const props = defineProps<{ phone: PhoneDetails }>()
const emit = defineEmits<{ close: [], changed: [] }>()

const { api } = useManager()
const open = ref(true)
const settings = ref<PhoneSettings | null>(null)
const error = ref('')
const tab = ref('profile')

async function load(): Promise<void> {
  try {
    settings.value = await api<PhoneSettings>(`/api/business/phone?phone=${props.phone.id}`)
    error.value = ''
  }
  catch (failure) {
    error.value = (failure as Error).message
  }
}

onMounted(load)

watch(open, (value) => {
  if (!value) {
    emit('close')
  }
})

const tabs = computed(() => [
  { label: t('business.phone.tabs.profile'), value: 'profile', icon: 'i-lucide-store' },
  { label: t('business.phone.tabs.name'), value: 'name', icon: 'i-lucide-badge-check' },
  { label: t('business.phone.tabs.automation'), value: 'automation', icon: 'i-lucide-message-square-dashed' },
  { label: t('business.phone.tabs.qr'), value: 'qr', icon: 'i-lucide-qr-code' },
  { label: t('business.phone.tabs.blocked'), value: 'blocked', icon: 'i-lucide-ban' },
])
</script>

<template>
  <USlideover v-model:open="open" :ui="{ content: 'w-full max-w-none sm:max-w-3xl' }">
    <template #title>
      {{ t('business.phone.title', { number: '' }) }}<bdi dir="ltr" class="font-mono">{{ phone.display_phone_number }}</bdi>
    </template>
    <template #description>
      {{ phone.verified_name }}
    </template>

    <template #body>
      <UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="t('business.phone.loadFailed')" :description="error" />
      <div v-else-if="!settings" class="space-y-3">
        <USkeleton class="h-9 w-full" />
        <USkeleton class="h-40 w-full rounded-xl" />
      </div>
      <div v-else class="space-y-5">
        <nav class="flex flex-wrap gap-1 border-b border-default pb-3">
          <UButton
            v-for="item in tabs"
            :key="item.value"
            :label="item.label"
            :icon="item.icon"
            :color="tab === item.value ? 'primary' : 'neutral'"
            :variant="tab === item.value ? 'soft' : 'ghost'"
            size="sm"
            :aria-current="tab === item.value ? 'page' : undefined"
            @click="tab = item.value"
          />
        </nav>
        <PhoneProfile v-if="tab === 'profile'" :phone="phone.id" :data="settings.profile" @changed="load" />
        <PhoneIdentity v-else-if="tab === 'name'" :phone="phone" :username="settings.username" @changed="load(); emit('changed')" />
        <PhoneAutomation v-else-if="tab === 'automation'" :phone="phone.id" :data="settings.automation" @changed="load" />
        <PhoneQrCodes v-else-if="tab === 'qr'" :phone="phone.id" :data="settings.qr" @changed="load" />
        <PhoneBlocked v-else :phone="phone.id" :data="settings.blocked" @changed="load" />
      </div>
    </template>
  </USlideover>
</template>
