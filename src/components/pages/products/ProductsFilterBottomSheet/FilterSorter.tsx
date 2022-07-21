import type { HTMLAttributes, MouseEvent } from 'react';

import type { CustomStyle } from 'mrcamel-ui';
import styled, { CSSObject } from '@emotion/styled';

interface FilterSorterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick' | 'onChange'> {
  options: {
    name: string;
    value: string;
  }[];
  value: string;
  onChange: (value: string) => void;
  customStyle?: CustomStyle;
}

function FilterSorter({ options, value, onChange, customStyle, ...props }: FilterSorterProps) {
  const handleClick = (event: MouseEvent<HTMLSpanElement>) => {
    const dataValue = event.currentTarget.getAttribute('data-value');

    if (dataValue) onChange(dataValue);
  };

  return (
    <StyledFilterSorter css={customStyle} {...props}>
      {options.map((option) => (
        <SorterItem
          key={`sorter-option-${option.value}`}
          isActive={option.value === value}
          data-value={option.value}
          onClick={handleClick}
        >
          {option.name}
        </SorterItem>
      ))}
    </StyledFilterSorter>
  );
}

const StyledFilterSorter = styled.div`
  & > span:after {
    content: '';
    display: inline-block;
    width: 1px;
    height: 10px;
    margin: 0 8px;
    vertical-align: middle;
    background-color: ${({ theme: { palette } }) => palette.common.grey['80']};
  }
  & > span:last-child:after {
    display: none;
  }
`;

const SorterItem = styled.span<{
  isActive?: boolean;
}>`
  cursor: pointer;

  ${({
    theme: {
      palette: { common },
      typography: {
        body2: { size, weight, lineHeight, letterSpacing }
      }
    },
    isActive
  }): CSSObject => ({
    fontSize: size,
    fontWeight: isActive ? weight.bold : weight.medium,
    lineHeight,
    letterSpacing,
    color: isActive ? common.grey['20'] : common.grey['80']
  })};
`;

export default FilterSorter;
