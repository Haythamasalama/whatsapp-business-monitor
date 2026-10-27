<script setup lang="ts">
const props = defineProps<{ phones: Phone[] }>()

const rows = computed(() => props.phones.map(phone => ({
  phone,
  status: phoneStatusOf(phone.status),
  quality: qualityOf(phone.quality_rating) ?? qualityOf('UNKNOWN')!,
  name: nameStatusOf(phone.name_status),
  limit: phoneLimit(phone) || '—',
})))
</script>

<template>
  <div class="rounded-xl border border-default bg-default">
    <h3 class="p-5 pb-3 font-semibold text-highlighted">
      {{ t('phones.title') }}
    </h3>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-y border-default text-xs text-muted">
          <tr>
            <th class="px-5 py-2.5 text-start font-medium">
              {{ t('phones.number') }}
            </th>
            <th class="px-3 py-2.5 text-start font-medium">
              {{ t('phones.status') }}
            </th>
            <th class="px-3 py-2.5 text-start font-medium">
              {{ t('phones.quality') }}
            </th>
            <th class="px-3 py-2.5 text-start font-medium">
              {{ t('phones.limit') }}
            </th>
            <th class="px-5 py-2.5 text-start font-medium">
              {{ t('phones.displayName') }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-default">
          <tr v-for="row in rows" :key="row.phone.id ?? row.phone.display_phone_number">
            <td class="px-5 py-3">
              <p class="font-mono font-medium whitespace-nowrap text-highlighted">
                <bdi dir="ltr">{{ row.phone.display_phone_number }}</bdi>
              </p>
              <p v-if="row.phone.verified_name" class="text-xs text-muted">
                {{ row.phone.verified_name }}
              </p>
            </td>
            <td class="px-3 py-3">
              <UBadge v-if="row.status" :color="row.status.tone" variant="subtle" :label="row.status.label" class="rounded-full" />
              <span v-else class="text-dimmed">—</span>
            </td>
            <td class="px-3 py-3">
              <UBadge :color="row.quality.tone" variant="subtle" :label="row.quality.label" class="rounded-full" />
            </td>
            <td class="px-3 py-3 whitespace-nowrap text-toned">
              {{ row.limit }}
            </td>
            <td class="px-5 py-3">
              <UBadge v-if="row.name" :color="row.name.tone" variant="subtle" :label="row.name.label" class="rounded-full" />
              <span v-else class="text-dimmed">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
