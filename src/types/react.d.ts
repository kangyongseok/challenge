import type { Interpolation, Theme } from '@emotion/react';

declare module 'react' {
  interface Attributes {
    css?: Interpolation<Theme>;
  }
}
