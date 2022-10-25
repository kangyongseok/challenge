import { useEffect } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { QueryClient, dehydrate, useMutation } from 'react-query';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { Box, Button, Flexbox, Typography } from 'mrcamel-ui';
import filter from 'lodash-es/filter';
import styled from '@emotion/styled';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { SizeInputSearch, SizeInputType } from '@components/pages/sizeInput';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchUserInfo, postUserSize } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import type { SelectSize } from '@typings/user';
import atom from '@recoil/users';
import { showAppDownloadBannerState } from '@recoil/common';

function SizeInput() {
  const router = useRouter();
  const { mutateAsync } = useMutation(postUserSize);
  const [searchModeType, atomSearchModeType] = useRecoilState(atom.searchModeTypeState);
  const [selectedSizes, atomSelectedSize] = useRecoilState(atom.selectedSizeState);
  const [tempSelected, atomTempSelected] = useRecoilState(atom.tempSelectedState);
  const [searchModeDisabled] = useRecoilState(atom.searchModeDisabledState);
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  useEffect(() => {
    logEvent(attrKeys.userInput.VIEW_PERSONAL_INPUT, {
      name: 'SIZE'
    });
    return () => atomSelectedSize([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBack = () => {
    if (searchModeType.kind) {
      atomSearchModeType({
        kind: '',
        parentCategoryId: 0
      });
      return;
    }
    router.back();
  };

  const handleSelectSuccess = () => {
    if (searchModeType.kind) {
      const filterData = filter(tempSelected, { kind: searchModeType.kind });
      const result = filterData.map((info) => (info as SelectSize).categorySizeId);
      logEvent(attrKeys.userInput.SUBMIT_PERSONAL_INPUT, {
        name: 'SIZE',
        att: (searchModeType.kind as string).toUpperCase(),
        title: 'SEARCH',
        options: result
      });

      atomSelectedSize(tempSelected);
      atomTempSelected([]);
      atomSearchModeType({
        kind: '',
        parentCategoryId: 0
      });
    }
  };

  const handleClickSave = async () => {
    const filterTop = selectedSizes
      .filter((info) => info.kind === 'tops')
      .map((info) => info.categorySizeId);
    const filterBottom = selectedSizes
      .filter((info) => info.kind === 'bottoms')
      .map((info) => info.categorySizeId);
    const filterShoes = selectedSizes
      .filter((info) => info.kind === 'shoes')
      .map((info) => info.categorySizeId);

    const resultObj = [
      {
        sizeType: 'top',
        categorySizeIds: filterTop
      },
      {
        sizeType: 'bottom',
        categorySizeIds: filterBottom
      },
      {
        sizeType: 'shoes',
        categorySizeIds: filterShoes
      }
    ];

    logEvent(attrKeys.userInput.SUBMIT_PERSONAL_INPUT, {
      name: 'SIZE',
      title: 'SAVE',
      options: [...filterTop, ...filterBottom, ...filterShoes]
    });

    const result = resultObj.map((obj) => {
      return mutateAsync(obj, {
        onSuccess: () => {
          router.back();
        }
      });
    });
    await Promise.all(result);
  };

  const buttonDisabled = (): boolean => {
    if (searchModeType.kind) {
      return !searchModeDisabled;
    }
    if (!searchModeType.kind) {
      return selectedSizes.length === 0;
    }
    return true;
  };

  return (
    <GeneralTemplate
      header={<Header hideTitle showRight={false} onClickLeft={handleBack} />}
      footer={
        <Box customStyle={{ minHeight: 120 }}>
          <FooterFixed alignment="center" justifyContent="center">
            <Button
              fullWidth
              variant="contained"
              brandColor="primary"
              size="large"
              onClick={searchModeType.kind ? handleSelectSuccess : handleClickSave}
              disabled={buttonDisabled()}
            >
              {searchModeType.kind ? '선택완료' : '저장'}
            </Button>
          </FooterFixed>
        </Box>
      }
    >
      <PageHaederFlex gap={6} direction="vertical" showAppDownloadBanner={showAppDownloadBanner}>
        <Typography variant="h3" weight="bold" brandColor="black">
          사이즈가 어떻게 되세요?
        </Typography>
        <Typography variant="body1">저장한 사이즈 매물만 모아볼 수 있어요.</Typography>
      </PageHaederFlex>
      {!searchModeType.kind && <SizeInputType />}
      {searchModeType.kind && <SizeInputSearch />}
    </GeneralTemplate>
  );
}

const PageHaederFlex = styled(Flexbox)<{ showAppDownloadBanner: boolean }>`
  width: 100%;
  height: 90px;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  position: fixed;
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? 56 + APP_DOWNLOAD_BANNER_HEIGHT : 56}px;
  left: 0;
  padding-top: 18px;
  text-align: center;
  z-index: 100;
`;

const FooterFixed = styled(Flexbox)`
  width: 100%;
  height: 92px;
  padding: 0 20px;
  position: fixed;
  bottom: 0;
  left: 0;
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
`;

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const queryClient = new QueryClient();

  Initializer.initAccessTokenByCookies(req.cookies);
  Initializer.initAccessUserInQueryClientByCookies(req.cookies, queryClient);

  if (req.cookies.accessToken) {
    await queryClient.prefetchQuery(queryKeys.users.userInfo(), fetchUserInfo);
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

export default SizeInput;
