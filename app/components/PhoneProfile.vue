<script setup lang="ts">
import { VERTICALS } from '#shared/utils/business'

const props = defineProps<{ phone: string, data: PhoneSettings['profile'] }>()
const emit = defineEmits<{ changed: [] }>()

const { run, busy } = usePhoneAction(() => props.phone)
const toast = useToast()
const confirm = useConfirm()
const { api } = useManager()

const form = reactive({ about: '', address: '', description: '', email: '', website1: '', website2: '', vertical: 'UNDEFINED' })

watch(() => props.data.data, (profile) => {
  Object.assign(form, {
    about: profile?.about ?? '',
    address: profile?.address ?? '',
    description: profile?.description ?? '',
    email: profile?.email ?? '',
    website1: profile?.websites?.[0] ?? '',
    website2: profile?.websites?.[1] ?? '',
    vertical: profile?.vertical || 'UNDEFINED',
  })
}, { immediate: true })

const input = computed<ProfileInput>(() => ({
  about: form.about.trim(),
  address: form.address.trim(),
  description: form.description.trim(),
  email: form.email.trim(),
  websites: [form.website1.trim(), form.website2.trim()].filter(Boolean),
  vertical: form.vertical,
}))

const problems = computed(() => profileProblems(input.value).map(key => tOr(key, key)))
const verticals = computed(() => VERTICALS.map(value => ({ value, label: tOr(`business.verticals.${value}`, value) })))

async function save(): Promise<void> {
  if (await run({ path: '/api/business/profile', body: { ...input.value }, confirm: t('business.profile.confirm'), done: t('business.profile.saved') })) {
    emit('changed')
  }
}

const picker = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

async function upload(event: Event): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.[0]
  ;(event.target as HTMLInputElement).value = ''

  if (!file) {
    return
  }

  if (!PHOTO_TYPES.includes(file.type) || file.size > PHOTO_MAX_BYTES) {
    toast.add({ title: t(file.size > PHOTO_MAX_BYTES ? 'business.rules.photoSize' : 'business.rules.photoType'), color: 'error' })

    return
  }

  if (!(await confirm({ title: t('business.profile.photoConfirm') }))) {
    return
  }

  uploading.value = true

  try {
    const body = new FormData()
    body.append('photo', file)
    await api(`/api/business/photo?phone=${props.phone}`, { method: 'POST', body: body as unknown as Record<string, unknown> })
    toast.add({ title: t('business.profile.photoSaved'), color: 'success', icon: 'i-lucide-check' })
    emit('changed')
  }
  catch (error) {
    toast.add({ title: t('common.failed'), description: (error as Error).message, color: 'error' })
  }
  finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-muted">
      {{ t('business.profile.intro') }}
    </p>
    <UAlert v-if="data.error" color="error" variant="subtle" icon="i-lucide-circle-alert" :description="errorText(data.error)" />

    <div class="flex items-center gap-4">
      <UAvatar :src="data.data?.profile_picture_url" icon="i-lucide-store" size="3xl" />
      <div class="flex flex-col items-start gap-2">
        <FieldLabel :label="t('business.profile.photo')" :hint="t('business.profile.photoHint')" class="text-sm font-medium text-default" />
        <UButton :label="t('business.profile.photoChange')" icon="i-lucide-image-up" color="neutral" variant="outline" size="sm" :loading="uploading" @click="picker?.click()" />
        <input ref="picker" type="file" accept="image/jpeg,image/png" class="hidden" @change="upload">
      </div>
    </div>

    <UFormField>
      <template #label>
        <FieldLabel :label="t('business.profile.about')" :hint="t('business.profile.aboutHint')" />
      </template>
      <UInput v-model="form.about" :maxlength="PROFILE_LIMITS.about" class="w-full" dir="auto" />
    </UFormField>
    <UFormField :label="t('business.profile.description')">
      <UTextarea v-model="form.description" :maxlength="PROFILE_LIMITS.description" :rows="3" autoresize class="w-full" dir="auto" />
    </UFormField>
    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField :label="t('business.profile.address')">
        <UInput v-model="form.address" :maxlength="PROFILE_LIMITS.address" class="w-full" />
      </UFormField>
      <UFormField :label="t('business.profile.email')">
        <UInput v-model="form.email" type="email" :maxlength="PROFILE_LIMITS.email" class="w-full" />
      </UFormField>
    </div>
    <UFormField>
      <template #label>
        <FieldLabel :label="t('business.profile.websites')" :hint="t('business.profile.websitesHint')" />
      </template>
      <div class="grid gap-2 sm:grid-cols-2">
        <UInput v-model="form.website1" placeholder="https://" class="w-full" />
        <UInput v-model="form.website2" placeholder="https://" class="w-full" />
      </div>
    </UFormField>
    <UFormField :label="t('business.profile.vertical')">
      <USelect v-model="form.vertical" :items="verticals" class="w-full" />
    </UFormField>

    <ul v-if="problems.length" class="list-inside list-disc text-sm text-error">
      <li v-for="problem in problems" :key="problem">
        {{ problem }}
      </li>
    </ul>
    <UButton :label="t('business.profile.save')" icon="i-lucide-save" :loading="busy" :disabled="problems.length > 0" @click="save" />
  </div>
</template>
