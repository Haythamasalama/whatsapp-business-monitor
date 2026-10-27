<script setup lang="ts">
const props = defineProps<{ spend: Spend }>()

const rows = computed(() => Object.entries(props.spend.by_category).map(([key, row]) => ({ key, label: PRICING[key] ?? key, ...row })))
</script>

<template>
  <CostShares title="التكلفة حسب النوع" :rows="rows" :total="spend.total" :currency="spend.currency" />
</template>
