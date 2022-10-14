import type { MouseEvent } from 'react';

import { useRecoilState } from 'recoil';
import { Flexbox, Radio, Typography, useTheme } from 'mrcamel-ui';

import { BottomNavigation, Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import type { ThemeMode } from '@typings/common';
import { themeState } from '@recoil/common';

function SettingTheme() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [theme, setTheme] = useRecoilState(themeState);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const newTheme = e.currentTarget.getAttribute('data-theme') as ThemeMode;

    setTheme(newTheme);
  };

  return (
    <GeneralTemplate
      header={
        <Header showRight={false} rightIconCustomStyle={{ minWidth: 56 }}>
          <Typography variant="h3" weight="bold">
            화면 테마
          </Typography>
        </Header>
      }
      footer={<BottomNavigation />}
    >
      <Flexbox
        alignment="center"
        justifyContent="space-between"
        onClick={handleClick}
        data-theme="system"
        customStyle={{ padding: '20px 0', borderBottom: `1px solid ${common.line01}` }}
      >
        <Flexbox direction="vertical" gap={4}>
          <Typography variant="h3" weight="medium">
            시스템 설정
          </Typography>
          <Typography variant="body2">
            시스템 설정 따라
            <br />
            라이트/다크 모드로 자동 전환됩니다.
          </Typography>
        </Flexbox>
        <Radio checked={theme === 'system'} />
      </Flexbox>
      <Flexbox
        alignment="center"
        justifyContent="space-between"
        onClick={handleClick}
        data-theme="light"
        customStyle={{ padding: '20px 0', borderBottom: `1px solid ${common.line01}` }}
      >
        <Flexbox direction="vertical" gap={4}>
          <Typography variant="h3" weight="medium">
            라이트 모드
          </Typography>
        </Flexbox>
        <Radio checked={theme === 'light'} />
      </Flexbox>
      <Flexbox
        alignment="center"
        justifyContent="space-between"
        onClick={handleClick}
        data-theme="dark"
        customStyle={{ padding: '20px 0', borderBottom: `1px solid ${common.line01}` }}
      >
        <Flexbox direction="vertical" gap={4}>
          <Typography variant="h3" weight="medium">
            다크 모드
          </Typography>
        </Flexbox>
        <Radio checked={theme === 'dark'} />
      </Flexbox>
    </GeneralTemplate>
  );
}

export default SettingTheme;
