import { atom } from 'recoil';

const reviewBlockState = atom({
  key: 'reviewBlock',
  default: false
});

export default {
  reviewBlockState
};
