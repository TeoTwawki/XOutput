import { DebugRequest, MessageBase, PongResponse } from '@xoutput/api';

export class WebSocketService {
  connect(path: string, onMessage: (data: MessageBase) => void): Promise<WSSession> {
    return new Promise((resolve, reject) => {
      const url = `ws://${location.host}/websocket/${path}`;
      const websocket = new WebSocket(url);
      let session: WebSocketSessionImpl;
      let pingInterval: number;
      websocket.onopen = () => {
        session = new WebSocketSessionImpl(websocket);
        this.onOpen();
        pingInterval = setInterval(() => {
          session.sendMessage({
            type: 'Ping',
            timestamp: new Date().getTime(),
          });
        }, 5000);
        resolve(session);
      };
      websocket.onerror = (event) => {
        this.onError(event);
        if (!session) {
          reject(event);
        }
      };
      websocket.onclose = (event) => {
        this.onClose(pingInterval);
        if (!session) {
          reject(event);
        }
      };
      websocket.onmessage = (event: MessageEvent) => {
        const data: MessageBase = JSON.parse(event.data);
        if (!this.onMessage(session, data)) {
          onMessage(data);
        }
      };
    });
  }
  private onOpen(): void {
    console.info('Connected websocket to host');
  }
  private onError(event: Event): void {
    const message: string = (event as { message?: string }).message;
    console.error(message);
  }
  private onClose(interval: number): void {
    console.info('Disconnected websocket from host');
    if (interval) {
      clearInterval(interval);
    }
  }
  private onMessage(session: WebSocketSessionImpl, data: MessageBase): boolean {
    if (data.type === 'Debug') {
      console.debug((data as DebugRequest).data);
      return true;
    } else if (data.type === 'Ping') {
      session.sendMessage({
        type: 'Pong',
        timestamp: new Date().getTime(),
      });
      return true;
    } else if (data.type === 'Pong') {
      console.debug(`Delay is ${new Date().getTime() - (data as PongResponse).timestamp} ms`);
      return true;
    }
    return false;
  }
}

export interface WSSession {
  close(): void;
  isReady(): boolean;
  sendMessage<T extends MessageBase>(obj: T): void;
  sendDebug(text: string): void;
}

class WebSocketSessionImpl implements WSSession {
  constructor(private websocket: WebSocket) {}
  close(): void {
    this.websocket.close();
  }
  isReady(): boolean {
    return this.websocket && this.websocket.readyState === WebSocket.OPEN;
  }
  sendMessage<T extends MessageBase>(obj: T): void {
    this.websocket.send(JSON.stringify(obj));
  }
  sendDebug(text: string): void {
    this.sendMessage({
      type: 'Debug',
      data: text,
    });
  }
}

export type WebSocketSession<T extends object = {}> = WSSession & T;

export const websocket = new WebSocketService();
