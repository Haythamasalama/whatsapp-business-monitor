<script setup lang="ts">
const props = defineProps<{ spend: Spend }>()

const rows = computed(() => Object.entries(props.spend.by_category).map(([key, row]) => ({ key, label: pricingLabel(key), ...row })))
</script>

<template>
  <CostShares :title="t('chart.byType')" :rows="rows" :total="spend.total" :currency="spend.currency" />
</template>
