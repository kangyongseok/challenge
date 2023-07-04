import { atom } from 'recoil';

export const nonMemberCertificationFormState = atom({
  key: 'nonMemberCertification/formState',
  default: {
    step: 0,
    userId: 0,
    phoneNumber: '',
    authNumber: ''
  }
});

export const nonMemberCertificationReSendState = atom({
  key: 'nonMemberCertification/reSendState',
  default: {
    time: 180,
    date: '3:00'
  }
});

export const nonMemberCertificationFeedbackDialogState = atom({
  key: 'nonMemberCertification/feedbackDialogState',
  default: {
    open: false,
    title: '',
    description: ''
  }
});
