<script setup lang="ts">
const { overview, overviewError, loading } = useManager()

const spend = computed(() => {
  const value = overview.value?.spend

  return value && !('error' in value) ? value : null
})

const spendError = computed(() => {
  const value = overview.value?.spend

  return (value && 'error' in value ? errorText(value.error) : overviewError.value) || 'غير متاح'
})

const average = computed(() => (spend.value?.messages ? spend.value.total / spend.value.messages : 0))

const credit = computed(() => overview.value?.credit?.data?.find(line => line.credit_available || line.balance) ?? null)

const creditHint = computed(() => {
  const value = overview.value
  const reason = value?.credit?.error
    ? errorText(value.credit.error)
    : value?.credit
      ? 'لا يوجد خط ائتمان.'
      : errorText(value?.account?.error) || overviewError.value || ''

  return ['لا تعرض Meta رصيد الدفع بالبطاقة.', reason].filter(Boolean).join(' ')
})

const phone = computed(() => overview.value?.phones?.data?.[0] ?? null)
const otherPhones = computed(() => (overview.value?.phones?.data ?? []).length - 1)
const quality = computed(() => QUALITY[phone.value?.quality_rating ?? ''] ?? QUALITY.UNKNOWN!)
</script>

<template>
  <div class="space-y-4">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile title="تكلفة الشهر" icon="i-lucide-receipt" :loading="loading">
        <template v-if="spend">
          <p class="text-3xl font-semibold text-highlighted">
            <span dir="ltr">{{ money(spend.total, spend.currency) }}</span>
          </p>
          <p class="mt-1 text-xs text-muted">
            منذ {{ monthDay(spend.since) }}
          </p>
        </template>
        <p v-else class="text-sm text-muted">
          {{ spendError }}
        </p>
      </StatTile>

      <StatTile title="الرسائل المرسلة" icon="i-lucide-send" :loading="loading">
        <template v-if="spend">
          <p class="text-3xl font-semibold text-highlighted">
            {{ count(spend.messages) }}
          </p>
          <p class="mt-1 text-xs text-muted">
            متوسط <span dir="ltr">{{ money(average, spend.currency, 4) }}</span> للرسالة
          </p>
        </template>
        <p v-else class="text-sm text-muted">
          غير متاح
        </p>
      </StatTile>

      <StatTile title="الرصيد" icon="i-lucide-wallet" :hint="credit ? undefined : creditHint" :loading="loading">
        <template v-if="credit">
          <p class="text-3xl font-semibold text-highlighted">
            <span dir="ltr">{{ amount(credit.credit_available ?? credit.balance) }}</span>
          </p>
          <p class="mt-1 text-xs text-muted">
            المتاح من خط الائتمان
          </p>
        </template>
        <template v-else>
          <p class="text-lg font-semibold text-highlighted">
            غير متاح من Meta
          </p>
          <UButton
            to="https://business.facebook.com/billing_hub/payment_settings"
            target="_blank"
            external
            label="عرض الفوترة"
            trailing-icon="i-lucide-external-link"
            color="primary"
            variant="link"
            size="xs"
            class="mt-0.5 px-0"
          />
        </template>
      </StatTile>

      <StatTile title="رقم واتساب" icon="i-lucide-phone" :loading="loading">
        <template v-if="phone">
          <p class="font-mono text-lg font-semibold whitespace-nowrap text-highlighted">
            <bdi dir="ltr">{{ phone.display_phone_number }}</bdi>
          </p>
          <div class="mt-2 flex flex-wrap items-center gap-1.5">
            <UBadge :color="quality.tone" variant="subtle" size="sm" :label="`الجودة: ${quality.label}`" />
            <UBadge v-if="phone.messaging_limit_tier" color="neutral" variant="subtle" size="sm" :label="messagingLimit(phone.messaging_limit_tier)" />
            <span v-if="otherPhones > 0" class="text-xs text-muted">+{{ otherPhones }} أرقام</span>
          </div>
        </template>
        <p v-else class="text-sm text-muted">
          لا يوجد رقم
        </p>
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
  </div>
</template>
