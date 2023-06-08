import { nanoid } from 'nanoid'

/**
 * 消息通信模块
 */

type IMessageBase = {
  api: string
  content?: Record<string, any>
  result?: Record<string, any>
}

type IMessageResult = IMessageBase & {
  callId: string
  status: 'success' | 'error'
}

type IInstance = {
  postMessage: (data: string) => void
}

type IOptions = {
  /**
   * 超时时间
   */
  timeout?: number
  debug?: boolean
}

type ICallBack = (data: IMessageResult) => void

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
    this.instance = (appwindow?.webkit?.messageHandlers?.[instanceName] as unknown as IInstance) ?? (appwindow[instanceName] as unknown as IInstance) ?? (appwindow[instanceName] as unknown as IInstance).dispatchMessage

    if (!this.instance) {
      console.error('instance is not exist')
    }

    window.addEventListener('message', this._message.bind(this))
  }

  public _message(evt: MessageEvent) {
    if (this.options.debug) {
      console.log('NativeMessage|监听到: ', evt)
    }

    try {
      const data = typeof evt.data === 'object' ? evt.data : JSON.parse(evt.data) as IMessageResult
      const fullApi = data.api + data.callId
      if (this.callbacks[fullApi]) {
        (this.callbacks[fullApi] as ICallBack)(data)
        delete this.callbacks[fullApi]
      } else if(this.callbacks[data.api]) {
        const fns = this.callbacks[data.api] as ICallBack[] || [];

        if (typeof fns === 'function') {
          (fns as ICallBack)(data)
        } else {
          console.log(fns)
          fns.forEach(item => item(data))
        }
      }
    // eslint-disable-next-line no-empty
    } catch (error) {
      console.log('message parse Error: ', error)
    }
  }


  public _createMessage(msg: IMessageBase) {
    return {content: {}, ...msg, callId: nanoid()}
  }
  /**
   * 监听app主动调用的事件
   * @param api API名称
   * @param callback 监听到方法的回调
   *
   * @example nativeMessage.on('test', (data) => {})
   */
  on(data: IMessageResult, callback?: ICallBack) {
    if (!callback) {
      return console.error('请传入回调函数，并且不要使用匿名函数')
    }
    const { api } = data
    if (!this.callbacks[api]) {
      this.callbacks[api] = []
    }
    (this.callbacks[api] as ICallBack[]).push(callback!)
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
  emit(data: IMessageBase, callback: ICallBack = loop) {
    const sendMessage = this._createMessage(data)
    const { api, callId } = sendMessage
    const fullApi = api + callId
    this.callbacks[fullApi] = callback
    if (this.options.debug) {
      console.log('NativeMessage|发送事件: ', data)
    }
    this.instance?.postMessage?.(JSON.stringify(sendMessage))
    if (!this.instance) {
      const appwindow = (window as unknown as AppWindow)
      ;(appwindow?.webkit?.messageHandlers?.[api] as unknown as IInstance)?.postMessage?.(JSON.stringify(sendMessage))
    }
    if (this.options.timeout) {
      setTimeout(() => {
        this._message(new MessageEvent('message', { data: { ...sendMessage, status: 'error' } }))
      }, this.options.timeout)
    }
  }

  /**
   * Promise 化的emit
   * @param data IMessageBase
   * @returns Promise<IMessageResult>
   *
   * @example await nativeMessage.emitPromise({api: 'test'})
   */
  emitPromise(data: IMessageBase): Promise<IMessageResult> {
    return new Promise((resolve, reject) => {
      this.emit(data, (res) => {
        if (res.status !== 'error') {
          resolve(res)
        } else {
          reject(res)
        }
      })
    })
  }

}

export default NativeMessage

function loop() {
  return
}
