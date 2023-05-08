import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';

import { useRecoilValue } from 'recoil';
import localFont from 'next/font/local';
import { ThemeProvider } from 'mrcamel-ui';

import type { ThemeMode } from '@typings/common';
import { themeState } from '@recoil/common';

const font = localFont({
  src: [
    { path: '../styles/fonts/CamelProductSansVF.woff2', weight: '900' },
    { path: '../styles/fonts/CamelProductSansVF.woff2', weight: '700' },
    { path: '../styles/fonts/CamelProductSansVF.woff2', weight: '500' },
    { path: '../styles/fonts/CamelProductSansVF.woff2', weight: '400' },
    { path: '../styles/fonts/CamelProductSansVF.woff2', weight: '300' },
    { path: '../styles/fonts/CamelProductSansVF.woff2', weight: '100' }
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
