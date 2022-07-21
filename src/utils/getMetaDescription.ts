export default function getMetaDescription(description: string) {
  let byte = 0;
  let result = '';
  let overflow = false;

  for (let i = 0; i < description.length; i += 1) {
    if (byte > 92) {
      overflow = true;
      break;
    }

    if (description.charCodeAt(i) > 127) {
      byte += 2;
    } else {
      byte += 1;
    }

    result += description[i];
  }

  if (!result) result = description;

  return result.replace(/[\n|\r]/g, ' ') + (overflow ? '...' : '');
}
