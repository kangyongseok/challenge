import { useMemo } from 'react';

import { useRouter } from 'next/router';
import type { CustomStyle } from '@mrcamelhub/camel-ui';
import { Skeleton, useTheme } from '@mrcamelhub/camel-ui';

import { GENDER } from '@constants/user';
import { BRANDS_BY_GENDER } from '@constants/brand';

import { getImageResizePath } from '@utils/common';

import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

import {
  BrandImage,
  BrandImageBox,
  BrandItem,
  BrandName,
  StyledBrandList
} from './BrandList.styles';

export interface BrandListProps {
  variant?: 'solid' | 'outline';
  color?: 'grey' | 'white';
  onClickBrand?: ({
    id,
    name,
    callback
  }: {
    id: number;
    name: string;
    callback: () => void;
  }) => void;
  gender?: keyof typeof GENDER;
  customStyle?: CustomStyle;
}

function BrandList({
  variant = 'solid',
  color = 'grey',
  gender,
  onClickBrand,
  customStyle
}: BrandListProps) {
  const router = useRouter();

  const {
    theme: { mode }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();
  const {
    data: {
      personalStyle: { personalBrands = [] } = {},
      info: { value: { gender: userGender = '' } = {} } = {}
    } = {},
    isFetched
  } = useQueryUserInfo();

  const brands = useMemo(() => {
    let newBrandList = BRANDS_BY_GENDER.N;

    if (!gender && personalBrands.length > 0) {
      newBrandList = personalBrands.map(({ id, name, nameEng }) => ({ id, name, nameEng }));
    }

    if (gender) {
      newBrandList = BRANDS_BY_GENDER[gender === 'male' ? 'M' : 'F'];
    }

    return newBrandList.slice(0, 8);
  }, [gender, personalBrands]);

  const handleClickBrand =
    ({ id, name }: { id: number; name: string }) =>
    () => {
      const callback = () => {
        router.push({
          pathname: `/products/brands/${name}`,
          query:
            !userGender || userGender === 'N'
              ? {}
              : { genders: userGender === 'M' ? 'male' : 'female' }
        });
      };

      if (onClickBrand) {
        onClickBrand({ id, name, callback });
      } else {
        callback();
      }
    };

  return (
    <StyledBrandList variant={variant} css={customStyle}>
      {!!accessUser && !isFetched && personalBrands.length === 0
        ? Array.from({ length: 8 }, (_, index) => (
            <BrandItem key={`brand-skeleton-${index}`} css={{ margin: 'auto' }}>
              <Skeleton width={64} height={64} round="50%" />
              <Skeleton width={64} height={18} round={8} disableAspectRatio />
            </BrandItem>
          ))
        : brands.map(({ id, name, nameEng }) => (
            <BrandItem
              key={`brand-${id}`}
              variant={variant}
              onClick={handleClickBrand({ id, name })}
            >
              <BrandImageBox variant={variant} color={color}>
                <BrandImage
                  src={getImageResizePath({
                    imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/brands/${
                      mode === 'light' ? 'white' : 'black'
                    }/${nameEng.toLowerCase().replace(/\s/g, '')}.jpg`,
                    w: 48
                  })}
                  alt="Brand Logo Img"
                  variant={variant}
                  round="50%"
                />
              </BrandImageBox>
              <BrandName variant="body2" weight="medium">
                {name}
              </BrandName>
            </BrandItem>
          ))}
    </StyledBrandList>
  );
}

export default BrandList;
