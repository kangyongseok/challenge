import { Fragment, memo, useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';

import { useRouter } from 'next/router';
import { Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import type { NewBrands } from '@typings/brands';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

interface BrandListProps {
  brands: NewBrands[];
  brandTitles: string[];
  lang: string;
  setListTitles: (parameter: HTMLDivElement[]) => void;
  storageSet: () => void;
}

function BrandList({ brands, brandTitles, lang, setListTitles, storageSet }: BrandListProps) {
  const router = useRouter();

  const navRefs = useRef<HTMLDivElement[]>([]);

  const { data: { info: { value: { gender = '' } = {} } = {} } = {} } = useQueryUserInfo();

  useEffect(() => {
    setListTitles(navRefs.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brands]);

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    storageSet();
    const target = e.target as HTMLElement;
    const dataSet = target.dataset;

    logEvent(attrKeys.brands.CLICK_BRAND_NAME, {
      name: 'BRAND_LIST',
      att: (dataSet.brandName as string).toUpperCase()
    });

    let genders: string | undefined = gender === 'M' ? 'male' : 'female';
    if (!gender || gender === 'N') genders = undefined;

    const query = {
      genders
    };

    if (!query.genders) delete query.genders;

    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.productName.BRAND_LIST,
      title: attrProperty.productTitle.LIST,
      type: attrProperty.productType.INPUT
    });

    router.push({
      pathname: `/products/brands/${(dataSet.brandName || '').replace(/ x /g, '-')}`,
      query
    });
  };

  return (
    <div>
      {brandTitles.map((title, i) => (
        <Fragment key={`nav-${title}`}>
          <Typography
            variant="small1"
            brandColor="grey"
            weight="medium"
            customStyle={{ marginBottom: 12 }}
            ref={(ref) => {
              navRefs.current[i] = ref as HTMLDivElement;
            }}
          >
            {title}
          </Typography>
          <ul data-nav-id={i}>
            {brands
              .filter((brand) => (brand[lang] as string)[0] === title[0])
              .map((brand) => (
                /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
                /* eslint-disable jsx-a11y/click-events-have-key-events */
                <BrandItemLi
                  onClick={handleClick}
                  data-brand-ids={brand.brandIds}
                  data-collabo-ids={brand.collaboIds}
                  data-brand-name={brand.name}
                  key={`brand-list-${brand.name}`}
                >
                  {lang === 'ko' ? brand.name : brand.nameEng.toUpperCase()}
                </BrandItemLi>
              ))}
          </ul>
        </Fragment>
      ))}
    </div>
  );
}

const BrandItemLi = styled.li`
  margin-bottom: 24px;
  font-size: ${({ theme: { typography } }) => typography.h4.size};
  color: ${({ theme: { palette } }) => palette.common.grey['20']};
  font-weight: 500;
`;

const compareList = (prevProps: BrandListProps, nextProps: BrandListProps) => {
  if (prevProps.brands.length === 0) {
    return false;
  }
  return prevProps.lang === nextProps.lang;
};

export default memo(BrandList, compareList);
