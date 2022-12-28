import { memo, useCallback } from 'react';

import { useRouter } from 'next/router';
import { Flexbox, Image, Typography, useTheme } from 'mrcamel-ui';
import capitalize from 'lodash-es/capitalize';

import type { AllBrand } from '@dto/brand';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryUserInfo from '@hooks/useQueryUserInfo';

interface BrandItemProps {
  type?: 'suggest' | 'recommend';
  brand: AllBrand;
}

function BrandItem({ type = 'recommend', brand: { name, nameLogo, nameEng } }: BrandItemProps) {
  const router = useRouter();
  const {
    theme: { mode }
  } = useTheme();
  const { data: { info: { value: { gender = '' } = {} } = {} } = {} } = useQueryUserInfo();

  const handleClick = useCallback(() => {
    if (type === 'recommend') {
      logEvent(attrKeys.brand.CLICK_BRAND_NAME, {
        name: attrProperty.productName.BRAND_LIST,
        att: name
      });
    } else {
      logEvent(attrKeys.brand.CLICK_AUTO, {
        name: attrProperty.productName.BRAND_LIST,
        type: 'BRAND',
        keyword: name
      });
    }

    if (type === 'recommend') {
      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.productName.BRAND_LIST,
        title: attrProperty.productTitle.LIST,
        type: attrProperty.productType.INPUT
      });
    } else {
      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.productName.BRAND_SEARCH,
        title: attrProperty.productTitle.AUTO,
        type: attrProperty.productType.INPUT
      });
    }

    router.push({
      pathname: `/products/brands/${name.replace(/ x /g, '-')}`,
      query:
        gender.length > 0 && gender !== 'N'
          ? {
              genders: [gender === 'M' ? 'male' : 'female']
            }
          : {}
    });
  }, [gender, name, router, type]);

  return (
    <Flexbox gap={20} alignment="center" onClick={handleClick} customStyle={{ cursor: 'pointer' }}>
      <Image
        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/brands/${
          mode === 'light' ? 'white' : 'black'
        }/${nameLogo.toLowerCase().replace(/\s/g, '')}.jpg`}
        alt="Brand Logo Img"
        width={48}
        height={48}
        disableAspectRatio
      />
      <Flexbox direction="vertical" gap={4} customStyle={{ padding: '12px 0', flex: 1 }}>
        <Typography variant="h4" weight="bold" customStyle={{ lineHeight: '20px' }}>
          {name}
        </Typography>
        <Typography variant="small1" customStyle={{ lineHeight: '16px' }}>
          {nameEng
            .split(/\s/)
            .map((brandName) => capitalize(brandName))
            .join(' ')}
        </Typography>
      </Flexbox>
    </Flexbox>
  );
}

export default memo(BrandItem);
