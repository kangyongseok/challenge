export function copyToClipboard(text: string) {
  if (!text) return false;

  if (navigator.clipboard) {
    // eslint-disable-next-line func-names
    navigator.clipboard.writeText(text).catch(function (err) {
      throw err !== undefined
        ? err
        : new DOMException('The request is not allowed', 'NotAllowedError');
    });
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'absolute';
  textArea.style.left = '-1000px';
  textArea.style.top = '-1000px';

  document.body.appendChild(textArea);
  textArea.select();
  textArea.setSelectionRange(0, 9999);

  const success = window.document.execCommand('copy');

  window.document.body.removeChild(textArea);

  return success;
}
