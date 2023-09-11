<template>
  <div class="breadcrumb-container">
    <!-- START -->
    <!-- 1. Home icon -->
    <div>
      <span @click="gotoHome" class="icon-arrow">
        <i class="bi bi-house-door-fill cursor base-color"></i>
      </span>
      <span v-if="currentRouteName !== 'home'" class="icon-arrow">
        <i class="bi bi-chevron-right base-color"></i>
      </span>
    </div>

    <!-- 2. For Route Items -->
    <div v-for="(item, index) in arrShowPath" :key="index">
      <div>
        <span
          @click="redirectTo(item.redirect)"
          :class="[item.redirect !== '' ? 'route-name' : 'disable-route-name']"
        >
          <span class="base-color" v-if="item.displayName.includes('breadcrumb')">{{
            $t(`${item.displayName}`)
          }}</span>
          <span v-else class="base-color">{{ $t(`${item.displayName}`) }}</span>
        </span>
        <span v-if="index < arrShowPath.length - 1" class="icon-arrow">
          <i class="bi bi-chevron-right"></i>
        </span>
      </div>
    </div>
    <!-- END -->
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data() {
    return {
      currentRouteName: '',
      arrShowPath: []
    }
  },
  methods: {
    // Generate
    async setRoutesPath() {
      const splitPath = this.$route.path.split('/').filter((thing) => thing !== '')
      //console.log(splitPath)
      const newRoutesMapping = splitPath.map((thing, index) => {
        return {
          name: _.camelCase(thing),
          displayName: this.changeRouteName(splitPath.slice(0, index + 1).join('-')),
          redirect: !(index >= splitPath.length - 1)
            ? splitPath
                .slice(0, index + 1)
                .map((thing) => `/${thing}`)
                .join('')
            : ''
        }
      })

      this.arrShowPath = newRoutesMapping

      //console.log(this.arrShowPath)
    },
    changeRouteName(displayName) {
      const splitDisplayName = displayName.split('-')
      let nameString = ''

      if (splitDisplayName.find((thing) => thing === 'create')) {
        nameString = 'breadcrumb.create'
      } else if (splitDisplayName.slice(3, -1).length >= 4) {
        nameString = 'breadcrumb.edit'
      } else if (isNaN(splitDisplayName[splitDisplayName.length - 1])) {
        if (splitDisplayName[splitDisplayName.length - 1].includes('CUT')) {
          nameString = 'breadcrumb.detail'
        } else {
          const lastUrlString = splitDisplayName[splitDisplayName.length - 1]
          const firstLetter = lastUrlString[0]
          const lastLetter = lastUrlString[lastUrlString.length - 1]
          if (isNaN(firstLetter) && !isNaN(lastLetter)) {
            nameString = lastUrlString
          } else {
            nameString = `breadcrumb.${_.camelCase(displayName)}`
          }
        }
      } else {
        nameString = 'breadcrumb.detail'
      }

      return nameString
    },
    // router
    gotoHome() {
      this.$router.push('/')
    },
    redirectTo(path) {
      this.$router.push(`${path}`)
    }
  },
  watch: {
    $route(value) {
      this.currentRouteName = value.name
      this.setRoutesPath()
    }
  },
  async created() {
    this.currentRouteName = this.$route.name
    await this.setRoutesPath()
  }
}
</script>
<style lang="scss" scoped>
.breadcrumb-container {
  height: 50px;
  display: flex;
  align-items: center;
  .base-color {
    color: var(--base-font-color);
  }
}

.route-name {
  color: #ffff;
  font-weight: bold;
  cursor: pointer;
}

.disable-route-name {
  color: #4babd5;
  font-weight: bold;
}

.icon-arrow {
  margin-right: 5px;
  margin-left: 5px;
  color: white;
}
</style>
