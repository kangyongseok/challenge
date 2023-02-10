import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { Box, Button, Dialog, Flexbox, Icon, Toast, Typography, useTheme } from 'mrcamel-ui';
import { debounce, find, isEmpty } from 'lodash-es';
import { QueryClient, dehydrate, useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import { Header, SearchBar } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { BrandInputFooter, HotBrandList, SearchBrandList } from '@components/pages/brandInput';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';
import { fetchBrandsSuggestWithCollabo } from '@api/brand';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';

import type { SelectedHotBrand } from '@typings/brands';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

function BrandInput() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);
  const [checkList, setCheckList] = useState<SelectedHotBrand[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectBrands, setSelectBrands] = useState<SelectedHotBrand[]>([]);
  const [toast, setToast] = useState(false);
  const {
    data = [],
    refetch,
    isPreviousData
  } = useQuery(
    queryKeys.brands.brandName(searchValue),
    () => fetchBrandsSuggestWithCollabo(searchValue),
    {
      enabled: false,
      keepPreviousData: true
    }
  );
  const { data: userInfo } = useQueryUserInfo();
  const [isEmptyBack, setIsEmptyBack] = useState(false);

  useEffect(() => {
    logEvent(attrKeys.userInput.VIEW_PERSONAL_INPUT, {
      name: 'BRAND'
    });
  }, []);

  useEffect(() => {
    if (inputRef.current && !router.query.searchMode) {
      const element = inputRef.current.querySelector('input');
      if (element) element.value = '';
    }
  }, [router]);

  useEffect(() => {
    if (userInfo) {
      const result = userInfo.personalStyle.brands.map((response) => {
        return {
          id: response.id,
          name: response.name
        };
      });
      if (checkList.length === 0) {
        setCheckList(result);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);

  useEffect(() => {
    if (searchValue) {
      refetch();
    }
  }, [refetch, searchValue]);

  const handleChecked = ({ id, name }: SelectedHotBrand) => {
    if (find(checkList, { id: Number(id) })) {
      const filterResult = checkList.filter((list) => list.id !== Number(id));
      setCheckList(filterResult);
      return;
    }

    if (checkList.length < 20) {
      setCheckList((props) => [...props, { id: Number(id), name }]);
      return;
    }

    setToast(true);
    setTimeout(() => {
      setToast(false);
    }, 3000);
  };

  const clearValue = () => {
    if (inputRef.current) {
      const element = inputRef.current.querySelector('input');
      if (element) element.value = '';
    }
  };

  const handleChange = debounce((e: ChangeEvent<HTMLInputElement>) => {
    if (checkList.length > 0) {
      setSelectBrands([]);
    }
    setSearchValue(e.target.value);
  }, 500);

  const handleFocus = () => {
    logEvent(attrKeys.userInput.CLICK_PERSONAL_INPUT, {
      name: 'BRAND',
      title: 'SEARCH'
    });
  };

  const handleNormalBack = () => {
    logEvent(attrKeys.userInput.CLICK_BACK, {
      name: 'BRAND_INPUT_SEARCH'
    });

    setSearchValue('');
    setSelectBrands([]);
    setIsEmptyBack(false);
    clearValue();
  };

  const handleSuccess = () => {
    logEvent(attrKeys.userInput.SUBMIT_PERSONAL_INPUT, {
      name: 'BRAND',
      title: 'INPUT_POPUP'
    });

    setCheckList(selectBrands);
    setIsEmptyBack(false);
    setSearchValue('');
    clearValue();
  };

  const handleBack = () => {
    if (selectBrands.length === 0 && router.query.searchMode) {
      handleNormalBack();
    }
    router.back();
  };

  return (
    <GeneralTemplate
      header={<Header hideTitle showRight={false} onClickLeft={handleBack} />}
      footer={
        <BrandInputFooter
          searchValue={searchValue}
          checkList={checkList}
          onClickLabel={handleChecked}
          selectBrands={selectBrands}
          setCheckList={setCheckList}
          setSearchValue={setSearchValue}
          clearValue={clearValue}
          setSelectBrands={setSelectBrands}
          setToast={setToast}
        />
      }
    >
      <Flexbox direction="vertical" customStyle={{ height: '100%', position: 'relative' }}>
        <FixedArea>
          <Box customStyle={{ marginBottom: 40 }}>
            <Typography
              variant="h3"
              brandColor="black"
              weight="bold"
              customStyle={{ textAlign: 'center', marginBottom: 6 }}
            >
              어떤 브랜드 좋아하세요?
            </Typography>
            <Typography variant="body1" customStyle={{ color: common.ui20, textAlign: 'center' }}>
              선택한 브랜드는 홈에서 모아볼 수 있어요.
            </Typography>
            <Typography variant="body2" customStyle={{ color: common.ui60, textAlign: 'center' }}>
              최대 20개 선택할 수 있어요.
            </Typography>
          </Box>
          <Box customStyle={{ position: 'relative', zIndex: 15 }}>
            <SearchBar
              ref={inputRef}
              fullWidth
              placeholder="브랜드명"
              onChange={handleChange}
              onFocus={handleFocus}
              startAdornment={<Icon name="SearchOutlined" color="black" size="medium" />}
            />
          </Box>
          {searchValue && !isPreviousData && (
            <SearchBrandList
              data={data}
              setSelectBrands={setSelectBrands}
              selectBrands={isEmpty(selectBrands) ? checkList : selectBrands}
            />
          )}
          {!searchValue && (
            <Typography weight="bold" variant="h4" customStyle={{ marginTop: 24 }}>
              인기 브랜드
            </Typography>
          )}
        </FixedArea>
        {!searchValue && <HotBrandList checkList={checkList} onClick={handleChecked} />}
      </Flexbox>
      <Toast onClose={() => setToast(false)} open={toast}>
        최대 20개만 선택할 수 있어요
      </Toast>
      <Dialog
        open={isEmptyBack}
        onClose={() => setIsEmptyBack(false)}
        customStyle={{ width: '100%', textAlign: 'center' }}
      >
        <Typography>
          <strong>&apos;선택완료&apos;</strong>를 눌러야
        </Typography>
        <Typography>브랜드 정보를 저장할 수 있어요.</Typography>
        <Flexbox alignment="center" gap={10} customStyle={{ marginTop: 20 }}>
          <Button
            fullWidth
            variant="outline"
            onClick={handleNormalBack}
            customStyle={{ height: 47 }}
          >
            그냥 뒤로가기
          </Button>
          <Button
            fullWidth
            variant="solid"
            brandColor="primary"
            onClick={handleSuccess}
            customStyle={{ height: 47 }}
          >
            선택완료
          </Button>
        </Flexbox>
      </Dialog>
    </GeneralTemplate>
  );
}

const FixedArea = styled.div`
  position: fixed;
  left: 0;
  width: 100%;
  padding: 0 20px 16px;
  z-index: 10;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
`;

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const queryClient = new QueryClient();

  Initializer.initAccessTokenByCookies(getCookies({ req }));
  Initializer.initAccessUserInQueryClientByCookies(getCookies({ req }), queryClient);

  if (req.cookies.accessToken) {
    await queryClient.prefetchQuery(queryKeys.users.userInfo(), fetchUserInfo);
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

export default BrandInput;
