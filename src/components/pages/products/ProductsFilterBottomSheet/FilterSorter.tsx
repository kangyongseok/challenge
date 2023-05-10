import type { HTMLAttributes, MouseEvent } from 'react';

import type { CustomStyle } from '@mrcamelhub/camel-ui';
import { Button, Flexbox } from '@mrcamelhub/camel-ui';

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
    <Flexbox gap={12} {...props} customStyle={customStyle}>
      {options.map((option) => (
        <Button
          key={`sorter-option-${option.value}`}
          variant="inline"
          brandColor={option.value === value ? 'blue' : 'gray'}
          data-value={option.value}
          onClick={handleClick}
          customStyle={{
            paddingLeft: 0,
            paddingRight: 0
          }}
        >
          {option.name}
        </Button>
      ))}
    </Flexbox>
  );
}

export default FilterSorter;
