/* eslint-disable no-console,@typescript-eslint/ban-ts-comment */
import SockJS from 'sockjs-client';
import { messageCallbackType } from '@stomp/stompjs/src/types';
import * as StompJS from '@stomp/stompjs';

import { isProduction, wait } from '@utils/common';

let stompClient: StompJS.Client;

const StompJs = {
  getInstance() {
    return stompClient;
  },
  initialize(channelId: number) {
    stompClient = new StompJS.Client({
      webSocketFactory: () => new SockJS(`${process.env.SOCKET_SERVER_URL}/channels/${channelId}`),
      // debug(str) {
      //   if (!isProduction) console.log('StompJs debug::', str);
      // },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect() {
        if (!isProduction) console.log('StompJs initialized');
      },
      onStompError(frame) {
        console.error('StompJs error', frame);
      }
    });

    stompClient.activate();
  },
  // @ts-ignore
  // eslint-disable-next-line consistent-return
  async subScribeChannel({
    channelId,
    callback,
    retry = 0
  }: {
    channelId: number;
    callback: messageCallbackType;
    retry?: number;
  }) {
    try {
      stompClient.subscribe(`/topic/channels/${channelId}`, callback);
    } catch (e) {
      // eslint-disable-next-line no-param-reassign,no-plusplus
      retry++;

      if (retry < 3 && !stompClient.connected) {
        await wait(1000);
        // eslint-disable-next-line no-return-await
        return await this.subScribeChannel({
          channelId,
          callback,
          retry
        });
      }
    }
  },
  finalize() {
    stompClient?.deactivate().then(() => {
      if (!isProduction) console.log('StompJs finalized');
    });
  }
  // 추후 필요시 사용
  // publish(body: string) {
  //   if (!stompClient?.connected) return;
  //
  //   stompClient.publish({ destination: '', body });
  // }
};

export default StompJs;
