import type { ChangeEvent } from 'react';

import { Checkbox, Flexbox, Typography } from 'mrcamel-ui';

interface CategoryProps {
  name: string;
  id: number;
  ids: number[];
  parent: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

function CategoryCheckbox({ onChange, name, id, ids, parent }: CategoryProps) {
  return (
    <Flexbox
      customStyle={{
        flex: '50%',
        alignItems: 'center',
        paddingTop: '10px',
        paddingBottom: '10px'
      }}
    >
      <Checkbox
        id={encodeURI(`${parent}-${name}`)}
        customStyle={{
          width: '20px',
          height: '20px',
          marginRight: '8px'
        }}
        brandColor="black"
        onChange={onChange}
        data-name={name}
        data-id={id}
        checked={ids.includes(id)}
      />
      <Typography
        customStyle={{
          fontSize: '14px',
          height: '20px'
        }}
      >
        <label htmlFor={encodeURI(`${parent}-${name}`)}>{name}</label>
      </Typography>
    </Flexbox>
  );
}

export default CategoryCheckbox;
