import React from 'react';
import { useTheme, Box, Flexbox, Icon, Label, Typography } from 'mrcamel-ui';

import { SearchBar } from '@components/UI/molecules';

function MainWelcome() {
  const {
    theme: { palette, typography }
  } = useTheme();

  return (
    <Box
      component="section"
      customStyle={{
        margin: '0 -20px',
        padding: 20,
        backgroundColor: palette.primary.main
      }}
    >
      <Flexbox direction="horizontal" justifyContent="space-between">
        <Icon name="LogoText_96_20" color={palette.common.white} />
        <Icon name="AlarmOutlined" size="large" color={palette.common.white} />
      </Flexbox>
      <Typography
        variant="h3"
        weight="regular"
        customColor={palette.common.white}
        customStyle={{ marginTop: 34 }}
      >
        김카멜님 👋
      </Typography>
      <Typography variant="h3" weight="bold" customColor={palette.common.white}>
        대한민국 모든 중고명품 한방에 검색하세요
      </Typography>
      <SearchBar
        fullWidth
        startIcon={<Icon name="SearchOutlined" color="primary" />}
        placeholder="샤넬 클미, 나이키 범고래, 스톤 맨투맨"
        customStyle={{
          marginTop: 8
        }}
      />
      <Typography
        weight="medium"
        customColor={palette.common.white}
        customStyle={{ marginTop: 16 }}
      >
        최근 검색어
      </Typography>
      <Flexbox
        gap={6}
        customStyle={{
          margin: '8px -20px 0 -20px',
          padding: '0 20px',
          overflowX: 'auto',
          flexWrap: 'nowrap',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }}
      >
        {Array.from({ length: 10 }).map((_, index) => (
          <Label
            // eslint-disable-next-line react/no-array-index-key
            key={`label-${index}`}
            variant="contained"
            text="샤넬 클래식 미디움"
            customColor="rgba(255, 255, 255, 0.4)"
            round="16"
            customStyle={{
              height: 30,
              fontSize: typography.body2.size,
              fontWeight: typography.body2.weight.medium,
              lineHeight: typography.body2.lineHeight,
              letterSpacing: typography.body2.letterSpacing,
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          />
        ))}
      </Flexbox>
    </Box>
  );
}

export default MainWelcome;
