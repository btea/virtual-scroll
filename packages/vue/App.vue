<template>
  <div class="virtual-box">
    <!-- <virtual-scroll :height="h" :data="data" /> -->
    <virtual-scroll :height="h" :data="data">
      <template #content="item">
        <div class="row">
          <span class="col key">{{ item.key }}</span>
          <span class="col val">{{ item.val }}</span>
          <span class="col status">{{ item.status }}</span>
          <span class="col ope">{{ item.ope }}</span>
        </div>
      </template>
    </virtual-scroll>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref } from 'vue'
import virtualScroll from './virtual-scroll.vue'

const h = ref(35)
const data = reactive(
  Array.from('0'.repeat(5_000_000), (item, i) => ({
    key: i,
    val: Math.random().toString(16).slice(2),
    status: Math.random() > 0.5 ? 1 : 0,
    ope: '操作',
  }))
)
</script>
<style lang="scss" scoped>
.virtual-box {
  height: 700px;
  box-shadow: 0 0 5px rgba($color: #66ccff, $alpha: 0.5);
  :deep(.item) {
    width: 100%;
  }
  :deep(.row) {
    display: flex;
  }
  :deep(.col) {
    flex: 1;
  }
}
</style>
