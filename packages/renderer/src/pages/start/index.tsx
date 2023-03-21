import { type DefineComponent, KeepAlive, defineComponent } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import SvgIcon from '@/components/SvgIcon'
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
        icon: 'ic_fluent_clock_24_regular'
      },
      {
        name: 'START_BOOKRACK',
        label: '书架',
        icon: 'ic_fluent_library_24_regular'
      },
      {
        label: '打开',
        icon: 'ic_fluent_folder_open_24_regular',
        callback: openBook
      }
    ]

    return () => (
      <div class="start-page">
        <div class="start-page-side-bar">
          {startMenuOptions.map(({ name, label, icon, callback }) =>
            name ? (
              <RouterLink to={{ name }} class="item" activeClass="active" key={name}>
                <SvgIcon size={20} name={icon} />
                <div>{label}</div>
              </RouterLink>
            ) : (
              <div class="item" key={label} onClick={callback}>
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
