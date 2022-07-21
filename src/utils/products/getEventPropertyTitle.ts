import { filterCodeIds } from '@constants/productsFilter';

export default function getEventPropertyTitle(codeId: number) {
  if (codeId === filterCodeIds.category) {
    return 'CATEGORY';
  }
  if (codeId === filterCodeIds.brand) {
    return 'BRAND';
  }
  if (codeId === filterCodeIds.size) {
    return 'SIZE';
  }
  if (codeId === filterCodeIds.platform) {
    return 'SITE';
  }
  if (codeId === filterCodeIds.line) {
    return 'LINE';
  }
  if (codeId === filterCodeIds.season) {
    return 'SEASON';
  }
  if (codeId === filterCodeIds.color) {
    return 'COLOR+MATERIAL';
  }
  if (codeId === filterCodeIds.price) {
    return 'PRICE';
  }
  if (codeId === filterCodeIds.detailOption) {
    return 'COLOR+MATERIAL';
  }
  return 'EMPTY';
}
