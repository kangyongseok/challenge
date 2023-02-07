import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState, useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Chip, Flexbox, Input, Typography, useTheme } from 'mrcamel-ui';
import isEmpty from 'lodash-es/isEmpty';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import type { Models } from '@dto/model';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchModelSuggest } from '@api/model';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { camelSellerCategoryBrandState, camelSellerTempSaveDataState } from '@recoil/camelSeller';
import useDebounce from '@hooks/useDebounce';

function CamelSellerTitle() {
  const router = useRouter();
  const { id: productId } = router.query;

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [tempData, setTempData] = useRecoilState(camelSellerTempSaveDataState);
  const resetCamelSellerCategoryBrandState = useResetRecoilState(camelSellerCategoryBrandState);

  const [value, setValue] = useState(tempData.title);
  const [isFocus, setIsFocus] = useState(false);
  const [models, setModels] = useState<Models[]>([]);

  const debouncedValue = useDebounce(value, 300);

  const { data, isLoading } = useQuery(
    queryKeys.models.suggest({ keyword: debouncedValue, useBrandCategory: true }),
    () => fetchModelSuggest({ keyword: debouncedValue, useBrandCategory: true }),
    {
      enabled: !!value,
      keepPreviousData: true,
      onSuccess(newData) {
        logEvent(attrKeys.camelSeller.LOAD_KEYWORD_AUTO, {
          name: attrProperty.name.PRODUCT_MAIN,
          title: attrProperty.title.TITLE,
          keyword: value,
          data: newData
        });
      }
    }
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.currentTarget.value);
    setTempData({
      ...tempData,
      title: e.currentTarget.value
    });
  };

  const handleClick =
    ({ name, productParentCategory, tmpBrands, tmpCategories }: Models) =>
    () => {
      logEvent(attrKeys.camelSeller.CLICK_AUTO, {
        name: attrProperty.name.PRODUCT_MAIN,
        title: attrProperty.title.TITLE,
        type: 'BRAND_CATEGORY',
        keyword: name
      });

      const { id, parentId, name: parentCategoryName } = productParentCategory;

      if (isEmpty(tmpBrands) && !isEmpty(tmpCategories)) {
        setTempData({
          ...tempData,
          quoteTitle: '',
          category: {
            id: tmpCategories[0].id,
            parentId,
            parentCategoryName,
            subParentId: tmpCategories[0].subParentId,
            name: tmpCategories[0].name
          },
          size: { id: 0, name: '' },
          sizes: '',
          categorySizeIds: [],
          sizeOptionIds: []
        });
        SessionStorage.set(sessionStorageKeys.camelSellerSelectBrandSource, 'CATEGORY_AUTO');
        resetCamelSellerCategoryBrandState();
        router.push('/camelSeller/registerConfirm/selectBrand');
      } else if (isEmpty(tmpCategories)) {
        setTempData({
          ...tempData,
          quoteTitle: `${tmpBrands[0]?.name} ${parentCategoryName}`,
          brand: {
            id: tmpBrands[0]?.id,
            name: tmpBrands[0]?.nameEng
              .split(' ')
              .map(
                (splitNameEng) =>
                  `${splitNameEng.charAt(0).toUpperCase()}${splitNameEng.slice(
                    1,
                    splitNameEng.length
                  )}`
              )
              .join(' ')
          },
          category: { id: 489, parentId: 0, parentCategoryName: '', subParentId: 0, name: '기타' },
          brandIds: tmpBrands.map((brand) => brand.id),
          size: { id: 0, name: '' },
          sizes: '',
          categorySizeIds: [],
          sizeOptionIds: []
        });
        resetCamelSellerCategoryBrandState();
        router.push('/camelSeller/registerConfirm/selectBrand');
      } else {
        setTempData({
          ...tempData,
          quoteTitle: `${tmpBrands[0]?.name} ${tmpCategories[0].name}`,
          brand: {
            id: tmpBrands[0]?.id,
            name: tmpBrands[0]?.nameEng
              .split(' ')
              .map(
                (splitNameEng) =>
                  `${splitNameEng.charAt(0).toUpperCase()}${splitNameEng.slice(
                    1,
                    splitNameEng.length
                  )}`
              )
              .join(' ')
          },
          category: {
            id: tmpCategories[0].id,
            parentId: id,
            parentCategoryName,
            subParentId: tmpCategories[0].subParentId,
            name: tmpCategories[0].name
          },
          brandIds: tmpBrands.map((brand) => brand.id),
          size: { id: 0, name: '' },
          sizes: '',
          categorySizeIds: [],
          sizeOptionIds: []
        });
      }
    };

  useEffect(() => {
    if (productId && tempData.title) {
      setValue(tempData.title);
    }
  }, [productId, tempData.title]);

  useEffect(() => {
    if (data && !isEmpty(data)) setModels(data);
  }, [data]);

  useEffect(() => {
    if (!value) setModels([]);
  }, [value]);

  return (
    <Flexbox
      direction="vertical"
      customStyle={{
        marginTop: 12,
        padding: '8px 0',
        borderBottom: `1px solid ${common.line01}`
      }}
    >
      <Input
        variant="inline"
        size="large"
        placeholder={isFocus ? '예) 구찌 오피디아 버킷백' : '제목'}
        fullWidth
        onClick={() =>
          logEvent(attrKeys.camelSeller.CLICK_PRODUCT_EDIT, {
            name: attrProperty.name.PRODUCT_MAIN,
            title: attrProperty.title.TITLE,
            att: value
          })
        }
        onChange={handleChange}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        value={value}
        maxLength={40}
        // TODO UI 라이브러리 props 수정..
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        unit={
          isFocus ? (
            <Typography
              variant="body2"
              customStyle={{
                '& > span': {
                  color: common.ui80
                }
              }}
            >
              {value.length} <span>/ 40</span>
            </Typography>
          ) : undefined
        }
        customStyle={{
          paddingLeft: 0,
          paddingRight: 0
        }}
      />
      {!isLoading && !isEmpty(models) && !tempData.category.id && !tempData.brand.id && (
        <List>
          {models.slice(0, 10).map((model) => (
            <Chip
              key={`brand-category-chip-${model.id}`}
              isRound={false}
              onClick={handleClick(model)}
              customStyle={{
                height: 54,
                padding: '8px 10px'
              }}
            >
              <Flexbox direction="vertical" alignment="flex-start">
                <Typography variant="h4">
                  {model.tmpCategories[0] ? model.tmpCategories[0].name : '기타'}
                </Typography>
                {model.tmpBrands[0] && (
                  <Typography
                    variant="body2"
                    customStyle={{
                      marginTop: 2,
                      color: common.ui60
                    }}
                  >
                    {model.tmpBrands[0].nameEng
                      .split(' ')
                      .map(
                        (splitNameEng) =>
                          `${splitNameEng.charAt(0).toUpperCase()}${splitNameEng.slice(
                            1,
                            splitNameEng.length
                          )}`
                      )
                      .join(' ')}
                  </Typography>
                )}
              </Flexbox>
            </Chip>
          ))}
        </List>
      )}
    </Flexbox>
  );
}

const List = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  column-gap: 8px;
  margin: 0 -20px;
  padding: 0 20px 12px;
  overflow-x: auto;
`;

export default CamelSellerTitle;
