<template>
  <div class="container">
    <div class="scroll-list-container-box" @scroll="scrollDeal" ref="box">
      <ul class="scroll-list-box" :style="{ height: sumHeight + 'px' }">
        <li class="item" v-for="(item, i) in list" :key="item + '-' + i" :style="itemStyle(item)">
          <list-item :content="(item as any)"></list-item>
        </li>
      </ul>
    </div>
    <div class="scroll-bar" ref="bar" @mousedown="scrollBarDown"></div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, onBeforeMount, onMounted, provide, ref } from 'vue'
import { getStyle } from './getStyle'
import ListItem from './list-item'

export default defineComponent({
  components: {
    ListItem,
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    height: {
      type: Number,
      default: 30,
    },
  },
  setup(props, ctx) {
    let { height, data } = props
    provide('virtual-scroll', ctx)
    const box = ref<HTMLElement>()
    let box_h: number
    let bar_h: number
    onMounted(() => {
      const box_h_v = getStyle(box.value!, 'height') as string
      const bar_h_v = getStyle(bar.value!, 'height') as string
      box_h = parseInt(box_h_v)
      bar_h = parseInt(bar_h_v)
      // sumHeight.value -= box_h
      document.addEventListener('mousemove', docMouseMove)
      document.addEventListener('mouseup', docMouseUp)
      showNum.value = Math.ceil(box_h / height)
    })
    onBeforeMount(() => {
      document.removeEventListener('mousemove', docMouseMove)
      document.removeEventListener('mouseup', docMouseUp)
    })
    const base = ref(0)
    const sumHeight = ref(data.length * height)
    const showNum = ref(20)
    const list = computed(() => {
      const _list = data.slice(base.value, base.value + showNum.value)
      return _list
    })
    const h = ref(height)
    const bar = ref<HTMLElement>()
    const itemStyle = (item: any) => {
      const index = data.indexOf(item)
      return {
        height: height + 'px',
        top: index * height + 'px',
      }
    }

    const scrollDeal = (eve: any) => {
      const scroll_v = eve.target.scrollTop
      if (isAutoScroll) {
        const per = scroll_v / sumHeight.value
        const translate_y = (box_h - bar_h) * per
        const el = bar.value! as HTMLElement
        el.style.transform = `translateY(${translate_y}px)`
      }
      const base_num = Math.floor(scroll_v / height)
      base.value = base_num
    }

    // 拖拽滚动条实现列表一致
    let isCanMove = false
    let initY: number
    let translate_y: number = 0
    let isAutoScroll = true
    const scrollBarDown = (e: MouseEvent) => {
      isCanMove = true
      isAutoScroll = false
      initY = e.clientY
      const el = bar.value as unknown as HTMLElement
      const t_y = el.style.transform
      const t_y_Rxp = /translateY\((\d+\.?(\d+)?)px\)/
      if (t_y.match(t_y_Rxp)) {
        translate_y = Number(RegExp.$1)
      }
    }
    const docMouseMove = (e: MouseEvent) => {
      if (isCanMove) {
        const diffY = e.clientY - initY
        let v = translate_y + diffY
        const per = v / (box_h - bar_h)
        if (v < 0) {
          v = 0
        } else if (v > box_h - bar_h) {
          v = box_h - bar_h
        }
        const scroll_y = per * sumHeight.value
        const box_el = box.value!
        const bar_el = bar.value!
        box_el.scrollTop = scroll_y
        bar_el.style.transform = `translateY(${v}px)`
      }
    }
    const docMouseUp = () => {
      isCanMove = false
      isAutoScroll = true
    }
    return {
      list,
      h,
      base,
      sumHeight,
      itemStyle,
      scrollDeal,
      bar,
      box,
      scrollBarDown,
    }
  },
})
</script>
<style lang="scss" scoped>
.container {
  height: 100%;
  overflow: hidden;
  position: relative;
  user-select: none;
  .scroll-list-container-box {
    height: 100%;
    overflow: auto;
    position: relative;
    &::-webkit-scrollbar,
    &::-webkit-scrollbar-thumb,
    &::-webkit-scrollbar-track {
      width: 0;
      height: 0;
      display: none;
    }
    .scroll-list-box {
      margin: 0;
      padding: 0;
      position: relative;
      .item {
        list-style: none;
        padding: 0 5px;
        position: absolute;
        left: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        box-sizing: border-box;
      }
    }
  }
  .scroll-bar {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 10;
    width: 10px;
    height: 30%;
    border-radius: 10px;
    background: rgba(102, 204, 255, 0.6);
    transform: translateY(0);
    cursor: pointer;
  }
}
</style>
