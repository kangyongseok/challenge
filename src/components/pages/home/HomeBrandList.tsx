import { useMemo } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Fab, Flexbox, Icon, Typography } from 'mrcamel-ui';
import omitBy from 'lodash-es/omitBy';
import isEmpty from 'lodash-es/isEmpty';
import { debounce } from 'lodash-es';
import styled from '@emotion/styled';

import Image from '@components/UI/atoms/Image';

import { logEvent } from '@library/amplitude';

import { filterGenders } from '@constants/productsFilter';
import { BRANDS_BY_GENDER } from '@constants/brand';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  searchHelperPopupStateFamily,
  searchParamsState,
  selectedSearchOptionsDefault,
  selectedSearchOptionsState
} from '@recoil/searchHelper';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

type Brand = {
  id: number;
  name: string;
  nameEng: string;
};

interface HomeBrandListProps {
  isViewSearchHelperOnboarding: () => boolean;
}

function HomeBrandList({ isViewSearchHelperOnboarding }: HomeBrandListProps) {
  const router = useRouter();
  const selectedSearchOptions = useRecoilValue(selectedSearchOptionsState);
  const setSearchParams = useSetRecoilState(searchParamsState);
  const setSelectedSearchOptions = useSetRecoilState(selectedSearchOptionsState);
  const setSearchHelperPopup = useSetRecoilState(searchHelperPopupStateFamily('continue'));
  const {
    data: {
      personalStyle: { personalBrands = [] } = {},
      info: { value: { gender = '' } = {} } = {}
    } = {}
  } = useQueryUserInfo();

  const brands = useMemo<Brand[]>(() => {
    let result = BRANDS_BY_GENDER.N;

    if (personalBrands.length) {
      result = personalBrands;
    }

    return result.slice(0, 9);
  }, [personalBrands]);
  const genderName = gender === 'F' ? 'female' : 'male';
  const genderId = filterGenders[genderName as keyof typeof filterGenders].id;

  const handleClickBrand =
    ({ id, name }: { id: number; name: string }) =>
    () => {
      logEvent(attrKeys.home.CLICK_MAIN_BUTTON, {
        title: 'BRAND',
        att: name
      });

      if (isViewSearchHelperOnboarding()) {
        setSelectedSearchOptions({
          ...selectedSearchOptionsDefault,
          pathname: router.pathname,
          brand: { id, name },
          gender: gender ? { id: genderId, name: genderName } : selectedSearchOptionsDefault.gender
        });
        setSearchParams(
          omitBy(
            {
              brandIds: [id],
              genderIds: gender ? [genderId, filterGenders.common.id] : []
            },
            isEmpty
          )
        );
        return;
      }

      if (selectedSearchOptions.brand.id === id) {
        setSearchHelperPopup(true);
        return;
      }

      let genders: string | undefined = gender === 'M' ? 'male' : 'female';
      if (!gender || gender === 'N') genders = undefined;

      const query = {
        genders
      };

      if (!query.genders) delete query.genders;

      router.push({
        pathname: `/products/brands/${name}`,
        query
      });
    };

  const handleClickAllBrand = () => {
    logEvent(attrKeys.home.CLICK_MAIN_BRAND);

    if (isViewSearchHelperOnboarding()) {
      setSelectedSearchOptions({
        ...selectedSearchOptionsDefault,
        pathname: router.pathname,
        gender: gender ? { id: genderId, name: genderName } : selectedSearchOptionsDefault.gender
      });
      setSearchParams(
        omitBy({ genderIds: genderId ? [genderId, filterGenders.common.id] : [] }, isEmpty)
      );
    } else {
      router.push('/brands');
    }
  };

  const handleScroll = debounce(() => {
    logEvent(attrKeys.home.SWIPE_X_BRAND, {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.QUICKSEARCH
    });
  }, 500);

  return (
    <Box component="section" customStyle={{ marginTop: 24 }}>
      <Typography variant="h4" weight="bold" brandColor="black">
        브랜드로 빠른검색
      </Typography>
      <BrandList onScroll={handleScroll}>
        {brands?.map(({ id, name, nameEng }) => (
          <BrandItem key={`brand-${id}`} onClick={handleClickBrand({ id, name })}>
            <Image
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/brands/${nameEng
                .toLowerCase()
                .replace(/\s/g, '')}.png`}
              alt={nameEng}
              customStyle={{
                borderRadius: '50%',
                backgroundColor: '#eff2f7'
              }}
            />
            <Typography
              variant="body2"
              weight="medium"
              customStyle={{ marginTop: 8, minHeight: 18 }}
            >
              {name}
            </Typography>
          </BrandItem>
        ))}
        <Flexbox
          alignment="center"
          justifyContent="center"
          customStyle={{ width: 68, height: 68, margin: '0 auto' }}
        >
          <Fab type="button" customStyle={{ width: 56, height: 56 }} onClick={handleClickAllBrand}>
            <Flexbox direction="vertical" alignment="center" justifyContent="center">
              <Icon name="ArrowRightOutlined" size="large" />
              <Typography variant="small2">전체보기</Typography>
            </Flexbox>
          </Fab>
        </Flexbox>
      </BrandList>
    </Box>
  );
}

const BrandList = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 16px;
  margin: 0 -20px;
  padding: 16px 20px 0;
  overflow-x: auto;
  overflow-y: hidden;
`;

const BrandItem = styled.div`
  display: grid;
  grid-auto-columns: 68px;
  grid-template-rows: 68px 26px;
  text-align: center;
  margin: auto;
  cursor: pointer;
`;

export default HomeBrandList;
