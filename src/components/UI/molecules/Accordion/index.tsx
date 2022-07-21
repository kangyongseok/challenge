import type { HTMLAttributes, MouseEvent, PropsWithChildren, ReactElement } from 'react';

import type { ColorKey } from 'mrcamel-ui/dist/types';
import type { CustomStyle, TypographyVariant, Variant } from 'mrcamel-ui';
import { Chip, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';

import { Details, StyledAccordion, Summary } from './Accordion.styles';

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  variant?: Extract<Variant, 'outlined' | 'contained'>;
  summary: string;
  summaryVariant?: TypographyVariant;
  button?: string;
  customButton?: ReactElement;
  onClickButton?: (e: MouseEvent<HTMLButtonElement>) => void;
  expanded: boolean;
  changeExpandedStatus: (e: MouseEvent<HTMLDivElement>, isExpanded: boolean) => void;
  showExpandIcon?: boolean;
  expandIcon?: ReactElement;
  expandIconGreyColorKey?: Extract<ColorKey, '20' | '60'>;
  customStyle?: CustomStyle;
}

function Accordion({
  variant = 'contained',
  summary,
  expanded,
  changeExpandedStatus,
  showExpandIcon = true,
  expandIcon,
  expandIconGreyColorKey = '60',
  summaryVariant = 'h3',
  button,
  customButton,
  onClickButton,
  customStyle,
  children,
  ...props
}: PropsWithChildren<AccordionProps>) {
  const {
    theme: { palette }
  } = useTheme();

  const handleClick = (isExpanded: boolean) => (e: MouseEvent<HTMLDivElement>) => {
    changeExpandedStatus(e, isExpanded);
  };

  return (
    <StyledAccordion css={customStyle} {...props}>
      <Summary variant={variant} onClick={handleClick(expanded)}>
        <Flexbox alignment="center">
          <Typography
            variant={summaryVariant}
            weight="medium"
            customStyle={{
              marginRight: button ? 12 : 0
            }}
          >
            {summary}
          </Typography>
          {button && (
            <Chip
              variant={variant === 'contained' ? 'outlined' : 'ghost'}
              size="xsmall"
              brandColor="black"
              onClick={onClickButton}
            >
              <Typography variant="small2" weight="medium">
                {button}
              </Typography>
            </Chip>
          )}
          {customButton}
        </Flexbox>
        {showExpandIcon && !expandIcon && (
          <Icon
            name={expanded ? 'CaretUpOutlined' : 'CaretDownOutlined'}
            color={palette.common.grey[expandIconGreyColorKey]}
            size="small"
            customStyle={{
              transitionProperty: 'all',
              transitionDuration: '0.2s',
              transitionTimingFunction: 'cubic-bezier(.4,0,.2,1)'
            }}
          />
        )}
        {showExpandIcon && expandIcon && expandIcon}
      </Summary>
      <Details expanded={expanded}>{children}</Details>
    </StyledAccordion>
  );
}

export default Accordion;
