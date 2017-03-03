import VueCacheData from '../'
import { strictEqual } from 'assert'
import Vue from 'vue'

describe('VueCacheData', () => {
  let AppCache, defaultVal, fetchedVal

  before(() => {
    AppCache = new VueCacheData()
    defaultVal = ['NJ', 'JX']

    AppCache.add('stockList', () => defaultVal, function (onSucc) {
      setTimeout(function () {
        return onSucc(fetchedVal)
      }, 0)
    })

    AppCache.init()
  })

  beforeEach(() => {
    fetchedVal = ['BJ', 'SH', 'SZ', 'GZ']
  })

  afterEach(() => {
    AppCache.set('stockList', defaultVal)
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
    AppCache.get('stockList', defaultVal)
  })
})
