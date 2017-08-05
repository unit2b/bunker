# Plugin

## Plugin Context

```json
{
  "file": "/private/var/folders/sc/7l_nlw290391b_w_d2xcpk_m0000gn/T/fc20d973c30e9c0b55043dfde0a92500.png"
}
```

* `file` file to process, extension name is properly set

## AfterUpload Processors

```javascript
{
  order: 0,
  name: 'trimProfile',
  testFn: (ctx) => {
    return path.extname(ctx.file) == '.png'
  },
  fn: async (ctx) => {
    // ...
  }
}
```

## Version Processors

```javascript
{
  name: 'trimProfile',
  key: 'w',
  testFn: (ctx) => {
    return path.extname(ctx.file) == '.png'
  },
  fn: async (option, ctx) => {
    // ...
  }
}
```
