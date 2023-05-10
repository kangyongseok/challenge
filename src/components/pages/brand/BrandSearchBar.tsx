import type { InputHTMLAttributes } from 'react';

import { useRecoilValue } from 'recoil';
import { Box, Icon } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { TextInput } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { APP_DOWNLOAD_BANNER_HEIGHT, HEADER_HEIGHT, IOS_SAFE_AREA_TOP } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import { showAppDownloadBannerState } from '@recoil/common';

type BrandSearchBarProps = InputHTMLAttributes<HTMLInputElement>;

function BrandSearchBar({ value, onChange }: BrandSearchBarProps) {
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  return (
    <Box
      component="section"
      customStyle={{ minHeight: 56, zIndex: 1 }}
      onClick={() =>
        logEvent(attrKeys.brand.CLICK_BRAND_SEARCH, { name: attrProperty.productName.BRAND_LIST })
      }
    >
      <SearchBarBox
        appDownloadBannerHeight={showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0}
      >
        <TextInput
          autoCapitalize="none"
          autoComplete="off"
          spellCheck="false"
          type="search"
          variant="solid"
          placeholder="브랜드 검색"
          startAdornment={
            <Icon name="SearchOutlined" width={20} height={20} customStyle={{ marginRight: 8 }} />
          }
          customStyle={{ padding: 8, height: 'inherit' }}
          inputStyle={{ height: 20 }}
          value={value}
          onChange={onChange}
        />
      </SearchBarBox>
    </Box>
  );
}

const SearchBarBox = styled.div<{ appDownloadBannerHeight: number }>`
  position: fixed;
  top: calc(
    ${({ appDownloadBannerHeight }) => appDownloadBannerHeight + HEADER_HEIGHT}px +
      ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'}
  );
  width: 100%;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  padding: 20px 20px 0;

  input {
    width: 100%;
    font-size: ${({ theme: { typography } }) => typography.body1.size};
    font-weight: ${({ theme: { typography } }) => typography.body1.weight.regular};
    letter-spacing: ${({ theme: { typography } }) => typography.body1.letterSpacing};
    line-height: 20px;

    ::placeholder {
      color: ${({
        theme: {
          palette: { common }
        }
      }) => common.ui80};
    }
  }
`;

export default BrandSearchBar;
