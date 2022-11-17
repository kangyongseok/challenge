import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, MouseEvent } from 'react';

import { useRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Chip, Flexbox, Icon, Label, Typography, useTheme } from 'mrcamel-ui';
import { debounce } from 'lodash-es';
import styled from '@emotion/styled';

import { CustomSearchBar, Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import type { AllBrand, Brand } from '@dto/brand';

import ChannelTalk from '@library/channelTalk';
import { logEvent } from '@library/amplitude';

import { fetchBrandsSuggest, fetchHotBrands } from '@api/brand';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { camelSellerTempSaveDataState } from '@recoil/camelSeller';

function SelectBrand() {
  const { query, push } = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const inputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [brands, setBrands] = useState<Brand[] | AllBrand[]>([]);
  const [tempData, setTempData] = useRecoilState(camelSellerTempSaveDataState);
  const { data: defaultBrands } = useQuery(queryKeys.brands.hotBrands(), fetchHotBrands);
  const {
    data: searchBrands,
    refetch,
    isSuccess
  } = useQuery(queryKeys.brands.brandName(), () => fetchBrandsSuggest({ keyword: searchValue }), {
    enabled: false,
    onSuccess(data) {
      logEvent(attrKeys.camelSeller.LOAD_KEYWORD_AUTO, {
        name: attrProperty.name.PRODUCT_BRAND,
        title: attrProperty.title.BRAND,
        att: searchValue,
        count: data.length
      });
    }
  });

  const attTitle = useMemo(() => {
    return query.title ? attrProperty.title.NO_MODEL : attrProperty.title.DONTKNOW_MODEL;
  }, [query.title]);

  useEffect(() => {
    logEvent(attrKeys.camelSeller.VIEW_PRODUCT_BRAND, {
      title: attTitle
    });
  }, [attTitle, query.title]);

  useEffect(() => {
    if (defaultBrands) {
      setBrands(defaultBrands);
    }
  }, [defaultBrands]);

  useEffect(() => {
    if (searchValue) {
      if (isFocus) {
        window.scroll({
          top: 150,
          left: 0,
          behavior: 'smooth'
        });
      }
      refetch();
    }
  }, [searchValue, refetch, isFocus]);

  useEffect(() => {
    if (searchBrands && defaultBrands) {
      if (searchBrands.length > 0 && searchValue) {
        setBrands(searchBrands);
      } else {
        setBrands(defaultBrands);
      }
    }
  }, [searchBrands, searchValue, defaultBrands]);

  const handleChange = debounce((e: FormEvent<HTMLInputElement>) => {
    const { value } = e.target as HTMLInputElement;
    setSearchValue(value);
  }, 500);

  const handleFocus = () => {
    logEvent(attrKeys.camelSeller.CLICK_BRAND_SEARCH, {
      name: attrProperty.name.PRODUCT_BRAND,
      title: attTitle
    });

    setIsFocus(true);
    window.scroll({
      top: 150,
      left: 0,
      behavior: 'smooth'
    });
  };

  const handleClickBrand = (e: MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    logEvent(attrKeys.camelSeller.CLICK_BRAND, {
      name: attrProperty.name.PRODUCT_BRAND,
      title: attTitle,
      att: target.dataset.brandName
    });

    if (query.title) {
      setTempData({
        ...tempData,
        title: query.title as string,
        quoteTitle: target.dataset.brandName as string
      });

      push({
        pathname: '/camelSeller/registerConfirm',
        query: {
          ...query,
          brandIds: Number(target.dataset.brandId),
          brandName: target.dataset.brandName
        }
      });
    } else {
      push({
        pathname: '/camelSeller/selectLine',
        query: {
          ...query,
          brandIds: Number(target.dataset.brandId),
          brandName: target.dataset.brandName
        }
      });
    }
  };

  return (
    <GeneralTemplate
      header={<Header showRight={false} disableAppDownloadBannerVariableTop />}
      hideAppDownloadBanner
    >
      <Box
        customStyle={{
          marginTop: '32px',
          display: searchValue && searchBrands?.length === 0 ? 'none' : 'block'
        }}
      >
        <Label
          variant="ghost"
          text={(query.categoryName as string) || ''}
          customStyle={{ marginBottom: 16 }}
        />
        {!query.title ? (
          <>
            <Typography variant="h2" weight="bold">
              판매하고자 하는
            </Typography>
            <Typography variant="h2" weight="bold">
              <HighlightTitle>브랜드</HighlightTitle>를 알려주세요.
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h3">
              <UnderLineTitle>{query.title}</UnderLineTitle>의
            </Typography>
            <Typography variant="h2" weight="bold" customStyle={{ marginTop: 8 }}>
              <HighlightTitle>브랜드</HighlightTitle>를 알려주세요.
            </Typography>
          </>
        )}
      </Box>
      <StyledSearch>
        <SearchWrap isActive={!!(searchValue || isFocus)}>
          <CustomSearchBar
            fullWidth
            startIcon={<Icon name="SearchOutlined" />}
            placeholder="브랜드 검색"
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={() => setIsFocus(false)}
            isBorder={false}
            ref={inputRef}
          />
        </SearchWrap>
      </StyledSearch>
      {searchValue && searchBrands?.length === 0 && isSuccess && (
        <EmptyArea>
          <Flexbox
            direction="vertical"
            justifyContent="center"
            alignment="center"
            customStyle={{ height: 'calc(100vh - 480px)' }}
          >
            <IconBackground>😮</IconBackground>
            <Typography variant="h4" weight="bold">
              검색 결과가 없어요.
            </Typography>
            <Typography customStyle={{ marginTop: 8 }}>
              키워드를 변경하거나 다른 브랜드를 검색해보세요.
            </Typography>
          </Flexbox>
          <EmptyBottom alignment="center" justifyContent="center" direction="vertical" gap={4}>
            <Typography weight="bold" customStyle={{ color: common.ui60 }}>
              상품을 등록하려면?
            </Typography>
            <Typography customStyle={{ color: common.ui60 }}>
              카멜에 입력하신 브랜드를 추가해달라고 요청해보세요!
            </Typography>
            <Button
              customStyle={{
                marginTop: 8,
                border: `1px solid ${common.ui80}`,
                padding: '10px 14px'
              }}
              onClick={() => ChannelTalk.showMessenger()}
            >
              브랜드 추가 요청
            </Button>
          </EmptyBottom>
        </EmptyArea>
      )}
      <GridBox isDisabled={!!(searchValue && searchBrands?.length === 0)}>
        {brands?.map((brand) => (
          <BrandChip
            key={`select-brand-${brand.id}`}
            isRound={false}
            data-brand-id={brand.id}
            data-brand-name={brand.name}
            onClick={handleClickBrand}
          >
            <div>
              <Img
                alt={brand.nameEng}
                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/brands/${brand.nameEng
                  .toLowerCase()
                  .replace(/\s/g, '')}.png`}
              />
            </div>
            <Typography variant="small1">{brand.name}</Typography>
          </BrandChip>
        ))}
      </GridBox>
    </GeneralTemplate>
  );
}

const StyledSearch = styled.div`
  position: sticky;
  top: 56px;
  left: 0;
  z-index: 5;
  background: white;
  padding-top: 32px;
`;

const SearchWrap = styled.div<{ isActive: boolean }>`
  padding: 0 16px;
  border: 2px solid
    ${({
      theme: {
        palette: { primary, common }
      },
      isActive
    }) => (isActive ? primary.main : common.ui90)};
  border-radius: 8px;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  input {
    font-size: ${({ theme: { typography } }) => typography.h4.size};
  }
`;

const IconBackground = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52px;
  margin-bottom: 20px;
`;

const EmptyArea = styled.div`
  margin-top: 100px;
`;

const EmptyBottom = styled(Flexbox)`
  width: 100%;
  height: 163px;
  margin-top: auto;
  position: absolute;
  bottom: 0;
  left: 0;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui95};
`;

const UnderLineTitle = styled.span`
  border-bottom: 2px solid
    ${({
      theme: {
        palette: { primary }
      }
    }) => primary.main};
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui20};
  font-weight: ${({ theme }) => theme.typography.body2.weight.bold};
  word-break: break-all;
`;
const HighlightTitle = styled.span`
  color: ${({
    theme: {
      palette: { primary }
    }
  }) => primary.main};
`;

const GridBox = styled.div<{ isDisabled: boolean }>`
  display: ${({ isDisabled }) => (isDisabled ? 'none' : 'flex')};
  flex-wrap: wrap;
  /* grid-template-columns: repeat(3, 1fr); */
  margin: 32px 0;
  gap: 12px;
  /* min-height: 77vh; */
`;

const BrandChip = styled(Chip)`
  min-width: calc(33% - 9px);
  height: 94px;
  border: 2px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui95};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #eff2f7;
  overflow: hidden;
  & > div {
    width: 100%;
  }
  img {
    max-width: 50px;
  }
`;

const Img = styled.img`
  /* max-width: 43px; */
  /* height: auto; */
`;

export default SelectBrand;
