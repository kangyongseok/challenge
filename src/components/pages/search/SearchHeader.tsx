import { useEffect, useState } from 'react';
import type { KeyboardEvent, RefObject } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, Icon, Input, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';

import updateAccessUserOnBraze from '@library/updateAccessUserOnBraze';
import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchKeywordsSuggest } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { SEARCH_TIME_FOR_EXIT_BOTTOM_SHEET } from '@constants/localStorage';
import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { searchAutoFocusState, searchValueState } from '@recoil/search';
import { showAppDownloadBannerState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useDebounce from '@hooks/useDebounce';

interface NewSearchHeaderProps {
  headerRef: RefObject<HTMLDivElement>;
}

function SearchHeader({ headerRef }: NewSearchHeaderProps) {
  const router = useRouter();

  const {
    typography: { h3 },
    palette: { common }
  } = useTheme();

  const [init, setInit] = useState(true);
  const [open, setOpen] = useState(false);

  const [value, setSearchValueState] = useRecoilState(searchValueState);

  const [searchValue, setSearchValue] = useState(value);

  const [autoFocus, setSearchAutoFocusState] = useRecoilState(searchAutoFocusState);
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  const { data: accessUser } = useQueryAccessUser();

  const debouncedSearchValue = useDebounce<string>(searchValue.replace(/-/g, ' '), 300);

  useQuery(queryKeys.products.keywordsSuggest(value), () => fetchKeywordsSuggest(value), {
    enabled: !!value,
    onSuccess: (response) => {
      logEvent(attrKeys.search.LOAD_KEYWORD_AUTO, {
        name: attrProperty.name.SEARCH,
        keyword: value,
        count: response.length
      });

      if (response.some(({ recommFilters }) => recommFilters && recommFilters.length > 0)) {
        logEvent(attrKeys.search.VIEW_RECOMMFILTER, {
          name: attrProperty.name.SEARCH,
          keyword: value
        });
      }
    }
  });

  const handleClick = () => {
    logEvent(attrKeys.search.CLICK_BACK, {
      name: attrProperty.name.SEARCH
    });
    router.back();
  };

  const handleChange = (e: KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (e.key === 'Enter') {
      logEvent(attrKeys.search.CLICK_SCOPE, { name: attrProperty.name.SEARCH });

      if (!value || !value.trim()) {
        logEvent(attrKeys.search.NOT_KEYWORD, { att: 'NO' });
        setOpen(true);
        return;
      }

      LocalStorage.set(SEARCH_TIME_FOR_EXIT_BOTTOM_SHEET, dayjs());

      if (accessUser) {
        updateAccessUserOnBraze({ ...accessUser, lastKeyword: value });
      }

      logEvent(attrKeys.search.SUBMIT_SEARCH, {
        name: attrProperty.name.SEARCH,
        title: attrProperty.title.SCOPE,
        type: attrProperty.type.INPUT,
        keyword: value
      });

      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.name.SEARCH,
        title: attrProperty.title.SCOPE,
        type: attrProperty.type.INPUT
      });

      router.push(`/products/search/${value}`);
    }
  };

  const handleClickClear = () => {
    setSearchValue('');
    setSearchValueState('');
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;

      const { clientHeight } = headerRef.current;

      if (!window.scrollY) {
        setInit(true);
        return;
      }

      if (showAppDownloadBanner && window.scrollY > clientHeight + APP_DOWNLOAD_BANNER_HEIGHT) {
        setInit(false);
      } else if (!showAppDownloadBanner && window.scrollY) {
        setInit(false);
      } else {
        setInit(true);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headerRef, showAppDownloadBanner]);

  useEffect(() => {
    setSearchAutoFocusState(false);
  }, [setSearchAutoFocusState]);

  useEffect(() => {
    setSearchValueState(debouncedSearchValue);
  }, [setSearchValueState, debouncedSearchValue]);

  return (
    <>
      <StyledNewSearchHeader
        ref={headerRef}
        showAppDownloadBanner={showAppDownloadBanner}
        init={init}
      >
        <Flexbox
          alignment="center"
          gap={12}
          customStyle={{
            padding: '6px 16px',
            backgroundColor: common.uiWhite
          }}
        >
          <Icon name="Arrow1BackOutlined" onClick={handleClick} />
          <Input
            type="search"
            fullWidth
            variant="solid"
            size="large"
            placeholder="어떤 명품을 득템해 볼까요?"
            autoFocus={autoFocus}
            onChange={(e) => setSearchValue(e.currentTarget.value)}
            onKeyUp={handleChange}
            onClick={() =>
              logEvent(attrKeys.search.CLICK_KEYWORD_INPUT, {
                name: attrProperty.name.SEARCH
              })
            }
            value={searchValue}
            endAdornment={
              searchValue ? (
                <Icon
                  name="DeleteCircleFilled"
                  width={20}
                  height={20}
                  color="ui80"
                  onClick={handleClickClear}
                />
              ) : undefined
            }
            customStyle={{
              gap: 8,
              borderColor: 'transparent',
              '& input[type="search"]::-webkit-search-decoration, input[type="search"]::-webkit-search-cancel-button, input[type="search"]::-webkit-search-results-button, input[type="search"]::-webkit-search-results-decoration':
                {
                  display: 'none'
                },
              '& input': {
                fontSize: h3.size,
                letterSpacing: h3.letterSpacing,
                lineHeight: h3.lineHeight,
                fontWeight: h3.weight.medium
              },
              '& input::placeholder': {
                fontWeight: h3.weight.regular,
                color: common.ui60
              }
            }}
          />
        </Flexbox>
      </StyledNewSearchHeader>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Typography weight="medium">
          <strong>앗!</strong> <br /> 검색 키워드를 입력해주세요 😭
        </Typography>
        <Button
          fullWidth
          variant="solid"
          brandColor="primary"
          customStyle={{ marginTop: 20 }}
          onClick={() => setOpen(false)}
        >
          확인
        </Button>
      </Dialog>
    </>
  );
}

const StyledNewSearchHeader = styled.header<{ showAppDownloadBanner: boolean; init: boolean }>`
  position: sticky;
  top: 0;
  transform: translateY(
    ${({ showAppDownloadBanner, init }) => {
      let translateY = 0;
      if (showAppDownloadBanner) {
        translateY = APP_DOWNLOAD_BANNER_HEIGHT;
      }
      if (init) {
        translateY = 0;
      }
      return translateY;
    }}px
  );
  transition: transform 0.5s;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  &:after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: ${({
      theme: {
        palette: { common }
      }
    }) => common.uiWhite};
  }
`;

export default SearchHeader;
