import { memo, useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilValue } from 'recoil';
import { Chip, Flexbox } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';

import scrollCenterIndex from '@utils/brands/scrollCenterIndex';

import { showAppDownloadBannerState } from '@recoil/common';

interface BrandIndexProps {
  langList: string[];
  currentTitle: string;
  onClick: (parameter: string) => void;
  setIndexRefs: (parameter: HTMLButtonElement[]) => void;
  setIndexAreaRef: (parameter: HTMLDivElement) => void;
}

function BrandIndex({
  langList,
  currentTitle,
  onClick,
  setIndexRefs,
  setIndexAreaRef
}: BrandIndexProps) {
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const indexRef = useRef<HTMLButtonElement[]>([]);
  const indexAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIndexRefs(indexRef.current);
    setIndexAreaRef(indexAreaRef.current as HTMLDivElement);
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [currentTitle]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const el = indexAreaRef.current as HTMLDivElement;
    scrollCenterIndex(el, e.currentTarget);
    onClick(e.currentTarget.dataset.word || '');
  };

  return (
    <StyledFlexIndex
      direction="vertical"
      ref={indexAreaRef}
      showAppDownloadBanner={showAppDownloadBanner}
    >
      {langList.map((word, i) => (
        <IndexButton
          isSameWord={currentTitle === word}
          data-active={currentTitle === word}
          data-word={word}
          key={word}
          variant="outlined"
          onClick={handleClick}
          ref={(ref) => {
            if (ref) {
              indexRef.current[i] = ref;
            }
          }}
        >
          {word}
        </IndexButton>
      ))}
    </StyledFlexIndex>
  );
}

const StyledFlexIndex = styled(Flexbox)<{ showAppDownloadBanner: boolean }>`
  position: fixed;
  right: 20px;
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? 215 + APP_DOWNLOAD_BANNER_HEIGHT : 215}px;
  height: calc(
    100% -
      ${({ showAppDownloadBanner }) =>
        showAppDownloadBanner ? 300 + APP_DOWNLOAD_BANNER_HEIGHT : 300}px
  );
  overflow: auto;
  scroll-behavior: smooth;
`;

const IndexButton = styled(Chip)<{ isSameWord: boolean }>`
  width: 28px;
  min-height: 30px;
  margin-bottom: 6px;
  border-radius: 4px;
  background: ${({ isSameWord, theme: { palette } }) =>
    isSameWord ? palette.common.grey['20'] : palette.common.white};
  color: ${({ isSameWord, theme: { palette } }) =>
    isSameWord ? palette.common.white : palette.common.grey['20']};
  font-size: ${({ theme: { typography } }) => typography.small1.size};
  font-weight: ${({ theme: { typography } }) => typography.small1.weight.medium};
`;

const compareCurrentTitle = (prevProps: BrandIndexProps, nextProps: BrandIndexProps) => {
  if (!prevProps.langList.length) {
    return false;
  }
  return prevProps.currentTitle === nextProps.currentTitle;
};

export default memo(BrandIndex, compareCurrentTitle);
