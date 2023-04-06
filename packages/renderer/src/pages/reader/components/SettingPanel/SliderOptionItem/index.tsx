import { type PropType, defineComponent, reactive } from 'vue'
import { NInputNumber, NSelect, NSlider, NSwitch } from 'naive-ui'
import OptionItem from '../OptionItem'
import './index.scss'

export type SliderOptionItemData = {
  value: number
  disabled?: boolean
  unit: string
}

type UnitData = {
  name: string
  default: number
  max: number
  min: number
  precision?: number
  step?: number
}

const sliderOptionItemProps = {
  label: {
    type: String,
    required: true
  },
  switch: {
    type: Boolean,
    default: true
  },
  defaultData: {
    type: Object as PropType<SliderOptionItemData>,
    required: true
  },
  unit: {
    type: [Object, Array] as PropType<UnitData | UnitData[]>,
    required: true
  }
} as const

export default defineComponent({
  props: sliderOptionItemProps,
  emits: {
    change(data: SliderOptionItemData) {
      return typeof data === 'object'
    }
  },
  setup(props, { emit }) {
    const data = reactive({ ...props.defaultData })

    const unitMap: Record<string, UnitData> = {}

    if (Array.isArray(props.unit)) {
      for (const data of props.unit) {
        unitMap[data.name] = { ...data }
      }
    } else {
      unitMap[props.unit.name] = { ...props.unit }
    }

    return () => (
      <OptionItem label={props.label}>
        {{
          header: () =>
            props.switch && (
              <NSwitch
                value={!data.disabled}
                size="small"
                onUpdateValue={value => {
                  data.disabled = !value

                  emit('change', { ...data })
                }}
              />
            ),
          default: () => (
            <>
              <NSlider
                value={data.value}
                max={unitMap[data.unit].max}
                min={unitMap[data.unit].min}
                step={unitMap[data.unit].step || 1}
                tooltip={false}
                disabled={data.disabled}
                onUpdateValue={value => {
                  data.value = value
                  emit('change', { ...data })
                }}
              />
              <NInputNumber
                class="input-box"
                value={data.value}
                placeholder=""
                max={unitMap[data.unit].max}
                min={unitMap[data.unit].min}
                size="small"
                disabled={data.disabled}
                precision={unitMap[data.unit].precision || 0}
                showButton={false}
                onUpdateValue={value => {
                  if (value === null) {
                    value = 0
                  }

                  data.value = value
                  emit('change', { ...data })
                }}
              >
                {{
                  suffix: () => {
                    if (Array.isArray(props.unit)) {
                      if (props.unit.length === 1) {
                        return <div class="unit">{props.unit[0].name}</div>
                      } else {
                        return (
                          <NSelect
                            class="unit-selector"
                            value={data.unit}
                            size="small"
                            bordered={false}
                            options={props.unit.map(item => ({
                              label: item.name,
                              value: item.name
                            }))}
                            disabled={data.disabled}
                            showCheckmark={false}
                            onUpdateValue={value => {
                              data.unit = value
                              data.value = unitMap[value].default

                              emit('change', { ...data })
                            }}
                          ></NSelect>
                        )
                      }
                    } else {
                      return <div class="unit">{props.unit.name}</div>
                    }
                  }
                }}
              </NInputNumber>
            </>
          )
        }}
      </OptionItem>
    )
  }
})
