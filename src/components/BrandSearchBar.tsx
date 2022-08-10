import { FormEvent, useState } from 'react';

import { Box, Flexbox, Icon } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { TextInput } from '@components/UI/molecules';

function BrandSearchBar() {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <Box component="section" customStyle={{ minHeight: 56, zIndex: 1 }}>
      <SearchBarForm onSubmit={handleSubmit}>
        <TextInput
          variant="contained"
          placeholder="브랜드 검색"
          startAdornment={
            <Icon
              name="SearchOutlined"
              width={20}
              height={20}
              customStyle={{ display: 'flex', marginRight: 8 }}
            />
          }
          customStyle={{ padding: 8, height: 'inherit' }}
          value={keyword}
          onChange={(e) => setKeyword(e.currentTarget.value)}
        />
        <Flexbox>{}</Flexbox>
      </SearchBarForm>
    </Box>
  );
}

const SearchBarForm = styled.form`
  position: fixed;
  width: 100%;
  background-color: ${({ theme }) => theme.palette.common.white};
  padding: 20px 20px 0;

  input {
    font-size: ${({ theme: { typography } }) => typography.body1.size};
    font-weight: ${({ theme: { typography } }) => typography.body1.weight.regular};
    letter-spacing: ${({ theme: { typography } }) => typography.body1.letterSpacing};
    line-height: 20px;

    ::placeholder {
      color: ${({ theme: { palette } }) => palette.common.grey['80']};
    }
  }
`;

export default BrandSearchBar;
