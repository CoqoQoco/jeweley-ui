// ALL
import breadcrumb from './breadcrumb/th.js'
import alerts from './alerts/th.js'
import button from './button/th.js'

//view
import pickinglist from './view/pickinglist/th.js'
export default {
  breadcrumb: { ...breadcrumb },
  alert: { ...alerts },
  button: { ...button },
  view: {
    pickinglist: { ...pickinglist }
  }
}
