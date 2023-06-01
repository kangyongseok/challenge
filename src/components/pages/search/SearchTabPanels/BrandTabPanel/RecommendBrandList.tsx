import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { Box, Flexbox, Image, Skeleton, Typography } from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import { BRANDS_BY_GENDER } from '@constants/brand';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getImageResizePath } from '@utils/common';

import useQueryUserInfo from '@hooks/useQueryUserInfo';

function RecommendBrandList() {
  const router = useRouter();

  const { mode } = useTheme();

  const {
    data: {
      personalStyle: { personalBrands = [] } = {},
      info: { value: { gender = '' } = {} } = {}
    } = {},
    isInitialLoading
  } = useQueryUserInfo();

  const [brands, setBrands] = useState<{ id: number; name: string; nameEng: string }[]>([]);

  const handleClick = (name: string) => () => {
    logEvent(attrKeys.category.CLICK_BRAND_NAME, {
      name: attrProperty.name.SEARCH_MODAL,
      title: attrProperty.title.RECOMMEND,
      att: name
    });

    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.name.SEARCH_MODAL,
      title: attrProperty.title.RECOMMEND,
      type: attrProperty.type.GUIDED
    });

    router.push({
      pathname: `/products/brands/${name}`,
      query:
        gender.length > 0 && gender !== 'N'
          ? {
              genders: [gender === 'M' ? 'male' : 'female']
            }
          : {}
    });
  };

  useEffect(() => {
    if (isInitialLoading || brands.length) return;

    let newBrands = BRANDS_BY_GENDER.N;

    if (!gender && personalBrands.length > 0) {
      newBrands = personalBrands.map(({ id, name, nameEng }) => ({ id, name, nameEng }));
    }

    if (gender) {
      newBrands = BRANDS_BY_GENDER[gender === 'M' ? 'M' : 'F'];
    }

    setBrands(newBrands.slice(0, 8));
  }, [gender, personalBrands, isInitialLoading, brands]);

  return (
    <Box component="section">
      <Typography
        variant="h3"
        weight="bold"
        customStyle={{
          padding: '32px 20px 20px'
        }}
      >
        추천 브랜드
      </Typography>
      <Flexbox
        customStyle={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          rowGap: 20,
          padding: '0 12px 32px'
        }}
      >
        {(isInitialLoading || brands.length === 0) &&
          Array.from({ length: 8 })
            .map((_, index) => index)
            .map((index) => (
              <Flexbox
                key={`recommend-brand-skeleton-${index}`}
                direction="vertical"
                justifyContent="center"
                alignment="center"
                gap={4}
                customStyle={{
                  flexGrow: 1,
                  maxWidth: 87.75,
                  margin: 'auto'
                }}
              >
                <Skeleton width={48} height={48} round={8} disableAspectRatio />
                <Skeleton width="100%" maxWidth={50} height={20} round={8} disableAspectRatio />
              </Flexbox>
            ))}
        {!isInitialLoading &&
          brands.map(({ name, nameEng }) => (
            <Flexbox
              key={`recommend-brand-${name}`}
              direction="vertical"
              justifyContent="center"
              alignment="center"
              gap={4}
              onClick={handleClick(name)}
              customStyle={{
                flexGrow: 1,
                maxWidth: 87.75,
                margin: 'auto'
              }}
            >
              <Image
                width={48}
                height={48}
                src={getImageResizePath({
                  imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/brands/${
                    mode === 'light' ? 'white' : 'black'
                  }/${nameEng.toLowerCase().replace(/\s/g, '')}.jpg`,
                  w: 48
                })}
                alt={name}
                round={8}
                disableAspectRatio
              />
              <Typography textAlign="center">{name}</Typography>
            </Flexbox>
          ))}
      </Flexbox>
    </Box>
  );
}

export default RecommendBrandList;
