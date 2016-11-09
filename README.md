# vue-cache-data
VueCacheData provides reactive cache data and fetched until first access

## Usage
```html
<div id="demo">
  <h1>vue cache</h1>
  <ul>
    <li v-for="stock in stockList">{{ stock }}</li>
  </ul>
</div>
```
```javascript
import VueCacheData from 'vue-cache-data'

let AppCache = new VueCacheData()

AppCache.add('stockList', () => ['NJ', 'JX'], function (onSucc, onFail) {
  setTimeout(function () {
    return onSucc(['BJ', 'SH', 'SZ', 'GZ'])
  }, 3000)
})

AppCache.init()

new Vue ({
  el: '#demo',
  computed: {
    stockList () {
      return AppCache.vm.stockList
    }
  }
})
```

## Contributing

If you think a project built with rollup should be set up differently, open an
issue to discuss it or create a pull request.
