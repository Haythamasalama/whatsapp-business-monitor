<script setup lang="ts">
const { overview, overviewError, loading } = useManager()

const spend = computed(() => {
  const value = overview.value?.spend

  return value && !('error' in value) ? value : null
})

const spendError = computed(() => {
  const value = overview.value?.spend

  return (value && 'error' in value ? errorText(value.error) : overviewError.value) || t('common.unavailable')
})

const average = computed(() => (spend.value?.messages ? spend.value.total / spend.value.messages : 0))

const credit = computed(() => overview.value?.credit?.data?.find(line => line.credit_available || line.balance) ?? null)

const creditHint = computed(() => {
  const value = overview.value
  const reason = value?.credit?.error
    ? errorText(value.credit.error)
    : value?.credit
      ? t('stats.noCreditLine')
      : errorText(value?.account?.error) || overviewError.value || ''

  return [t('stats.cardBalance'), reason].filter(Boolean).join(' ')
})

</script>

<template>
  <div class="space-y-4">
    <div class="grid gap-4 md:grid-cols-3">
      <StatTile :title="t('stats.monthCost')" icon="i-lucide-receipt" :loading="loading">
        <template v-if="spend">
          <p class="text-3xl font-semibold text-highlighted">
            <span dir="ltr">{{ money(spend.total, spend.currency) }}</span>
          </p>
          <p class="mt-1 text-xs text-muted">
            {{ t('stats.since', { date: monthDay(spend.since) }) }}
          </p>
        </template>
        <p v-else class="text-sm text-muted">
          {{ spendError }}
        </p>
      </StatTile>

      <StatTile :title="t('stats.messages')" icon="i-lucide-send" :loading="loading">
        <template v-if="spend">
          <p class="text-3xl font-semibold text-highlighted">
            {{ count(spend.messages) }}
          </p>
          <p class="mt-1 text-xs text-muted">
            {{ t('stats.averageBefore') }} <span dir="ltr">{{ money(average, spend.currency, 4) }}</span> {{ t('stats.averageAfter') }}
          </p>
        </template>
        <p v-else class="text-sm text-muted">
          {{ t('common.unavailable') }}
        </p>
      </StatTile>

      <StatTile :title="t('stats.balance')" icon="i-lucide-wallet" :hint="credit ? undefined : creditHint" :loading="loading">
        <template v-if="credit">
          <p class="text-3xl font-semibold text-highlighted">
            <span dir="ltr">{{ amount(credit.credit_available ?? credit.balance) }}</span>
          </p>
          <p class="mt-1 text-xs text-muted">
            {{ t('stats.creditAvailable') }}
          </p>
        </template>
        <template v-else>
          <p class="text-lg font-semibold text-highlighted">
            {{ t('stats.balanceUnavailable') }}
          </p>
          <UButton
            to="https://business.facebook.com/billing_hub/payment_settings"
            target="_blank"
            external
            :label="t('stats.billing')"
            trailing-icon="i-lucide-external-link"
            color="primary"
            variant="link"
            size="xs"
            class="mt-0.5 px-0"
          />
        </template>
      </StatTile>
    </div>

    <div v-if="loading" class="grid gap-4 lg:grid-cols-3">
      <USkeleton class="h-72 rounded-xl lg:col-span-2" />
      <USkeleton class="h-72 rounded-xl" />
    </div>
    <div v-else-if="spend" class="grid gap-4 lg:grid-cols-3">
      <SpendChart :daily="spend.daily" :currency="spend.currency" class="lg:col-span-2" />
      <CategoryBreakdown :spend="spend" />
    </div>

    <PhonesHealth v-if="!loading && overview?.phones?.data?.length" :phones="overview.phones.data" />
  </div>
</template>
