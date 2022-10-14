import type { ChangeEvent } from 'react';

import { Flexbox, Icon, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

interface MyPortfolioCheckboxLabelProps {
  label: string;
  value: string;
}

function MyPortfolioCheckboxLabel({
  data,
  onChange
}: {
  data: MyPortfolioCheckboxLabelProps[];
  onChange: (parameter: string) => void;
}) {
  const handleChecked = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    if (target.dataset) {
      onChange(target.dataset.value as string);
    }
  };
  return (
    <Flexbox gap={20} direction="vertical">
      {data.map(({ label, value }) => (
        <Flexbox key={`check-box-${value}`} gap={9} alignment="center">
          <Checkbox
            type="checkbox"
            id={value}
            name={value}
            onChange={handleChecked}
            data-value={value}
          />
          <CheckBoxView htmlFor={value}>
            <Icon name="CheckOutlined" size="small" />
          </CheckBoxView>
          <Label htmlFor={value}>
            <Typography>{label}</Typography>
          </Label>
        </Flexbox>
      ))}
    </Flexbox>
  );
}

const Checkbox = styled.input`
  display: none;
  &:checked + label {
    background: ${({
      theme: {
        palette: { primary }
      }
    }) => primary.main};
    border: none;
  }
`;
const CheckBoxView = styled.label`
  border-radius: 4px;
  width: 16px;
  height: 16px;
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui60};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 3px;
  svg {
    color: white;
  }
`;
const Label = styled.label``;

export default MyPortfolioCheckboxLabel;
