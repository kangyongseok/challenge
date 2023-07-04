const PHONE_NUMBER = /^(01(0|1|[6-9])(\d{4})(\d{4}))|(01(0|1|[6-9])-(\d{4})-(\d{4}))$/;

export default {
  phoneNumber: (value: string) => PHONE_NUMBER.exec(value)
};
