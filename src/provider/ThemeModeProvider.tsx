import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';

import { useRecoilValue } from 'recoil';
import localFont from 'next/font/local';
import { ThemeProvider } from '@mrcamelhub/camel-ui';

import type { ThemeMode } from '@typings/common';
import { themeState } from '@recoil/common';

const font = localFont({
  src: [
    { path: '../styles/fonts/CamelProductSansVF.ttf', weight: '900' },
    { path: '../styles/fonts/CamelProductSansVF.ttf', weight: '700' },
    { path: '../styles/fonts/CamelProductSansVF.ttf', weight: '500' },
    { path: '../styles/fonts/CamelProductSansVF.ttf', weight: '400' },
    { path: '../styles/fonts/CamelProductSansVF.ttf', weight: '300' },
    { path: '../styles/fonts/CamelProductSansVF.ttf', weight: '100' }
  ]
});

function ThemeModeProvider({ children }: PropsWithChildren) {
  const theme = useRecoilValue(themeState);
  const [, setCurrentTheme] = useState<Exclude<ThemeMode, 'system'>>('light');

  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      setCurrentTheme(isDark ? 'dark' : 'light');
    } else {
      setCurrentTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    const handleChange = (event: MediaQueryListEvent) => {
      if (theme === 'system') {
        const isDark = event.matches;

        setCurrentTheme(isDark ? 'dark' : 'light');
      }
    };

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleChange);

    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleChange);
    };
  }, [theme]);

  return (
    <ThemeProvider
      theme="light"
      disableResetCSS={false}
      customResetStyle={{
        'html, body': {
          fontFamily: font.style.fontFamily
        }
      }}
    >
      {children}
    </ThemeProvider>
  );
}

export default ThemeModeProvider;
