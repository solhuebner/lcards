import DefaultTheme from 'vitepress/theme'
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client'
import './style.css'

export default {
  ...DefaultTheme,
  enhanceApp({ app }: { app: any }) {
    enhanceAppWithTabs(app)
  },
}
