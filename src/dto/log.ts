export interface Logs {
  type: 'SEND_MESSAGE' | 'PURCHASE';
  conversionId: number;
  target: string;
  source: string;
  deviceId: number;
}
