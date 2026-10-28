<script setup lang="ts">
const { api, accountId, freshAt } = useManager()

const details = ref<BusinessDetails | null>(null)
const error = ref('')
const loading = ref(false)
const managing = ref<PhoneDetails | null>(null)

async function load(fresh = false): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    details.value = await api<BusinessDetails>('/api/business', { fresh })
  }
  catch (failure) {
    error.value = (failure as Error).message
  }
  finally {
    loading.value = false
  }
}

watch(accountId, () => {
  details.value = null
  void load()
}, { immediate: true })

watch(freshAt, () => void load(true))

const account = computed(() => details.value?.account ?? null)
const phones = computed(() => details.value?.phones.data ?? [])

/** Every entity Meta says is limited or blocked, with its reasons, the account first. */
const problems = computed(() => {
  const entities = [
    ...(account.value?.health_status?.entities ?? []),
    ...phones.value.flatMap(phone => (phone.health_status?.entities ?? []).map(entity => ({ ...entity, label: phone.display_phone_number }))),
    ...(details.value?.templates.data ?? []).flatMap(template => (template.health_status.entities ?? [])
      .filter(entity => entity.entity_type === 'MESSAGE_TEMPLATE')
      .map(entity => ({ ...entity, label: `${template.name} (${languageCode(template.language)})` }))),
  ]
  const seen = new Set<string>()

  return entities.filter((entity) => {
    const key = `${entity.entity_type}:${entity.id}:${'label' in entity ? entity.label : ''}`

    if (entity.can_send_message === 'AVAILABLE' || !entity.errors?.length || seen.has(key)) {
      return false
    }

    seen.add(key)

    return true
  })
})

const overall = computed(() => {
  const values = [account.value?.health_status?.can_send_message, ...phones.value.map(phone => phone.health_status?.can_send_message)].filter(Boolean)

  return values.includes('BLOCKED') ? 'BLOCKED' : values.includes('LIMITED') ? 'LIMITED' : values[0]
})

