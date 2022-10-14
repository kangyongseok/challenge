import type { InputHTMLAttributes } from 'react';

import { Box, Icon } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { TextInput } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

type BrandSearchBarProps = InputHTMLAttributes<HTMLInputElement>;

function BrandSearchBar({ value, onChange }: BrandSearchBarProps) {
  return (
    <Box
      component="section"
      customStyle={{ minHeight: 56, zIndex: 1 }}
      onClick={() =>
        logEvent(attrKeys.brand.CLICK_BRAND_SEARCH, { name: attrProperty.productName.BRAND_LIST })
      }
    >
      <SearchBarBox>
        <TextInput
          autoCapitalize="none"
          autoComplete="off"
          spellCheck="false"
          type="search"
          variant="contained"
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

const SearchBarBox = styled.div`
  position: fixed;
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
