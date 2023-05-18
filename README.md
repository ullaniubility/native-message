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


### 参数说明

#### OpenPage与OpenPopup

``` typescript
// 打开普通网页
nativeMessage.emit({
  api: 'OpenPopup',
  content: {
    type: 0,
    url: 'https://www.google.com?a=b&c=d',
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
