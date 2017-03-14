import VueCacheData from '../'
import { strictEqual } from 'assert'
import Vue from 'vue'

describe('VueCacheData', () => {
  let AppCache, defaultVal, fetchedVal, noLoaderKey, noLoaderVal,
      needRetryTimes, retryTimesCount,
      failed3TimesData

  before(() => {
    Vue.use(VueCacheData)
    
    AppCache = new VueCacheData()
    defaultVal = ['NJ', 'JX']
    noLoaderKey = 'noLoader'
    noLoaderVal = 'noLoaderVal'

    AppCache.add('stockList', () => defaultVal, function (onSucc) {
      setTimeout(function () {
        return onSucc(fetchedVal)
      }, 0)
    })

    AppCache.add('data1', null, function (onSucc) {
      setTimeout(function () {
        return onSucc('data1')
      }, 0)
    })

    AppCache.add('data2', null, function (onSucc) {
      setTimeout(function () {
        return onSucc('data2')
      }, 0)
    })

    AppCache.add('failed3TimesData', null, function (onSucc, onFail) {
      setTimeout(() => {
        retryTimesCount++
        if (retryTimesCount === needRetryTimes) {
          onSucc(failed3TimesData)
        } else {
          onFail()
        }
      }, 0)
    })

    AppCache.add(noLoaderKey, noLoaderVal)

    AppCache.init()
  })

  beforeEach(() => {
    needRetryTimes = 0
    retryTimesCount = 0
    fetchedVal = ['BJ', 'SH', 'SZ', 'GZ']
  })

  afterEach(() => {
    AppCache.set('stockList', defaultVal)
  })

  it('fetchAll() nomral if loading succeed', (done) => {
    AppCache.fetchAll(['data1', 'data2'], function (succeed, data1, data2) {
      strictEqual(data1, 'data1')
      strictEqual(data2, 'data2')
      done()
    })
  })

  it('fetch() should retry given times if loading failed', (done) => {
    needRetryTimes = 3
    failed3TimesData = '#$#!@$@!$'

    AppCache.fetch('failed3TimesData', (succeed, val) => {
      strictEqual(val, failed3TimesData)
      done()
    }, needRetryTimes)
  })

  it('fetch() should normal for cache data without loader', () => {
    AppCache.fetch(noLoaderKey, (succeed, val) => {
      strictEqual(noLoaderVal, val)
    })
  })

  it('get and set no loader value', () => {
    strictEqual(AppCache.get(noLoaderKey), noLoaderVal)

    let newVal = 'abcd'
    AppCache.set(noLoaderKey, newVal)

    strictEqual(AppCache.get(noLoaderKey), newVal)
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

  it('refresh() normal', (done) => {
    let newVal = ['YC', 'WLMQ']
    fetchedVal = newVal
    AppCache.refresh('stockList')

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
