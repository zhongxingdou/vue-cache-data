import VueCacheData from '../'
import { strictEqual } from 'assert'
import Vue from 'vue'

describe('VueCacheData', () => {
  let AppCache, defaultVal, fetchedVal, key, val

  before(() => {
    AppCache = new VueCacheData()
    defaultVal = ['NJ', 'JX']
    key = 'appName'
    val = 'VueApp'

    AppCache.add('stockList', () => defaultVal, function (onSucc) {
      setTimeout(function () {
        return onSucc(fetchedVal)
      }, 0)
    })

    AppCache.add(key, val)

    AppCache.init()
  })

  beforeEach(() => {
    fetchedVal = ['BJ', 'SH', 'SZ', 'GZ']
  })

  afterEach(() => {
    AppCache.set('stockList', defaultVal)
  })

  it('get and set no loader value', () => {
    strictEqual(AppCache.get(key), val)

    let newVal = 'abcd'
    AppCache.set(key, newVal)

    strictEqual(AppCache.get(key), newVal)
  })

  it('normal', (done) => {
    let vm = new Vue({
      computed: {
        stockList () {
          return AppCache.vm.stockList
        }
      }
    })

    vm.$watch('stockList', function () {
      strictEqual(vm.stockList, fetchedVal)
      vm.$destroy()
      done()
    })

    strictEqual(vm.stockList, defaultVal)
  })

  it('set() normal', () => {
    let val = ['CD', 'ZZ']
    AppCache.set('stockList', val)

    strictEqual(AppCache.vm.stockList, val)
  })

  it('fetch() normal', (done) => {
    let newVal = ['YC', 'WLMQ']
    fetchedVal = newVal
    AppCache.fetch('stockList')

    setTimeout(() => {
      strictEqual(AppCache.vm.stockList, newVal)
      done()
    })
  })

  it('get() normal', () => {
    let val = AppCache.get('stockList')
    strictEqual(val, defaultVal)
  })
})
