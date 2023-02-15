export function removeTagAndAddNewLine(text: string) {
  /**
   * <br/> 태그가 있다면 \n으로 변경
   * 그외 다른 html 태그는 제거
   */
  try {
    return text.replace(/<\/?br[^>]*>/g, '\n').replace(/<\/?[a-zA-Z][^>]*>/g, '');
  } catch (_e) {
    return text;
  }
}
