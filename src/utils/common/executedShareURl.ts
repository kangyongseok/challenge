import { Product } from '@dto/product';

import { checkAgent } from '@utils/common';

export function executedShareURl({
  title,
  text,
  url,
  product
}: {
  title: string;
  text: string;
  url: string;
  product?: Product;
}) {
  if (navigator.share) {
    navigator.share({ title, text, url });
    return true;
  }

  if (checkAgent.isAndroidApp() && window.AndroidShareHandler) {
    window.AndroidShareHandler.share(url);
    return true;
  }

  if (checkAgent.isAndroidApp() && window.webview && window.webview.callShareProduct) {
    window.webview.callShareProduct(url, JSON.stringify(product));
    return true;
  }

  if (
    checkAgent.isIOSApp() &&
    window.webkit &&
    window.webkit.messageHandlers &&
    window.webkit.messageHandlers.callShareProduct
  ) {
    window.webkit.messageHandlers.callShareProduct.postMessage(JSON.stringify({ url, product }));
    return true;
  }

  return false;
}
