import { memo } from 'react';
import type { MouseEvent } from 'react';

import { Button, Flexbox, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

const langData = [
  { key: 'ko', value: 'ㄱ-ㅎ' },
  { key: 'en', value: 'A-Z' }
];

interface BrandSwitchLangProps {
  lang: string;
  onClick: (parameter: string) => void;
}

function BrandSwitchLang({ lang, onClick }: BrandSwitchLangProps) {
  const {
    theme: { palette }
  } = useTheme();

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick(e.currentTarget.dataset.lang as string);
  };

  return (
    <Flexbox
      gap={16}
      alignment="center"
      customStyle={{
        borderBottom: `1px solid ${palette.common.grey['90']}`,
        paddingBottom: 16
      }}
    >
      {langData.map((data) => (
        <SwitchLangBtn
          key={data.key}
          variant="contained"
          data-lang={data.key}
          onClick={handleClick}
          active={lang === data.key}
        >
          {data.value}
        </SwitchLangBtn>
      ))}
    </Flexbox>
  );
}

const SwitchLangBtn = styled(Button)<{ active: boolean }>`
  font-size: ${({ theme: { typography } }) => typography.h3.size};
  border: none;
  color: ${({ active, theme: { palette } }) =>
    active ? palette.common.grey['20'] : palette.common.grey['80']};
  padding: 0;
  background: none;
  font-weight: ${({ theme: { typography } }) => typography.h3.weight.bold};
`;

const compareLang = (prevProps: BrandSwitchLangProps, nextProps: BrandSwitchLangProps) => {
  if (!prevProps.lang) {
    return false;
  }
  return prevProps.lang === nextProps.lang;
};

export default memo(BrandSwitchLang, compareLang);
