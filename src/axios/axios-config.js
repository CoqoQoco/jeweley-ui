import axios from 'axios'

// ------ URL Config docker -----
//const jewelryUrl = 'http://localhost:2001/'

// ------ url local docker test ------
//const jewelryUrl = 'http://192.168.1.35:2001/'

//test build
const jewelryUrl = 'https://localhost:49153/'

//test build net core by kastrel
//const jewelryUrl = 'http://localhost:5025/'

//test production
//const jewelryUrl = 'http://192.168.1.55:2001/'

// ----- GET API ----- //
const get = async function (url, params, optionsConfig) {
  try {
    // if (isAdToken) {
    //   if (isOverHalfHour) {
    //     token = await acquireToken()
    //     timestamp = moment()
    //   }
    // }

    const res = await axios.get(url, {
      ...optionsConfig,
      headers: {
        ...optionsConfig?.headers
        //Authorization: token,
        //'authen-ad': isAdToken,
        //Platform: isMobile() ? 'mobile' : 'web'
      },
      params: params
    })

    return res.data
  } catch (error) {
    console.log(error)
    throw error
  }
}
// ----- Post API ----- //
const post = async function (url, data, optionsConfig) {
  try {
    const res = await axios.post(url, data, {
      ...optionsConfig,
      headers: {
        ...optionsConfig?.headers
      }
    })

    return res.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export default {
  jewelry: {
    get: async (url, params) => await get(`${jewelryUrl}${url}`, params),
    post: async (url, params, optionsConfig) =>
      await post(`${jewelryUrl}${url}`, params, optionsConfig)
  }
}
