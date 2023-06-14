# native message
H5与APP 通信方法说明，本工具可以主动发送消息与被动监听app的方法。

## 使用

``` typescript
import NativeMessage from 'native-message'
// 除非理解需求，否则建议全局仅创建一个实例，此方法可多次调用，仅生成一个实例
const nativeMessage = NativeMessage.getInstance('app暴露出来的方法名称，下面会有一个postMessage方法', {
  timeout: 10000, // 超时时间，单位毫秒，默认不超时
})
```

### 发送消息
使用场景：主动让app处理某一件事情，比如打开键盘，跳转页面
``` typescript
nativeMessage.emit({
  api: '方法名称',
  content: {}
}, (result) => {
  // 回调函数

  // 此处传递的数据和发送的数据结构一致，会包含任务处理后的结果
  console.log(result)
})
```

### 被动监听
使用场景：app让h5处理什么事情，比如让h5重新加载。记得移除监听事件
``` typescript
const cb = (result) => {
  // 回调函数

  // 此处传递的数据和发送的数据结构一致，会包含任务处理后的结果
  console.log(result)
}
// 设置开始监听
nativeMessage.on({
  api: '方法名称',
  content: {}
}, cb)

// 设置移除监听，此处填写的回调函数需要与绑定的函数同一引用地址
nativeMessage.off({
  api: '方法名称',
  content: {}
}, cb)

```

## 方法列表
方法的命名建议使用大驼峰的规范
|方法名称|方法API|
|---|---|
|可用余额|AvailableBalance|
|选择资产|SelectAssets|
|选择供应商|SelectSupplier|
|打开页面|OpenPage|
|打开弹窗|OpenPopup|
|复制内容|copyWay|
|获取公用参数|fetchSystemConfig|
|获取当前用户所有地址|fetchUserAddressList|
|广播消息|broadcastMessage|
|保存到数据库|saveH5Data|
|获取数据|getH5Data|
|删除数据|delH5Data|
|设置右上角菜单|setRightMenu|
|事件转发|eventForwarding|


### 参数说明

#### OpenPage与OpenPopup
``` typescript
// 打开普通网页
nativeMessage.emit({
  api: 'SelectAssets',
  content: {
    type: 0, // 0: 列表选择 ｜ 1: 默认数据
  }
})
```

#### OpenPage与OpenPopup

``` typescript
// 打开普通网页
nativeMessage.emit({
  api: 'OpenPopup',
  content: {
    type: 0,
    url: 'https://www.google.com?a=b&c=d',
    force: 0, // 0: 不强制外部浏览器 ｜ 1: 强制外部浏览器, 默认不传
  }
})

// 打开h5内部页面
nativeMessage.emit({
  api: 'OpenPopup',
  content: {
    type: 1,
    url: '/#/tokensell?address=0x1234567890',
  }
})

// 打开App内部页面
nativeMessage.emit({
  api: 'OpenPopup',
  content: {
    type: 2,
    url: '/home?address=0x1234567890',
  }
})
```

#### copyWay 复制文本

``` typescript
// 复制文本
nativeMessage.emit({
  api: 'copyWay',
  content: {
    text: '需要复制的文本',
  }
})
```

#### fetchSystemConfig 获取公用参数

``` typescript
// 获取公用参数
await nativeMessage.emitPromise({
  api: 'fetchSystemConfig'
})

// => {api: "fetchSystemConfig", content: {…}, result: {…}, status: 'success'}
```


#### fetchUserAddressList 获取当前用户所有地址

``` typescript
// 获取当前用户所有地址
await nativeMessage.emitPromise({
  api: 'fetchUserAddressList'
})

// => {api: "fetchUserAddressList", content: {…}, result: {
//     addressList: [
//       {
//         address: '0x1234567890',
//         net: '网络名称',
//       }
//     ]
// }, status: 'success'}
```

#### broadcastMessage 广播消息

A页面执行此方法当前应用内所有活跃的webview都会收到此消息

``` typescript
// A页面 发送广播消息
await nativeMessage.emitPromise({
  api: 'broadcastMessage',
  content: {...}
})

// 其它页面 监听广播消息
// => {api: "broadcastMessage", content: {…}, result: {...}, status: 'success'}
```

#### saveH5Data 保存数据

永久保存数据到app本地数据库中，固定格式数据，key值为字符串，名称重复会导致更新，所以请添加命名空间，value值为JSON格式字符串

``` typescript
await nativeMessage.emitPromise({
  api: 'saveH5Data',
  content: {
    key: 'key',
    value: 'value',
  }
})

// 保存数据
// => {api: "saveH5Data", content: {…}, result: {...}, status: 'success'}
```

#### getH5Data 获取数据

``` typescript
await nativeMessage.emitPromise({
  api: 'getH5Data',
  content: {
    key: 'key',
  }
})

// 保存数据
// => {api: "getH5Data", content: {…}, result: {...}, status: 'success'}
```

#### delH5Data 删除数据

``` typescript
await nativeMessage.emitPromise({
  api: 'delH5Data',
  content: {
    key: 'key',
  }
})

// 保存数据
// => {api: "delH5Data", content: {…}, result: {...}, status: 'success'}
```

#### setRightMenu 设置右上角按钮

``` typescript
await nativeMessage.emitPromise({
  api: 'setRightMenu',
  content: {
    buttons: [
      {
        icon: '图片url',
        text: '按钮',
        iconType: 'filter', // 图标类型，可选值：filter | close | share | more
      }
    ]
  }
})
```


#### eventForwarding 事件转发
跨浏览器页面等场景下，需要将事件转发到其它页面中处理

``` typescript
await nativeMessage.emitPromise({
  api: 'eventForwarding',
  content: {...}
})
```

## 监听app方法

方法的命名建议使用大驼峰的规范
|方法名称|方法API|
|---|---|
|当右上角按钮被点击|rightMenuClick|
|监听转发|monitorForwarding|

#### rightMenuClick 当右上角按钮被点击

``` typescript
nativeMessage.on({
  api: 'rightMenuClick',
}, (result) => {
  // 回调函数

  /**
   * result: {
   *  index: 0, // 点击的按钮索引
   * }
   */
})

```

#### monitorForwarding 当其它页面调用eventForwarding方法时触发

``` typescript
nativeMessage.on({
  api: 'monitorForwarding',
}, (result) => {
  // 回调函数

  /**
   * result: {
   *  index: 0, // 点击的按钮索引
   * }
   */
})

```
