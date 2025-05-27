<template>
  <div class="container">
    <div class="scroll-list-container-box" @scroll="scrollDeal" ref="box">
      <ul class="scroll-list-box" :style="{ height: sumHeight + 'px' }">
        <li class="item" v-for="(item, i) in list" :key="item + '-' + i" :style="item.style">
          <slot :item="item" :index="i">
            {{ item }}
          </slot>
        </li>
      </ul>
    </div>
    <div class="scroll-bar" ref="bar" @mousedown="scrollBarDown"></div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { getStyle } from './getStyle'

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  height: {
    type: Number,
    default: 30,
  },
})

const box = ref<HTMLElement>()
const box_h = ref(0)
let bar_h: number

const fixedHeight = 1_000_000
const actualHeight = props.data.length * props.height
const renderHeight = Math.min(actualHeight, fixedHeight)
const scale = renderHeight / actualHeight
const base = ref(0)
const sumHeight = ref(renderHeight)
const showNum = ref(20)
// const list = computed(() => {
//   const _list = props.data.slice(base.value, base.value + showNum.value)
//   let _index = props.data.indexOf(_list[0])
//   let firstTop = _index * props.height * scale
//   if (firstTop < 0) {
//     firstTop = 0
//   }
//   _list.forEach((item, i) => {
//     const top = firstTop + (i * props.height) + 'px'
//     // @ts-expect-error
//     item.style = `height: ${h.value}px; top: ${top};`
//   })
//   return _list
// })
const list = ref([])
const h = ref(props.height)
const bar = ref<HTMLElement>()

const calcList = (per: number, scrollTop: number) => {
  const baseIndex = Math.min(props.data.length - showNum.value, Math.floor(per * (props.data.length - showNum.value)))
  const _list = props.data.slice(baseIndex, baseIndex + showNum.value)
  let firstTop = scrollTop
  for (let i = 0; i < _list.length; i++) {
    const top = firstTop + i * props.height + 'px'
    // @ts-expect-error
    _list[i].style = `height: ${h.value}px; top: ${top};`
  }
  list.value = _list
}

const scrollDeal = (event: MouseEvent) => {
  const el = event.target as HTMLElement
  const scrollTop = el.scrollTop
  const totalScroll = sumHeight.value - box_h.value
  const per = scrollTop / totalScroll
  calcList(per, scrollTop)

  // 同步滚动条位置
  const bar_el = bar.value as unknown as HTMLElement
  const v = per * (box_h.value - bar_h)
  bar_el.style.transform = `translateY(${v}px)`
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
    const per = v / (box_h.value - bar_h)
    if (v < 0) {
      v = 0
    } else if (v > box_h.value - bar_h) {
      v = box_h.value - bar_h
    }
    const box_el = box.value!
    const bar_el = bar.value!
    const scroll_v = sumHeight.value * per
    box_el.scrollTop = scroll_v
    bar_el.style.transform = `translateY(${v}px)`
    calcList(per, scroll_v)
  }
}
const docMouseUp = () => {
  isCanMove = false
  isAutoScroll = true
}

onMounted(() => {
  const box_h_v = getStyle(box.value!, 'height') as string
  const bar_h_v = getStyle(bar.value!, 'height') as string
  box_h.value = parseInt(box_h_v)
  bar_h = parseInt(bar_h_v)
  // sumHeight.value -= box_h
  document.addEventListener('mousemove', docMouseMove)
  document.addEventListener('mouseup', docMouseUp)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousemove', docMouseMove)
  document.removeEventListener('mouseup', docMouseUp)
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
