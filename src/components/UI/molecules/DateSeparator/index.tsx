import type { ReactElement } from 'react';

import type { CustomStyle } from '@mrcamelhub/camel-ui';

import { Date, Line, Separator, Text } from './DateSeparator.styles';

export interface DateSeparatorProps {
  children: string | ReactElement;
  className?: string;
  showLine?: boolean;
  customStyle?: CustomStyle;
}
function DateSeparator({ children, className, showLine = false, customStyle }: DateSeparatorProps) {
  return (
    <Separator className={className} css={customStyle}>
      <Line showLine={showLine} />
      <Text>
        {typeof children === 'string' ? (
          <Date variant="body2" weight="medium">
            {children}
          </Date>
        ) : (
          children
        )}
      </Text>
      <Line showLine={showLine} />
    </Separator>
  );
}

export default DateSeparator;
