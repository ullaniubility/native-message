import { nanoid } from 'nanoid'

/**
 * 消息通信模块
 */

type IMessageResult = {
  api: string
  content?: Record<string, any>
  result?: Record<string, any>
}

type IInstance = {
  postMessage: (data: IMessageResult) => void
}

type IOptions = {
  /**
   * 超时时间
   */
  timeout?: number
}

type ICallBack = (data: IMessageResult) => void

type IEmitProps = {
  api: string
  funid: string
  data: Record<string, unknown>
  _callback: ICallBack
}

type AppWindow = Window & {
  webkit: {
    messageHandlers: Record<string, IInstance>
  }
}

export class NativeMessage {
  private static Instance?: NativeMessage | null = null

  static getInstance(instanceName: string, options?: IOptions) {
    if (!NativeMessage.Instance) {
      NativeMessage.Instance = new NativeMessage(instanceName, options)
    }
    return NativeMessage.Instance
  }

  instance: IInstance
  options: IOptions = {}
  callbacks: Record<string, ICallBack | ICallBack[]>  = {}
  constructor(instanceName: string, options?: IOptions) {
    const appwindow = (window as unknown as AppWindow)
    this.options = options || {}

    // @ts-ignore
    this.instance = (appwindow?.webkit?.messageHandlers?.[instanceName] as unknown as IInstance) ?? (appwindow[instanceName] as unknown as IInstance)

    if (!this.instance) {
      console.error('instance is not exist')
    }

    window.addEventListener('message', this._message)
  }

  public _message(evt: MessageEvent) {
    try {
      console.log(evt)
      const data = JSON.parse(evt.data)
      console.log(data)
    // eslint-disable-next-line no-empty
    } catch (error) {}
  }


  public _createMessage(msg: IMessageResult) {
    return {...msg, callId: nanoid()}
  }
  /**
   * 监听app主动调用的事件
   * @param api API名称
   * @param callback 监听到方法的回调
   *
   * @example nativeMessage.on('test', (data) => {})
   */
  on(data: IEmitProps) {
    const { _callback = loop, api, funid, ...rest} = data
    if (!this.callbacks[api]) {
      this.callbacks[api] = []
    }
    (this.callbacks[api] as ICallBack[]).push(_callback)
  }

  /**
   * 移除主动监听的方法
   */
  off(api: string, callback: ICallBack) {
    if (Array.isArray(this.callbacks[api])) {

      this.callbacks[api] = (this.callbacks[api] as ICallBack[]).filter(item => item !== callback)
    }
  }

  /**
   * 发送消息给app，如果有返回会通过有回调
   */
  emit(data: IEmitProps) {
    const { _callback = loop, api, ...rest} = data
    if (this.callbacks[api]) {
      this.callbacks[api] = _callback
    }
    this.instance.postMessage(this._createMessage({api, ...rest}))
  }

  emitPromise(data: IEmitProps) {
    const { _callback = loop, api, ...rest} = data
    if (this.callbacks[api]) {
      this.callbacks[api] = _callback
    }
    this.instance.postMessage(this._createMessage({api, ...rest}))
  }

}

export default NativeMessage

function loop() {
  return
}
