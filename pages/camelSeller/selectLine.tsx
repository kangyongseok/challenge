import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';

import { useRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Icon, Label, Typography, useTheme } from 'mrcamel-ui';
import { debounce } from 'lodash-es';
import styled from '@emotion/styled';

import { CustomSearchBar, Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import type { Models } from '@dto/model';

import LocalStorage from '@library/localStorage';
import ChannelTalk from '@library/channelTalk';
import { logEvent } from '@library/amplitude';

import { fetchModelSuggest } from '@api/model';

import queryKeys from '@constants/queryKeys';
import { SELLER_PROCESS_TYPE } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { camelSellerTempSaveDataState } from '@recoil/camelSeller';

function SelectLine() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const { query, push } = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [tempData, setTempData] = useRecoilState(camelSellerTempSaveDataState);
  const { data: models, refetch } = useQuery(
    queryKeys.models.suggest({
      brandIds: [Number(query.brandIds)],
      categoryIds: [Number(query.categoryIds)],
      keyword: searchValue || (query.brandName as string) || ''
    }),
    () =>
      fetchModelSuggest({
        brandIds: [Number(query.brandIds)],
        categoryIds: [Number(query.categoryIds)],
        keyword: searchValue || (query.brandName as string) || ''
      }),
    {
      enabled: !!(searchValue || query.brandName),
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
    ChannelTalk.hideChannelButton();
    logEvent(attrKeys.camelSeller.VIEW_PRODUCT_MODEL, {
      name: attrProperty.name.DONTKNOW_MODEL
    });
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch, searchValue]);

  const handleFocus = () => {
    setIsFocus(true);
    window.scroll({
      top: 150,
      left: 0,
      behavior: 'smooth'
    });
  };

  const handleClickSelect = (model: Models) => {
    logEvent(attrKeys.camelSeller.CLICK_MODEL, {
      name: attrProperty.name.DONTKNOW_MODEL,
      title: attrProperty.title.MODEL,
      att: model.name
    });
    LocalStorage.remove(SELLER_PROCESS_TYPE);
    setTempData({
      ...tempData,
      title: model.name as string,
      quoteTitle: model.name as string
    });

    push({
      pathname: '/camelSeller/registerConfirm',
      query: {
        ...query,
        title: model.name,
        brandIds: model.tmpBrands.map((brands) => brands.id),
        categoryIds: model.tmpCategories.map((category) => category.id)
      }
    });
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
    LocalStorage.set(SELLER_PROCESS_TYPE, 'true');
    push({
      pathname: '/camelSeller/registerConfirm',
      query: {
        ...query,
        title: `${query.brandName} ${query.categoryName}`
      }
    });
  };

  return (
    <GeneralTemplate
      hideAppDownloadBanner
      subset
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
        }}
      >
        <Label
          variant="ghost"
          text={(query.categoryName as string) || ''}
          customStyle={{ marginBottom: 16 }}
        />
        <Typography variant="h3">
          <UnderLineTitle>{query.brandName}</UnderLineTitle>의
        </Typography>
        <Typography variant="h2" weight="bold" customStyle={{ marginTop: 8 }}>
          <HighlightTitle>모델</HighlightTitle>을 알려주세요.
        </Typography>
        <Typography customStyle={{ color: common.ui60, marginTop: 8 }}>
          보유한 명품과 비슷한 모델을 골라주세요.
        </Typography>
      </Box>
      <StyledSearch>
        <SearchWrap isActive={!!(searchValue || isFocus)}>
          <CustomSearchBar
            fullWidth
            startIcon={<Icon name="SearchOutlined" />}
            placeholder="모델명 검색"
            onChange={handleChange}
            onClick={() => {
              logEvent(attrKeys.camelSeller.CLICK_MODEL_SEARCH, {
                name: attrProperty.name.PRODUCT_MODEL,
                title: attrProperty.title.DONTKNOW_MODEL
              });
            }}
            onFocus={handleFocus}
            onBlur={() => setIsFocus(false)}
            ref={inputRef}
            isBorder={false}
          />
        </SearchWrap>
      </StyledSearch>
      <GridBox>
        {models?.map((model) => (
          <ModelCard key={`select-line-${model.name}`} onClick={() => handleClickSelect(model)}>
            <Flexbox
              customStyle={{ width: '100%', height: 100 }}
              alignment="center"
              justifyContent="center"
            >
              <Img src={model.imageThumbnail} alt={model.name} />
            </Flexbox>
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

const StyledSearch = styled.div`
  position: sticky;
  top: 56px;
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
