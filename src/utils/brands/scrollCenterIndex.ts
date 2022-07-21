const scrollCenterIndex = (scrollAreaEl: HTMLDivElement, target: HTMLButtonElement) => {
  let position = 0;
  const el = scrollAreaEl;
  const listHeight = el.scrollHeight;
  const halfHeight = el.clientHeight / 2;
  const targetTop = target.offsetTop;
  const selectTargetPos = targetTop + 30 / 2;
  if (selectTargetPos <= halfHeight) {
    position = 0;
  } else if (listHeight - selectTargetPos <= halfHeight) {
    position = listHeight - el.clientHeight;
  } else {
    position = selectTargetPos - halfHeight;
  }
  el.scrollTo(0, position);
};

export default scrollCenterIndex;
