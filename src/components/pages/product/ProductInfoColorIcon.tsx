import { Avatar, Flexbox } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { filterColors, filterImageColorNames } from '@constants/productsFilter';

function ProductInfoColorIcon({
  colorData
}: {
  colorData?: { id: number; name: string; description: string }[];
}) {
  return (
    <Flexbox alignment="center" gap={8}>
      {!!colorData &&
        colorData.map((list) => (
          <Flexbox alignment="center" gap={4} key={`color-list-${list.id}`}>
            {list.name}
            {!filterImageColorNames.includes(list.description || '') && (
              <ColorSample
                colorCode={filterColors[list.description as keyof typeof filterColors]}
              />
            )}
            {colorData && filterImageColorNames.includes(list.description || '') && (
              <Avatar
                width={14}
                height={14}
                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/ico/colors/${list.description}.png`}
                alt="Color Img"
                round="50%"
              />
            )}
          </Flexbox>
        ))}
    </Flexbox>
  );
}

const ColorSample = styled.div<{ colorCode: string }>`
  background: ${({ colorCode }) => colorCode};
  width: 14px;
  height: 14px;
  border-radius: 50%;
`;

export default ProductInfoColorIcon;
