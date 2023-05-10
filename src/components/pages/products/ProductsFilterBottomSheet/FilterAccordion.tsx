import { useEffect, useState } from 'react';
import type { MouseEvent, PropsWithChildren, ReactElement } from 'react';

import { Button, CustomStyle, Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { Gap } from '@components/UI/atoms';

interface FilterAccordionProps {
  title: string;
  subText?: string | number;
  startIcon?: ReactElement;
  expandIcon?: ReactElement;
  expand?: boolean;
  isActive?: boolean;
  checkedAll?: boolean;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  hideLine?: boolean;
  customStyle?: CustomStyle;
}

function FilterAccordion({
  children,
  title,
  subText,
  startIcon,
  expandIcon,
  expand = false,
  isActive,
  checkedAll,
  onClick,
  hideLine,
  customStyle
}: PropsWithChildren<FilterAccordionProps>) {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();
  const [newExpand, setNewExpand] = useState(false);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (
      onClick &&
      typeof onClick === 'function' &&
      ((!isActive && !newExpand) || !children || (checkedAll && newExpand))
    ) {
      onClick(e);
    }
    setNewExpand(!newExpand);
  };

  useEffect(() => setNewExpand(expand), [expand]);

  return (
    <>
      <Flexbox direction="vertical" justifyContent="center" customStyle={customStyle}>
        <Flexbox
          alignment="center"
          justifyContent="space-between"
          onClick={handleClick}
          customStyle={{
            paddingTop: 8,
            '& > svg': {
              color: isActive ? primary.light : undefined
            }
          }}
        >
          <Button
            variant="inline"
            size="large"
            brandColor={isActive ? 'primary' : 'black'}
            startIcon={startIcon}
            endIcon={
              <Typography
                variant="h4"
                customStyle={{
                  color: common.ui80
                }}
              >
                {subText}
              </Typography>
            }
            customStyle={{
              paddingLeft: 0,
              paddingRight: 0,
              fontWeight: isActive ? 500 : 400
            }}
          >
            {title}
          </Button>
          {expandIcon && expandIcon}
        </Flexbox>
        {newExpand && children}
      </Flexbox>
      {!hideLine && (
        <Gap height={1} customStyle={{ marginTop: 9, backgroundColor: common.line01 }} />
      )}
    </>
  );
}

export default FilterAccordion;
