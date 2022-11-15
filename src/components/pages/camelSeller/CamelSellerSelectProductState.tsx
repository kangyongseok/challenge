import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { BottomSheet, Box, Button, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import amplitude from 'amplitude-js';
import styled from '@emotion/styled';

import { Header } from '@components/UI/molecules';
import { Skeleton } from '@components/UI/atoms';
import {
  CamelSellerBottomSheetColor,
  CamelSellerBottomSheetSize,
  CamelSellerColorState,
  CamelSellerSizeState,
  CamelSellerViewStateValue
} from '@components/pages/camelSeller';

import type { SearchParams } from '@dto/product';
import { CommonCode, SizeCode } from '@dto/common';

import ChannelTalk from '@library/channelTalk';
import { logEvent } from '@library/amplitude';

import { fetchProduct, fetchSearch } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { scrollDisable, scrollEnable } from '@utils/scroll';

import { deviceIdState } from '@recoil/common';
import { camelSellerTempSaveDataState, toggleBottomSheetState } from '@recoil/camelSeller';

interface SelectValue {
  id: number;
  name: string;
}

function CamelSellerSelectProductState({ close }: { close: () => void }) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const { query } = useRouter();
  const deviceId = useRecoilValue(deviceIdState);
  const productId = Number(query.id || 0);
  const [toggleBottomSheet, atomToggleBottomSheet] = useRecoilState(toggleBottomSheetState);
  const [color, setColor] = useState<SelectValue>({ id: 0, name: '' });
  const [size, setSize] = useState<SelectValue>({ id: 0, name: '' });
  const [searchParams, setSearchParams] = useState<SearchParams>();
  const [tempData, setTempData] = useRecoilState(camelSellerTempSaveDataState);

  const {
    data,
    refetch: refetchSearch,
    isLoading
  } = useQuery(queryKeys.products.search(searchParams), () => fetchSearch(searchParams), {
    enabled: !!searchParams?.keyword
  });

  const { data: editData } = useQuery(
    queryKeys.products.sellerEditProducs({ productId, deviceId }),
    () => fetchProduct({ productId, deviceId }),
    {
      enabled: !!productId
    }
  );

  useEffect(() => {
    logEvent(attrKeys.camelSeller.VIEW_PRODUCT_OPTIONS);
    ChannelTalk.hideChannelButton();
    scrollDisable();
    return () => scrollEnable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data?.searchOptions.colors.length === 0 && size.name && !color.name) {
      atomToggleBottomSheet('color');
    }
  }, [atomToggleBottomSheet, color.name, data, size.name]);

  useEffect(() => {
    if (editData) {
      setSearchParams({
        brandIds: [editData.product.brand.id].concat(
          editData.product?.productBrands?.map(({ brand }) => brand.id) || []
        ),
        categoryIds: [editData.product.category.id || 0],
        keyword: editData.product.quoteTitle || editData.product.brand.name,
        deviceId: amplitude.getInstance().getDeviceId()
      });

      setColor(tempData.color);
      setSize(tempData.size);
    }

    if (query.brandIds) {
      setSearchParams({
        brandIds:
          typeof query.brandIds === 'string'
            ? [Number(query.brandIds) || 0]
            : query.brandIds.map((id) => Number(id)),
        categoryIds: [Number(query.categoryIds) || 0],
        keyword: tempData.quoteTitle || String(query.brandName) || '',
        deviceId: amplitude.getInstance().getDeviceId()
      });
      setColor(tempData.color);
      setSize(tempData.size);
    }
  }, [query.brandIds, query.categoryIds, query.title, editData, tempData, query.brandName]);

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

    setTempData({
      ...tempData,
      color,
      size
    });

    // setSubmitData({
    //   ...(submitData as SubmitType),
    //   colorIds: [color.id],
    //   categorySizeIds: [size.id]
    // });
    close();
  };

  return (
    <Wrap>
      <Header onClickLeft={close} showRight={false} disableAppDownloadBannerVariableTop />
      <Box
        customStyle={{
          margin: '32px 0',
          padding: '0 20px'
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
      <Box customStyle={{ padding: '0 20px' }}>
        <SelectStateContent direction="vertical">
          <BorderBottomBox>
            {!size.name && isLoading && (
              <Box>
                <Skeleton width="150px" height="20px" disableAspectRatio />
                <Flexbox
                  customStyle={{ marginTop: 12, flexWrap: 'wrap' }}
                  alignment="center"
                  gap={8}
                >
                  {Array.from({ length: 10 }, (_, i) => i).map((value) => (
                    <Skeleton
                      key={`chip-skeleton-${value}`}
                      disableAspectRatio
                      height="32px"
                      customStyle={{ borderRadius: 16, minWidth: 45 }}
                    />
                  ))}
                </Flexbox>
              </Box>
            )}
            {!size.name && !isLoading ? (
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
      </Box>

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
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
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
    </Wrap>
  );
}

const Wrap = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  bottom: 0;
  background: white;
  z-index: 20;
  overflow: auto;
`;

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

export default CamelSellerSelectProductState;
