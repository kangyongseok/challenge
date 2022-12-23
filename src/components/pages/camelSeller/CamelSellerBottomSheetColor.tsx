import { useEffect } from 'react';
import type { MouseEvent } from 'react';

import { useQuery } from 'react-query';
import { Avatar, Box, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { fetchCommonCodeDetails } from '@api/common';

import queryKeys from '@constants/queryKeys';
import { filterColors, filterImageColorNames } from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

interface BottomSheetColorProps {
  onClick: (parameter: { id: number; name: string }) => void;
}

function CamelSellerBottomSheetColor({ onClick }: BottomSheetColorProps) {
  const { data: codeDetails } = useQuery(queryKeys.commons.codeDetails(3), () =>
    fetchCommonCodeDetails({
      codeId: 3
    })
  );

  useEffect(() => {
    logEvent(attrKeys.camelSeller.VIEW_PRODUCT_MODAL, {
      name: attrProperty.name.PRODUCT_OPTIONS,
      title: attrProperty.title.COLOR
    });
  }, []);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_MODAL, {
      name: attrProperty.name.PRODUCT_OPTIONS,
      title: attrProperty.title.COLOR,
      att: target.dataset.colorName
    });

    onClick({
      id: Number(target.dataset.colorId),
      name: String(target.dataset.colorName)
    });
  };

  return (
    <Box customStyle={{ marginTop: 20 }}>
      <Typography variant="h4" weight="bold">
        색상
      </Typography>
      <Typography customStyle={{ marginTop: 4 }}>최대한 비슷한 색상을 선택해주세요.</Typography>
      <ColorViewWrap>
        {codeDetails?.map(({ codeId, id, name, description }) => {
          const needImage = filterImageColorNames.includes(description);
          return (
            codeId === 3 && (
              <Box
                key={`color-list-${id}`}
                onClick={handleClick}
                data-color-name={name}
                data-color-id={id}
              >
                {needImage ? (
                  <Avatar
                    width="40px"
                    height="40px"
                    src={`https://${process.env.IMAGE_DOMAIN}/assets/images/ico/colors/${description}.png`}
                    alt="Color Img"
                    customStyle={{
                      borderRadius: '50%'
                    }}
                  />
                ) : (
                  <ColorSample colorCode={filterColors[description as keyof typeof filterColors]} />
                )}
                <Typography variant="small2" customStyle={{ marginTop: 8 }}>
                  {name}
                </Typography>
              </Box>
            )
          );
        })}
      </ColorViewWrap>
    </Box>
  );
}

const ColorViewWrap = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-gap: 29px 18px;
  text-align: center;
  margin-top: 32px;
`;

const ColorSample = styled.div<{ colorCode: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid transparent;
  background: ${({ colorCode }) => colorCode};
  border-color: ${({
    theme: {
      palette: { common }
    },
    colorCode
  }) => (colorCode === '#FFFFFF' ? common.line01 : 'transparent')};
`;

export default CamelSellerBottomSheetColor;
