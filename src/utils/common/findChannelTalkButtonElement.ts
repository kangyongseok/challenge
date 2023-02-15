export function findChannelTalkButtonElement(): Promise<HTMLDivElement> {
  return new Promise((resolve, reject) => {
    let findTryCount = 0;

    const find = () =>
      setTimeout(() => {
        findTryCount += 1;

        if (findTryCount >= 100) {
          clearTimeout(find());
          reject();
        }

        const core = document.getElementById('ch-plugin-core');

        if (core) {
          const buttonElement: HTMLDivElement | null = core.querySelector('div');

          if (buttonElement) {
            clearTimeout(find());
            resolve(buttonElement);
          } else {
            find();
          }
        } else {
          find();
        }
      }, 300);

    find();
  });
}
