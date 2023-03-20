import { type PropType, defineComponent, ref, watchEffect } from 'vue'

const imageProps = {
  data: {
    type: Object as PropType<Buffer | null>
  },
  imageClass: {
    type: String
  }
} as const

export default defineComponent({
  props: imageProps,
  setup(props, { slots }) {
    const url = ref('')

    const state = ref<0 | 1 | 2>(0)

    watchEffect(() => {
      if (props.data) {
        url.value = URL.createObjectURL(new Blob([props.data]))
      }

      return () => {
        URL.revokeObjectURL(url.value)
        url.value = ''
      }
    })

    const handleLoad = () => {
      state.value = 1
      URL.revokeObjectURL(url.value)
    }

    const handleError = () => {
      state.value = 2
      URL.revokeObjectURL(url.value)
    }

    return () => (
      <div>
        {state.value === 0 ? (slots.placeholder ? slots.placeholder() : null) : null}
        <img
          class={props.imageClass}
          src={url.value}
          v-show={state.value === 1 || (!slots.error && !slots.placeholder)}
          onLoad={handleLoad}
          onError={handleError}
        />
        {state.value === 2
          ? slots.error
            ? slots.error()
            : slots.placeholder
            ? slots.placeholder()
            : null
          : null}
      </div>
    )
  }
})
