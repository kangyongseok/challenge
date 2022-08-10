import type { HTMLAttributes, MouseEvent } from 'react';
import { forwardRef } from 'react';

import { CustomStyle, Typography, useTheme } from 'mrcamel-ui';

import { StyledTabs, Tab } from './Tabs.styles';

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  id?: string;
  value: string;
  changeValue: (e: MouseEvent<HTMLButtonElement>, newValue: string) => void;
  labels: { key: string; value: string }[];
  customStyle?: CustomStyle;
  customTabStyle?: CustomStyle;
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { value, changeValue, labels, customStyle, id, customTabStyle, ...props },
  ref
) {
  const {
    theme: { palette }
  } = useTheme();

  const handleClick =
    (selected: boolean, selectedValue: string) => (e: MouseEvent<HTMLButtonElement>) => {
      if (!selected) {
        changeValue(e, selectedValue);
      }
    };

  return (
    <StyledTabs
      ref={ref}
      id={id}
      css={customStyle}
      role="tablist"
      aria-label={`${id}-tabs`}
      {...props}
    >
      {labels.map((label) => {
        const selected = label.key === value;

        return (
          <Tab
            key={`tab-${label.key}`}
            id={`${id}-tab-${label.key}`}
            type="button"
            role="tab"
            tabIndex={selected ? 0 : -1}
            aria-controls={`${id}-tabpanel-${label.key}`}
            aria-selected={selected}
            selected={selected}
            onClick={handleClick(selected, label.key)}
            count={labels.length}
            css={customTabStyle}
          >
            <Typography
              variant="body1"
              weight={selected ? 'bold' : 'medium'}
              customStyle={{
                color: palette.common.grey[selected ? '20' : '60']
              }}
            >
              {label.value}
            </Typography>
          </Tab>
        );
      })}
    </StyledTabs>
  );
});

export default Tabs;
