import type { HTMLAttributes, MouseEvent } from 'react';
import { forwardRef } from 'react';

import type { BrandColor, CustomStyle } from 'mrcamel-ui';

import { BadgeText, StyledTabs, Tab } from './Tabs.styles';

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  id?: string;
  value: string;
  changeValue: (e: MouseEvent<HTMLButtonElement> | null, newValue: string) => void;
  labels: { key: string; value: string; badge?: boolean }[];
  brandColor?: Extract<BrandColor, 'primary' | 'black'>;
  customStyle?: CustomStyle;
  customTabStyle?: CustomStyle;
  isNew?: boolean;
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { value, changeValue, labels, brandColor, customStyle, id, customTabStyle, isNew, ...props },
  ref
) {
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
            <BadgeText
              variant="h4"
              weight={selected ? 'bold' : 'medium'}
              selected={selected}
              badge={isNew && label.badge}
            >
              {label.value}
            </BadgeText>
          </Tab>
        );
      })}
    </StyledTabs>
  );
});

export default Tabs;
