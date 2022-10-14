import type { HTMLAttributes, MouseEvent } from 'react';
import { forwardRef } from 'react';

import { Typography, useTheme } from 'mrcamel-ui';
import type { BrandColor, CustomStyle } from 'mrcamel-ui';

import { StyledTabs, Tab } from './Tabs.styles';

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  id?: string;
  value: string;
  changeValue: (e: MouseEvent<HTMLButtonElement> | null, newValue: string) => void;
  labels: { key: string; value: string }[];
  brandColor?: Extract<BrandColor, 'primary' | 'black'>;
  customStyle?: CustomStyle;
  customTabStyle?: CustomStyle;
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { value, changeValue, labels, brandColor, customStyle, id, customTabStyle, ...props },
  ref
) {
  const {
    theme: {
      palette: { common }
    }
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
            brandColor={brandColor}
            css={customTabStyle}
          >
            <Typography
              variant="body1"
              weight={selected ? 'bold' : 'medium'}
              customStyle={{
                color: selected ? common.ui20 : common.ui60
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
