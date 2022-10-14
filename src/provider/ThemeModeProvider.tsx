import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { ThemeProvider } from 'mrcamel-ui';

import type { ThemeMode } from '@typings/common';
import { themeState } from '@recoil/common';

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
    <ThemeProvider theme="light" disableResetCSS={false}>
      {children}
    </ThemeProvider>
  );
}

export default ThemeModeProvider;
