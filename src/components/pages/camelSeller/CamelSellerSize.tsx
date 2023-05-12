import { useEffect, useMemo, useState } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { find } from 'lodash-es';
import { useQuery } from '@tanstack/react-query';
import { Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { CategorySizes } from '@dto/category';

import { logEvent } from '@library/amplitude';

import { fetchCategorySizes } from '@api/category';

import queryKeys from '@constants/queryKeys';
import { OPTIONAL_FIT_SIZES, OPTIONAL_SIZES } from '@constants/camelSeller';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { camelSellerDialogStateFamily, camelSellerTempSaveDataState } from '@recoil/camelSeller';

function CamelSellerSize() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const {
    category: { id: categoryId, parentId },
    brand: { id: brandId },
    brands,
    size: { name },
    sizes,
    categorySizeIds,
    sizeOptionIds = []
  } = useRecoilValue(camelSellerTempSaveDataState);
  const setOpen = useSetRecoilState(camelSellerDialogStateFamily('size'));
  const [selectedCategorySizes, setSelectedCategorySizes] = useState<CategorySizes[]>([]);
  const [selectedOptionalSizes, setSelectedOptionalSizes] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const { data: fetchSizeData } = useQuery(
    queryKeys.categories.categorySizes({ categoryId, brandId }),
    () => fetchCategorySizes({ categoryId, brandId }),
    {
      enabled: !!categorySizeIds?.length && !!categoryId && !!brandId
    }
  );

  const handleOpenSizeBottomSheet = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_EDIT, {
      name: attrProperty.name.PRODUCT_MAIN,
      title: attrProperty.title.SIZE,
      att: selectedCategorySizes.map((info) => info.name)
    });

    if ((categoryId && brandId) || (categoryId && brands))
      setOpen(({ type }) => ({ type, open: true }));
  };

  useEffect(() => {
    const result = fetchSizeData?.filter((data) => categorySizeIds?.includes(data.categorySizeId));
    setSelectedCategorySizes(result || []);
  }, [categorySizeIds, fetchSizeData]);

  useEffect(() => {
    if (sizeOptionIds.length) {
      const result = [];
      const selectedOptionSizeId = sizeOptionIds[0];
      const selectedFitSizeId = sizeOptionIds[1];
      const option = find(OPTIONAL_SIZES, { id: selectedOptionSizeId })?.name || '';
      const fit = find(OPTIONAL_FIT_SIZES, { id: selectedFitSizeId })?.name || '';

      if (option) {
        result.push(option);
      }
      if (fit) {
        result.push(fit);
      }
      setSelectedOptionalSizes(result);
    } else {
      setSelectedOptionalSizes([]);
    }
  }, [sizeOptionIds]);

  useEffect(() => {
    if (sizes || !categorySizeIds?.length) return;

    const hasOptionalSize = sizeOptionIds.some((sizeOptionId) => [0, 1, 2].includes(sizeOptionId));
    const hasOptionalFitSize = sizeOptionIds.some((sizeOptionId) =>
      [10, 11, 12].includes(sizeOptionId)
    );
    const newMessage = [];
    // 상의, 하의, 신발
    if ([486, 487, 488].includes(parentId || categoryId) && name) {
      // 신발은 착용 사이즈감만
      if (!hasOptionalSize) newMessage.push('착용 사이즈감');
      if (!hasOptionalFitSize && ![parentId, categoryId].includes(488)) newMessage.push('핏');

      if (newMessage.length) {
        setMessage(`${newMessage.join(', ')}도 입력해보세요!`);
      } else {
        setMessage('');
      }
    } else {
      setMessage('');
    }
  }, [parentId, categoryId, name, sizeOptionIds, sizes, categorySizeIds]);

  const getSizeNamesParser = useMemo(() => {
    let result = '';

    if (categorySizeIds?.includes(0)) {
      result = 'ONE SIZE';
    }
    if (selectedCategorySizes.length) {
      if (result === 'ONE SIZE') {
        result += ', ';
      }
      result += selectedCategorySizes.map((info) => info.name).join(', ');
    }
    if (selectedOptionalSizes.length) {
      result += ` / ${selectedOptionalSizes.join(' / ')}`;
    }
    if (!result && sizes) {
      result = sizes;
    }

    return result;
  }, [categorySizeIds, selectedCategorySizes, selectedOptionalSizes, sizes]);

  return (
    <SizeWrap
      direction="vertical"
      justifyContent="center"
      gap={8}
      onClick={handleOpenSizeBottomSheet}
    >
      <SizeInfo alignment="center" justifyContent="space-between">
        <Typography
          variant="h4"
          noWrap
          customStyle={{
            color: getSizeNamesParser ? undefined : common.ui80
          }}
        >
          {getSizeNamesParser || '사이즈'}
        </Typography>
        {!categoryId && (
          <Typography variant="h4" customStyle={{ color: common.ui80 }}>
            카테고리 선택 후 입력 가능합니다
          </Typography>
        )}
        {!!categoryId && (
          <Icon
            name="Arrow2RightOutlined"
            width={20}
            height={20}
            color="ui80"
            customStyle={{
              minWidth: 20
            }}
          />
        )}
      </SizeInfo>
      {!!message && (
        <Typography
          variant="body2"
          customStyle={{
            color: common.ui60
          }}
        >
          {message}
        </Typography>
      )}
    </SizeWrap>
  );
}

const SizeWrap = styled(Flexbox)`
  padding: 20px 0;
  border-bottom: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
  cursor: pointer;
`;

const SizeInfo = styled(Flexbox)``;

export default CamelSellerSize;
