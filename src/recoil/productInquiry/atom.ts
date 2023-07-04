import { atom } from 'recoil';

export const productInquiryFormState = atom({
  key: 'productInquiry/formState',
  default: {
    step: 0,
    userId: 0,
    phoneNumber: '',
    authNumber: '',
    content: ''
  }
});

export const productInquiryReSendState = atom({
  key: 'productInquiry/reSendState',
  default: {
    time: 180,
    date: '3:00'
  }
});

export const productInquiryFeedbackDialogState = atom({
  key: 'productInquiry/feedbackDialogState',
  default: {
    open: false,
    title: '',
    description: ''
  }
});
