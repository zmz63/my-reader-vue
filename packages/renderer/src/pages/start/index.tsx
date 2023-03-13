import { type DefineComponent, KeepAlive, defineComponent } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import SvgIcon from '@/components/SvgIcon'
import './index.scss'

const startMenuOptions = [
  {
    name: 'START_RECENT',
    label: '最近',
    icon: 'ic_fluent_clock_24_regular'
  },
  {
    label: '打开',
    icon: 'ic_fluent_folder_open_24_regular'
  }
]

export default defineComponent({
  setup() {
    return () => (
      <div class="start-page">
        <div class="start-page-side-bar">
          {startMenuOptions.map(({ name, label, icon }) =>
            name ? (
              <RouterLink to={{ name }} class="item" activeClass="active" key={name}>
                <SvgIcon size={20} name={icon} />
                <div>{label}</div>
              </RouterLink>
            ) : (
              <div class="item" key={label}>
                <SvgIcon size={20} name={icon} />
                <div>{label}</div>
              </div>
            )
          )}
        </div>
        <div class="start-page-view">
          <RouterView>
            {({ Component }: { Component: DefineComponent }) => (
              <KeepAlive>
                <Component />
              </KeepAlive>
            )}
          </RouterView>
        </div>
      </div>
    )
  }
})
