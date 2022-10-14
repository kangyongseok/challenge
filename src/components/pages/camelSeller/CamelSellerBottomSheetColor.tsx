/* eslint-disable prettier/prettier */
import { MouseEvent, useEffect } from 'react';

import { useQuery } from 'react-query';
import { Box, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { fetchCommonCodeDetails } from '@api/common';

import queryKeys from '@constants/queryKeys';
import {
  camelSellerfilterColorImagePositions,
  camelSellerfilterColorImagesInfo,
  filterColors
} from '@constants/productsFilter';
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
          const colorImageInfo =
            camelSellerfilterColorImagesInfo[
              description as keyof typeof camelSellerfilterColorImagePositions
            ];
          return (
            codeId === 3 && (
              <Box
                key={`color-list-${id}`}
                onClick={handleClick}
                data-color-name={name}
                data-color-id={id}
              >
                {colorImageInfo ? (
                  <ColorImageSample colorImageInfo={colorImageInfo} />
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
  background: ${({ colorCode }) => colorCode};
`;

const ColorImageSample = styled.div<{
  colorImageInfo: { size: number; position: number[] };
}>`
  width: 40px;
  height: 40px;
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui90};
  border-radius: 50%;
  background-size: ${({ colorImageInfo: { size } }) => size + 90}px;
  background-image: url('https://${process.env
    .IMAGE_DOMAIN}/assets/images/ico/filter_color_ico.png');
  background-position: ${({ colorImageInfo: { position } }) => `${position[0]}px ${position[1]}px`};
`;

export default CamelSellerBottomSheetColor;
