export default function syncScrollTop(prevScrollTop: number) {
  return new Promise((resolve) => {
    const scrollTo = () =>
      setTimeout(() => {
        window.scrollTo(0, prevScrollTop);

        if (window.scrollY >= prevScrollTop) {
          clearTimeout(scrollTo());
          resolve(true);
        } else {
          scrollTo();
        }
      });

    scrollTo();
  });
}
