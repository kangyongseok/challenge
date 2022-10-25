import { FormEvent, useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Icon, Label, Typography } from 'mrcamel-ui';
import { debounce } from 'lodash-es';
import styled from '@emotion/styled';

import { CustomSearchBar, Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import LocalStorage from '@library/localStorage';
import ChannelTalk from '@library/channelTalk';
import { logEvent } from '@library/amplitude';

import { fetchModelSuggest } from '@api/model';

import queryKeys from '@constants/queryKeys';
import { CAMEL_SELLER } from '@constants/localStorage';
import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import type { CamelSellerLocalStorage } from '@typings/camelSeller';
import { showAppDownloadBannerState } from '@recoil/common';

function SelectLine() {
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [camelSeller, setCamelSeller] = useState<CamelSellerLocalStorage>();
  const { data: models, refetch } = useQuery(
    queryKeys.models.suggest(),
    () =>
      fetchModelSuggest({
        brandIds: [Number(camelSeller?.brand?.id)],
        categoryIds: [Number(camelSeller?.category.id)],
        keyword: searchValue || camelSeller?.brand?.name || ''
      }),
    {
      enabled: false,
      onSuccess(data) {
        logEvent(attrKeys.camelSeller.LOAD_KEYWORD_AUTO, {
          name: attrProperty.name.DONTKNOW_MODEL,
          title: attrProperty.title.MODEL,
          att: searchValue,
          count: data.length
        });
      }
    }
  );

  useEffect(() => {
    setCamelSeller(LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage);
    ChannelTalk.hideChannelButton();
  }, []);

  useEffect(() => {
    logEvent(attrKeys.camelSeller.VIEW_PRODUCT_MODEL, {
      name: attrProperty.name.DONTKNOW_MODEL
    });
  }, [camelSeller]);

  useEffect(() => {
    if (camelSeller) {
      if (!searchValue && camelSeller.modelSearchValue && inputRef.current) {
        setSearchValue(camelSeller.modelSearchValue);
        (inputRef.current.querySelector('input') as HTMLInputElement).value =
          camelSeller.modelSearchValue;
      }
      refetch();
    }
  }, [camelSeller, refetch, searchValue]);

  useEffect(() => {
    if (searchValue) {
      // if (isFocus) {
      //   window.scroll({
      //     top: 150,
      //     left: 0,
      //     behavior: 'smooth'
      //   });
      // }
      refetch();
    }
  }, [searchValue, refetch, isFocus]);

  const handleFocus = () => {
    setIsFocus(true);
    window.scroll({
      top: 150,
      left: 0,
      behavior: 'smooth'
    });
  };

  const handleClickSelect = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    logEvent(attrKeys.camelSeller.CLICK_MODEL, {
      name: attrProperty.name.DONTKNOW_MODEL,
      title: attrProperty.title.MODEL,
      att: target.dataset.modelName
    });

    LocalStorage.set(CAMEL_SELLER, {
      ...camelSeller,
      title: target.dataset.modelName,
      keyword: target.dataset.modelName,
      modelSearchValue: searchValue,
      subCategoryName: target.dataset.modelSubCategory
    });
    router.push('/camelSeller/registerConfirm');
  };

  const handleChange = debounce((e: FormEvent<HTMLInputElement>) => {
    const { value } = e.target as HTMLInputElement;
    setSearchValue(value);
  }, 500);

  const handleClickNext = () => {
    logEvent(attrKeys.camelSeller.CLICK_MODEL, {
      name: attrProperty.name.DONTKNOW_MODEL,
      title: attrProperty.title.SKIP
    });

    router.push('/camelSeller/registerConfirm');
  };

  return (
    <GeneralTemplate
      header={<Header showRight={false} />}
      footer={
        <FooterWrap>
          <TransParentGradian />
          <SkipCtaButton
            fullWidth
            variant="outlined"
            brandColor="primary"
            onClick={handleClickNext}
          >
            건너뛰기
          </SkipCtaButton>
        </FooterWrap>
      }
    >
      <Box
        customStyle={{
          marginTop: '32px'
          // display: searchValue && searchBrands?.length === 0 ? 'none' : 'block'
        }}
      >
        <Label
          variant="ghost"
          text={camelSeller?.category.name || ''}
          customStyle={{ marginBottom: 16 }}
        />
        <Typography variant="h3">
          <UnderLineTitle>{camelSeller?.brand?.name}</UnderLineTitle>의
        </Typography>
        <Typography variant="h2" weight="bold" customStyle={{ marginTop: 8 }}>
          <HighlightTitle>모델</HighlightTitle>을 알려주세요.
        </Typography>
      </Box>
      <StyledSearch showAppDownloadBanner={showAppDownloadBanner}>
        <SearchWrap isActive={!!(searchValue || isFocus)}>
          <CustomSearchBar
            fullWidth
            startIcon={<Icon name="SearchOutlined" />}
            placeholder="모델명 검색"
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={() => setIsFocus(false)}
            ref={inputRef}
            isBorder={false}
          />
        </SearchWrap>
      </StyledSearch>
      <GridBox>
        {models?.map((model) => (
          <ModelCard
            key={`select-line-${model.name}`}
            onClick={handleClickSelect}
            data-model-name={model.name}
            data-model-sub-category={model.subParentCategoryName}
          >
            <Img src={model.imageThumbnail} alt={model.name} />
            <Typography variant="small1" customStyle={{ padding: 8 }}>
              {model.name}
            </Typography>
          </ModelCard>
        ))}
      </GridBox>
    </GeneralTemplate>
  );
}

const FooterWrap = styled.div`
  position: fixed;
  width: 100%;
  height: 68px;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
`;

const StyledSearch = styled.div<{ showAppDownloadBanner: boolean }>`
  position: sticky;
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? 56 + APP_DOWNLOAD_BANNER_HEIGHT : 56}px;
  left: 0;
  z-index: 5;
  background: white;
  padding: 32px 0 20px 0;
`;

const SkipCtaButton = styled(Button)`
  width: calc(100% - 40px);
  height: 48px;
  margin: 0 20px;
`;

const UnderLineTitle = styled.span`
  border-bottom: 2px solid ${({ theme: { palette } }) => palette.primary.main};
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui20};
  font-weight: ${({ theme }) => theme.typography.body2.weight.bold};
`;
const HighlightTitle = styled.span`
  color: ${({ theme: { palette } }) => palette.primary.main};
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

const GridBox = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 15px 0 100px;
  gap: 12px;
  min-height: 77vh;
`;

const ModelCard = styled.div`
  border: 2px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui95};
  border-radius: 8px;
  overflow: hidden;
  height: 156px;
  text-align: center;
`;

const TransParentGradian = styled.div`
  position: fixed;
  left: 0;
  bottom: 68px;
  width: 100%;
  height: 52px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #ffffff 100%);
  -webkit-filter: blur(10px);
  filter: blur(10px);
  pointer-events: none;
`;

const Img = styled.img``;

export default SelectLine;
