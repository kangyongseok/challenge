export async function heicToBlob(url: string, name: string): Promise<string | undefined> {
  let imageUrl = url;

  if (typeof window !== 'undefined') {
    try {
      // eslint-disable-next-line global-require
      const heic2any = require('heic2any');
      const data = await fetch(url);
      const blob = await data.blob();
      const resultBlob = await heic2any({ blob, toType: 'image/jpeg' });
      const file = new File([resultBlob as Blob], `${name.split('.')[0]}.jpg`, {
        type: 'image/jpeg',
        lastModified: new Date().getTime()
      });

      imageUrl = window.URL.createObjectURL(file);
    } catch (e) {
      throw new Error(String(e));
      //
    }
  }

  return imageUrl;
}
