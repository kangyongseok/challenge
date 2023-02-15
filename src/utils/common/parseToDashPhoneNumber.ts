export const parseToDashPhoneNumber = (value: string) => {
  if (value) {
    return value.replace(/^(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  return value;
};
