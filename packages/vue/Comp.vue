<script>
import { watch, defineComponent } from 'vue'

export default defineComponent({
  setup(props, { slots }) {
    watch(
      () => {
        const currentSlot = slots.default?.()
        return currentSlot
      },
      v => {
        console.log(v)
        console.log('watch')
      },
      {
        immediate: true,
      }
    )
  },
})
</script>

<template>
  <div>
    <slot />
  </div>
</template>
