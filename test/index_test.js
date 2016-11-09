import VueCacheData from '../';
import { strictEqual } from 'assert';
import Vue from 'vue'

describe('VueCacheData', () => {
  it('normal', (done) => {
    let AppCache = new VueCacheData()

    let defaultVal = ['NJ', 'JX']
    let fetchedVal = ['BJ', 'SH', 'SZ', 'GZ']

    AppCache.add('stockList', () => defaultVal, function (onSucc) {
      setTimeout(function () {
        return onSucc(fetchedVal)
      }, 0)
    })

    AppCache.init()

    let vm = new Vue({
      computed: {
        stockList () {
          return AppCache.vm.stockList
        }
      }
    })

    vm.$watch('stockList', function () {
      strictEqual(vm.stockList, fetchedVal)
      done()
    })

    strictEqual(vm.stockList, defaultVal)
  });
});
