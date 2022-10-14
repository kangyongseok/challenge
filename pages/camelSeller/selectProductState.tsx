import { useCallback, useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { BottomSheet, Box, Button, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import amplitude from 'amplitude-js';
import styled from '@emotion/styled';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  CamelSellerBottomSheetColor,
  CamelSellerBottomSheetSize,
  CamelSellerColorState,
  CamelSellerSizeState,
  CamelSellerViewStateValue
} from '@components/pages/camelSeller';

import type { SearchParams } from '@dto/product';
import { CommonCode, SizeCode } from '@dto/common';

import LocalStorage from '@library/localStorage';
import ChannelTalk from '@library/channelTalk';
import { logEvent } from '@library/amplitude';

import { fetchSearch } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { CAMEL_SELLER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import type { CamelSellerLocalStorage, SubmitType } from '@typings/camelSeller';
import {
  camelSellerBooleanStateFamily,
  camelSellerEditState,
  camelSellerSubmitState,
  toggleBottomSheetState
} from '@recoil/camelSeller';

interface SelectValue {
  id: number;
  name: string;
}

function SelectProductState() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();
  const [toggleBottomSheet, atomToggleBottomSheet] = useRecoilState(toggleBottomSheetState);
  const editMode = useRecoilValue(camelSellerBooleanStateFamily('edit'));
  const [color, setColor] = useState<SelectValue>({ id: 0, name: '' });
  const [size, setSize] = useState<SelectValue>({ id: 0, name: '' });
  const [editData, setEditData] = useRecoilState(camelSellerEditState);
  // const [condition, setCondition] = useState<SelectCondition>({ name: '', id: 0 });
  const [camelSeller, setCamelSeller] = useState<CamelSellerLocalStorage>();
  const [searchParams, setSearchParams] = useState<SearchParams>();
  const [submitData, setSubmitData] = useRecoilState(camelSellerSubmitState);

  const { data, refetch: refetchSearch } = useQuery(
    queryKeys.products.search(searchParams),
    () => fetchSearch(searchParams),
    {
      enabled: !!searchParams?.keyword
    }
  );

  useEffect(() => {
    logEvent(attrKeys.camelSeller.VIEW_PRODUCT_OPTIONS);
    setCamelSeller(editData || (LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage));
    setDefaultValue(editData || (LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage));
    ChannelTalk.hideChannelButton();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDefaultValue = useCallback(
    (saveData: CamelSellerLocalStorage) => {
      if (saveData) {
        if (!size.name && saveData.size) {
          setSize(saveData.size as SelectValue);
        }
        if (!color.name && saveData.color) {
          setColor(saveData.color as SelectValue);
        }
      }
    },
    [color, size]
  );

  useEffect(() => {
    if (camelSeller) {
      setSearchParams({
        brandIds: camelSeller.brand?.id ? [Number(camelSeller.brand?.id)] : [],
        categoryIds: camelSeller.category?.id ? [Number(camelSeller.category?.id)] : [],
        keyword: camelSeller.keyword,
        deviceId: amplitude.getInstance().getDeviceId()
      });
      if (!editMode.isState) {
        LocalStorage.set(CAMEL_SELLER, {
          ...camelSeller,
          step: router.asPath
        });
      }
    }
  }, [camelSeller, router, setDefaultValue, editMode]);

  useEffect(() => {
    if (searchParams) {
      refetchSearch();
    }
  }, [refetchSearch, searchParams]);

  const handleClickNextStep = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_MODAL, {
      name: attrProperty.name.PRODUCT_OPTIONS,
      title: attrProperty.title.DONE,
      att: { color, size }
    });

    if (editMode.isState) {
      setEditData({
        ...(editData as CamelSellerLocalStorage),
        color,
        size
      });
    } else {
      LocalStorage.set(CAMEL_SELLER, {
        ...camelSeller,
        color,
        size
      });
    }

    setSubmitData({
      ...(submitData as SubmitType),
      colorIds: [color.id],
      categorySizeIds: [size.id]
    });

    if (editMode.isState) {
      router.push(`/camelSeller/registerConfirm?id=${router.query.id}`);
      return;
    }

    router.push('/camelSeller/registerConfirm');
  };

  return (
    <GeneralTemplate
      header={<Header showRight={false} />}
      footer={
        <NextButtonArea justifyContent="center" alignment="center">
          <Button
            fullWidth
            brandColor="primary"
            variant="contained"
            size="large"
            disabled={!(color.name && size.name)}
            onClick={handleClickNextStep}
          >
            완료
          </Button>
        </NextButtonArea>
      }
    >
      <Box
        customStyle={{
          margin: '32px 0'
          // display: searchValue && searchBrands?.length === 0 ? 'none' : 'block'
        }}
      >
        <Typography variant="h2" weight="bold">
          판매하려는 상품의
        </Typography>
        <Typography variant="h2" weight="bold">
          <HighlightTitle>사이즈 및 색상</HighlightTitle>을 알려주세요.
        </Typography>
      </Box>
      <SelectStateContent direction="vertical">
        <BorderBottomBox>
          {!size.name ? (
            <CamelSellerSizeState
              sizes={
                data?.searchOptions.sizes.filter(
                  (optionSize) => optionSize.description !== 'EMPTY'
                ) as SizeCode[]
              }
              onClick={(sizeInfo) => setSize(sizeInfo)}
            />
          ) : (
            <Typography
              variant="h4"
              customStyle={{
                color: common.ui80,
                display: size.name ? 'none' : 'block'
              }}
              onClick={() => atomToggleBottomSheet('size')}
            >
              사이즈를 선택해주세요.
            </Typography>
          )}
          {size.name && (
            <CamelSellerViewStateValue
              type="size"
              value={size.name}
              setValue={() => {
                logEvent(attrKeys.camelSeller.CLICK_RESET_ITEM, {
                  name: attrProperty.name.PRODUCT_OPTIONS,
                  title: attrProperty.title.SIZE
                });

                setSize({ id: 0, name: '' });
              }}
            />
          )}
        </BorderBottomBox>
        <Box>
          {!color.name && size.name ? (
            <CamelSellerColorState
              colors={data?.searchOptions.colors as CommonCode[]}
              onClick={(colorInfo) => setColor(colorInfo)}
            />
          ) : (
            <Typography
              variant="h4"
              customStyle={{
                color: common.ui80,
                display: color.name ? 'none' : 'block'
              }}
              onClick={() => atomToggleBottomSheet('color')}
            >
              색상을 선택해주세요.
            </Typography>
          )}
          {color.name && (
            <CamelSellerViewStateValue
              type="color"
              value={color.name}
              setValue={() => {
                logEvent(attrKeys.camelSeller.CLICK_RESET_ITEM, {
                  name: attrProperty.name.PRODUCT_OPTIONS,
                  title: attrProperty.title.COLOR
                });

                setColor({ id: 0, name: '' });
              }}
            />
          )}
        </Box>
      </SelectStateContent>

      <BottomSheet
        open={!!toggleBottomSheet}
        onClose={() => atomToggleBottomSheet('')}
        customStyle={{ padding: '0 20px 20px 20px', height: '100%' }}
        disableSwipeable
      >
        {toggleBottomSheet === 'color' && (
          <CamelSellerBottomSheetColor
            onClick={(colorInfo) => {
              setColor(colorInfo);
              atomToggleBottomSheet('');
            }}
          />
        )}
        {toggleBottomSheet === 'size' && (
          <CamelSellerBottomSheetSize
            onClick={(e: MouseEvent<HTMLDivElement>) => {
              logEvent(attrKeys.camelSeller.CLICK_PRODUCT_MODAL, {
                name: attrProperty.name.PRODUCT_OPTIONS,
                title: attrProperty.title.SIZE,
                att: e.currentTarget.dataset.sizeName
              });

              setSize({
                id: Number(e.currentTarget.dataset.sizeId),
                name: String(e.currentTarget.dataset.sizeName)
              });
              atomToggleBottomSheet('');
            }}
          />
        )}
      </BottomSheet>
    </GeneralTemplate>
  );
}

const NextButtonArea = styled(Flexbox)`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
`;

const HighlightTitle = styled.span`
  color: ${({ theme: { palette } }) => palette.primary.main};
`;

const BorderBottomBox = styled.div`
  border-bottom: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui90};
  margin-bottom: 20px;
  padding-bottom: 20px;
`;

const SelectStateContent = styled(Flexbox)`
  border: 2px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui80};
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 90px;
`;

export default SelectProductState;
