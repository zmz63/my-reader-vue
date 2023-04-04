import { type PropType, defineComponent, reactive } from 'vue'
import { NInputNumber, NSelect, NSlider, NSwitch } from 'naive-ui'
import './index.scss'

type OptionItemData = {
  value: number
  disabled: boolean
  unit: string
}

type UnitData = {
  name: string
  default: number
  max: number
  min: number
  precision?: number
}

const optionItemProps = {
  label: {
    type: String,
    required: true
  },
  defaultData: {
    type: Object as PropType<OptionItemData>,
    required: true
  },
  unit: {
    type: [Object, Array] as PropType<UnitData | UnitData[]>,
    required: true
  }
} as const

export default defineComponent({
  props: optionItemProps,
  emits: {
    change(data: OptionItemData) {
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
      <div class="reader-page-option-item">
        <div class="option-header">
          <div class="label">{props.label}</div>
          <NSwitch
            value={!data.disabled}
            size="small"
            onUpdateValue={value => (data.disabled = !value)}
          />
        </div>
        <div class="option-content">
          <NSlider
            v-model:value={data.value}
            max={unitMap[data.unit].max}
            min={unitMap[data.unit].min}
            step={1 / 10 ** (unitMap[data.unit].precision || 0)}
            tooltip={false}
            disabled={data.disabled}
            onUpdateValue={value =>
              emit('change', { value, disabled: data.disabled, unit: data.unit })
            }
          />
          <NInputNumber
            class="input-box"
            v-model:value={data.value}
            placeholder=""
            max={unitMap[data.unit].max}
            min={unitMap[data.unit].min}
            size="small"
            disabled={data.disabled}
            precision={unitMap[data.unit].precision || 0}
            showButton={false}
            parse={value => Number(value)}
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
                        v-model:value={data.unit}
                        size="small"
                        bordered={false}
                        options={props.unit.map(item => ({
                          label: item.name,
                          value: item.name
                        }))}
                        disabled={data.disabled}
                        showCheckmark={false}
                        onUpdateValue={value => {
                          data.value = unitMap[value].default

                          emit('change', {
                            value: data.value,
                            disabled: data.disabled,
                            unit: value
                          })
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
        </div>
      </div>
    )
  }
})
