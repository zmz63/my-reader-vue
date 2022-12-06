import { KeepAlive, defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import TopBar from './TopBar'
import SideBar from './SideBar'
import type { DefineComponent } from 'vue'
import './index.scss'

export default defineComponent({
  setup() {
    return () => (
      <div class="layout">
        <TopBar />
        <div class="main-container">
          <SideBar />
          <div class="main-view">
            <RouterView>
              {({ Component }: { Component: DefineComponent }) => (
                <KeepAlive>
                  <Component />
                </KeepAlive>
              )}
            </RouterView>
          </div>
        </div>
      </div>
    )
  }
})
