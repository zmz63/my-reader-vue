import { defineComponent } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { NButton } from 'naive-ui'
import TextHover from '@/components/TextHover'
import SVGIcon from '@/components/SVGIcon'
import './index.scss'

export default defineComponent({
  setup() {
    const router = useRouter()

    const openBook = async () => {
      const paths = await appChannel.selectOpenFilePaths({
        filters: [{ name: 'Electronic Book', extensions: ['epub'] }]
      })

      if (!paths) {
        return
      }

      router.push({
        name: 'READER',
        query: {
          path: paths[0]
        }
      })
    }

    const startMenuOptions = [
      {
        name: 'START_RECENT',
        label: '最近',
        icon: 'ic_fluent_clock_24_filled'
      },
      {
        name: 'START_BOOKRACK',
        label: '书架',
        icon: 'ic_fluent_library_24_filled'
      },
      {
        label: '打开',
        icon: 'ic_fluent_folder_open_24_filled',
        callback: openBook
      }
    ]

    return () => (
      <div class="start-page">
        <div class="start-page-side-bar">
          <div class="base">
            {startMenuOptions.map(({ name, label, icon, callback }) =>
              name ? (
                <RouterLink to={{ name }} class="item" activeClass="active" key={name}>
                  <SVGIcon size={26} name={icon} />
                  <div>{label}</div>
                </RouterLink>
              ) : (
                <div class="item" key={label} onClick={callback}>
                  <SVGIcon size={26} name={icon} />
                  <div>{label}</div>
                </div>
              )
            )}
          </div>
          <div class="bottom">
            <TextHover
              text="设置"
              placement="right"
              content={() => (
                <NButton
                  class="setting-button"
                  quaternary
                  focusable={false}
                  onClick={() => router.push({ name: 'START_SETTING' })}
                >
                  <SVGIcon size={26} name="ic_fluent_settings_24_regular" />
                </NButton>
              )}
            />
          </div>
        </div>
        <div class="start-page-view">
          {/* <RouterView>
            {({ Component }: { Component: DefineComponent }) => (
              <KeepAlive>
                <Component />
              </KeepAlive>
            )}
          </RouterView> */}
          <RouterView />
        </div>
      </div>
    )
  }
})
