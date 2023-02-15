export async function urlToBlob(url: string): Promise<Blob | undefined> {
  let blob;

  try {
    const data = await fetch(url);
    blob = await data.blob();

    return blob;
  } catch {
    //
  }

  return blob;
}
