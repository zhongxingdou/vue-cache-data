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
  refresh (key, cb, retryTimes) {
    let vm = this.vm
    let cache = vm['cache-' + key]

    if (cache.state) {
      cache.state = CacheState.UNLOAD
      this.fetch(key, cb, retryTimes)
    } else {
      if (cb) cb(cache.value)
    }
  },
  
  fetch (key, cb, retryTimes) {
    if (isNaN(retryTimes)) retryTimes = 1

    let loader = this._loader[key]
    let vm = this.vm
    let cache = vm['cache-' + key]

    switch(cache.state) {
      case CacheState.FAILED:
        if (retryTimes) {
          cache.state = CacheState.UNLOAD
          this.fetch(key, cb, retryTimes)
        } else {
          cb && cb(cache.value)
        }
        break
      case CacheState.UNLOAD:
        cache.state = CacheState.LOADING

        if (cb) cache.cbs.push(cb)

        loader(val => {
          cache.value = val
          cache.state = CacheState.DONE

          let cbs = cache.cbs
          cache.cbs = []
          cbs.forEach(cb => cb(val))
        }, () => {
          if (retryTimes) {
            cache.state = CacheState.UNLOAD
            this.fetch(key, null, --retryTimes)
          } else {
            cache.cbs = []
            cache.state = CacheState.FAILED
          }
        })
        break
      case CacheState.LOADING:
        if (cb) cache.cbs.push(cb)
        break
      case CacheState.DONE:
        cb && cb(cache.value)
        break
      case undefined:
        cb && cb(cache.value)
        break
    }
  },

  fetchAll (keys, cb, retryTimes) {
    let count = keys.length
    let ret = []

    keys.forEach((key) => {
      this.fetch(key, (val) => {
        ret.push(val)
        count--
        if (count === 0) {
          cb(...ret)
        }
      }, retryTimes)
    })
  },

  set (key, val) {
    this.vm['cache-' + key].value = val
  },

  get (key) {
    return this.vm['cache-' + key].value
  },

  add (key, defaultVal = null, loader) {
    let mixin = {}
    let self = this

    mixin.data = function () {
      let isFn = typeof defaultVal === 'function'
      let value = isFn ? defaultVal() : defaultVal
      let cacheKey = 'cache-' + key

      let ret = {
        [cacheKey]: {
          value: value
        }
      }

      if (loader) {
        Object.assign(ret[cacheKey], {
          state: CacheState.UNLOAD,
          cbs: []
        })
      }

      return ret
    }

    if (loader) {
      self._loader[key] = loader
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
