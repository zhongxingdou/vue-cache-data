import Vue from 'vue'

const CacheState = {
  UNLOAD: 0,
  LOADING: 1,
  DONE: 2,
  FAILED: 3
}

function VueCacheData () {
  var _mixins = []
  var _vm = null

  Object.defineProperty(this, 'mixins', {
    get: function () {
      return _mixins
    },
    set: function (val) {
      _mixins = val
    },
    writeable: false,
    configurable: false
  })

  Object.defineProperty(this, 'vm', {
    get: function () {
      if (_vm === null) {
        throw new Error('VueCacheData need initialize before use')
      }
      return _vm
    },
    set: function (val) {
      _vm = val
    },
    writeable: true,
    configurable: false
  })
}

VueCacheData.prototype = {
  add (key, defaultVal = null, loader) {
    let mixin = {}

    mixin.data = function () {
      let isFn = typeof defaultVal === 'function'
      let value = isFn ? defaultVal() : defaultVal
      return {
        ['cache-' + key]: {
          state: CacheState.UNLOAD,
          value: value
        }
      }
    }

    mixin.computed = {
      [key]: function () {
        let dataPath = 'cache-' + key
        if (!this.hasOwnProperty(dataPath)) return

        let cache = this[dataPath]

        // load data
        if (cache.state === CacheState.UNLOAD) {
          cache.state = CacheState.LOADING
          loader(val => {
            cache.value = val
            cache.state = CacheState.DONE
          }, () => cache.state = CacheState.FAILED)
        }

        return cache.value
      }
    }

    this.mixins.push(mixin)
  },
  init () {
    this.vm = new Vue({
      mixins: this.mixins
    })
  }
}

export default VueCacheData