const verification = computed(() => verificationOf(account.value?.business_verification_status))
const review = computed(() => (account.value?.account_review_status ? statusOf(account.value.account_review_status) : null))
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="text-sm text-muted">
        {{ t('business.intro') }}
      </p>
      <UButton :label="t('business.help')" :to="docsUrl('accounts-and-numbers')" target="_blank" icon="i-lucide-circle-help" color="neutral" variant="link" size="sm" />
    </div>

    <UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="t('business.loadFailed')" :description="error" />

    <div v-if="loading && !details" class="grid gap-4 lg:grid-cols-2">
      <USkeleton class="h-44 rounded-xl" />
      <USkeleton class="h-44 rounded-xl" />
      <USkeleton class="h-56 rounded-xl lg:col-span-2" />
    </div>

    <template v-else-if="details">
      <div class="grid gap-4 lg:grid-cols-2">
        <section class="space-y-4 rounded-xl border border-default bg-default p-5">
          <div class="flex items-center justify-between gap-3">
            <h2 class="flex items-center gap-1.5 font-semibold text-highlighted">
              {{ t('business.health.title') }}
              <UTooltip :text="t('business.health.hint')">
                <UIcon name="i-lucide-info" class="size-3.5 text-dimmed" :aria-label="t('business.health.hint')" />
              </UTooltip>
            </h2>
            <HealthBadge :value="overall" />
          </div>

          <p v-if="!problems.length" class="flex items-center gap-2 text-sm text-toned">
            <UIcon name="i-lucide-circle-check" class="size-4 text-success" />
            {{ t('business.health.allGood') }}
          </p>

          <ul v-else class="space-y-3">
            <li v-for="entity in problems" :key="`${entity.entity_type}${entity.id}${'label' in entity ? entity.label : ''}`" class="space-y-2 rounded-lg border border-default bg-muted p-3 text-sm">
              <p class="flex flex-wrap items-center gap-2">
                <HealthBadge :value="entity.can_send_message" />
                <span class="font-medium text-highlighted">{{ tOr(`business.health.entity.${entity.entity_type}`, entity.entity_type) }}</span>
                <bdi v-if="'label' in entity" dir="ltr" class="font-mono text-xs text-muted">{{ entity.label }}</bdi>
              </p>
              <div v-for="(problem, index) in entity.errors" :key="index" class="space-y-1">
                <p class="text-toned">
                  {{ problem.error_description }}
                </p>
                <p v-if="problem.possible_solution" class="text-muted">
                  <span class="font-medium text-toned">{{ t('business.health.whatToDo') }}</span> {{ problem.possible_solution }}
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section class="space-y-4 rounded-xl border border-default bg-default p-5">
          <h2 class="font-semibold text-highlighted">
            {{ t('business.details.title') }}
          </h2>
          <UAlert v-if="account?.error" color="error" variant="subtle" icon="i-lucide-circle-alert" :description="errorText(account.error)" />
          <dl class="divide-y divide-default text-sm">
            <div class="flex items-center justify-between gap-3 py-2.5">
              <dt class="text-toned">
                {{ t('business.details.review') }}
              </dt>
              <dd>
                <UBadge v-if="review" :color="review.tone" variant="subtle" :label="review.label" class="rounded-full" />
                <span v-else class="text-dimmed">—</span>
              </dd>
            </div>
            <div class="flex items-center justify-between gap-3 py-2.5">
              <dt>
                <FieldLabel :label="t('business.details.verification')" :hint="t('business.details.verificationHint')" class="text-toned" />
              </dt>
              <dd>
                <UBadge v-if="verification" :color="verification.tone" variant="subtle" :label="verification.label" class="rounded-full" />
                <span v-else class="text-dimmed">—</span>
              </dd>
            </div>
            <div class="flex items-center justify-between gap-3 py-2.5">
              <dt>
                <FieldLabel :label="t('business.details.ownership')" :hint="t('business.details.ownershipHint')" class="text-toned" />
              </dt>
              <dd class="text-highlighted">
                {{ account?.ownership_type ? tOr(`business.ownership.${account.ownership_type}`, account.ownership_type) : '—' }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-3 py-2.5">
              <dt class="text-toned">
                {{ t('business.details.payment') }}
              </dt>
              <dd>
                <UBadge v-if="account?.primary_funding_id" color="success" variant="subtle" :label="t('business.details.paymentAdded')" class="rounded-full" />
                <UBadge v-else-if="account && !account.error" color="warning" variant="subtle" :label="t('business.details.paymentMissing')" class="rounded-full" />
                <span v-else class="text-dimmed">—</span>
              </dd>
            </div>
          </dl>
          <UAlert
            v-if="account && !account.error && !account.primary_funding_id"
            color="warning"
            variant="subtle"
            icon="i-lucide-credit-card"
            :description="t('business.details.paymentMissingHint')"
          />
        </section>
      </div>

      <section class="rounded-xl border border-default bg-default">
        <div class="flex items-center gap-1.5 p-5 pb-3">
          <h2 class="font-semibold text-highlighted">
            {{ t('business.numbers.title') }}
          </h2>
        </div>
        <UAlert v-if="details.phones.error" class="mx-5 mb-4 w-auto" color="error" variant="subtle" icon="i-lucide-circle-alert" :description="errorText(details.phones.error)" />
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="border-y border-default text-xs text-muted">
              <tr>
                <th class="px-5 py-2.5 text-start font-medium">
                  {{ t('phones.number') }}
                </th>
                <th class="px-3 py-2.5 text-start font-medium">
                  {{ t('business.numbers.health') }}
                </th>
                <th class="px-3 py-2.5 text-start font-medium">
                  {{ t('phones.quality') }}
                </th>
                <th class="px-3 py-2.5 text-start font-medium">
                  <FieldLabel :label="t('business.numbers.limit')" :hint="t('business.numbers.limitHint')" />
                </th>
                <th class="px-3 py-2.5 text-start font-medium">
                  {{ t('phones.displayName') }}
                </th>
                <th class="px-3 py-2.5 text-start font-medium">
                  {{ t('business.numbers.greenBadge') }}
                </th>
                <th class="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr v-for="phone in phones" :key="phone.id">
                <td class="px-5 py-3">
                  <p class="font-mono font-medium whitespace-nowrap text-highlighted">
                    <bdi dir="ltr">{{ phone.display_phone_number }}</bdi>
                  </p>
                  <p class="text-xs text-muted">
                    {{ phone.verified_name }}
                    <UBadge v-if="phone.account_mode === 'SANDBOX'" color="neutral" variant="subtle" size="sm" :label="t('business.numbers.sandbox')" />
                  </p>
                </td>
                <td class="px-3 py-3">
                  <HealthBadge :value="phone.health_status?.can_send_message" />
                </td>
                <td class="px-3 py-3">
                  <UBadge :color="(qualityOf(phone.quality_rating) ?? qualityOf('UNKNOWN')!).tone" variant="subtle" :label="(qualityOf(phone.quality_rating) ?? qualityOf('UNKNOWN')!).label" class="rounded-full" />
                </td>
                <td class="px-3 py-3 whitespace-nowrap text-toned">
                  {{ phoneLimit(phone) || '—' }}
                </td>
                <td class="px-3 py-3">
                  <UBadge v-if="nameStatusOf(phone.name_status)" :color="nameStatusOf(phone.name_status)!.tone" variant="subtle" :label="nameStatusOf(phone.name_status)!.label" class="rounded-full" />
                  <p v-if="phone.new_display_name && phone.new_name_status === 'PENDING_REVIEW'" class="mt-1 text-xs text-muted">
                    {{ t('business.numbers.newName', { name: phone.new_display_name }) }}
                  </p>
                </td>
                <td class="px-3 py-3">
                  <UIcon v-if="phone.is_official_business_account" name="i-lucide-badge-check" class="size-5 text-success" :aria-label="t('business.oba.has')" />
                  <UBadge
                    v-else-if="obaOf(phone.official_business_account?.oba_status)"
                    :color="obaOf(phone.official_business_account?.oba_status)!.tone"
                    variant="subtle"
                    :label="obaOf(phone.official_business_account?.oba_status)!.label"
                    class="rounded-full"
                  />
                  <span v-else class="text-dimmed">—</span>
                </td>
                <td class="px-5 py-3 text-end">
                  <UButton :label="t('business.numbers.manage')" icon="i-lucide-settings-2" color="neutral" variant="outline" size="sm" @click="managing = phone" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div class="grid gap-4 lg:grid-cols-2">
        <AssignedUsers />
        <ActivityLog />
      </div>
    </template>

    <PhoneManager v-if="managing" :phone="managing" @close="managing = null" @changed="load()" />
  </div>
</template>
