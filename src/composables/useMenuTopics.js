import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

export function useMenuTopics() {
  const router = useRouter()
  const { locale } = useI18n()

  const getMenuTopics = () => {
    const routes = router.getRoutes()
    return routes
      .filter((r) => r.meta && r.meta.majorShow)
      .map((r) => ({
        value: r.name,
        label: r.meta.Displayname
          ? r.meta.Displayname[locale.value] || r.meta.Displayname['th'] || r.name
          : r.name
      }))
      .filter((item) => item.value && item.label)
  }

  return { getMenuTopics }
}

export default useMenuTopics
