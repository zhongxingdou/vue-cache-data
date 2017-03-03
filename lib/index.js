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
  this._loader = {}


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
  fetch (key) {
    let loader = this._loader[key]
    let vm = this.vm
    let cache = vm['cache-' + key]

    if (loader && cache.state !== CacheState.LOADING) {
      cache.state = CacheState.LOADING
      loader(val => {
        cache.value = val
        cache.state = CacheState.DONE
      }, () => cache.state = CacheState.FAILED)
    }
  },

  set (key, val) {
    this.vm['cache-' + key].value = val
  },

  get (key) {
    let cache = this.vm['cache-' + key]
    return cache && cache.value
  },

  add (key, defaultVal = null, loader) {
    let mixin = {}
    let self = this

    self._loader[key] = loader

    mixin.data = function () {
      let isFn = typeof defaultVal === 'function'
      let value = isFn ? defaultVal() : defaultVal
      return {
        ['cache-' + key]: {
          state: CacheState.UNLOAD,
          value: value,
          loader: loader
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
          self.fetch(key)
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
