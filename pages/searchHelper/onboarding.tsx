import { useEffect } from 'react';

import { useRecoilValue, useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Button, Image, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import GeneralTemplate from '@components/templates/GeneralTemplate';

import { logEvent } from '@library/amplitude';

import { IOS_SAFE_AREA_TOP } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import { searchParamsState, selectedSearchOptionsState } from '@recoil/searchHelper';
import { PortalConsumer } from '@provider/PortalProvider';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

function Onboarding() {
  const router = useRouter();
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();
  const { data: { info: { value: { gender = '' } = {} } = {} } = {} } = useQueryUserInfo();
  const { brand, parentCategory, subParentCategory } = useRecoilValue(selectedSearchOptionsState);
  const resetSearchParams = useResetRecoilState(searchParamsState);
  const resetSelectedSearchOptions = useResetRecoilState(selectedSearchOptionsState);

  const handleClickSearchHelper = () => {
    logEvent(attrKeys.searchHelper.CLICK_SEARCHHELPER, {
      name: 'ONBOARDING',
      att: 'START'
    });
    router.replace('/searchHelper/brandCategorySize');
  };

  const handleClickClose = () => {
    logEvent(attrKeys.searchHelper.CLICK_SEARCHHELPER, {
      name: 'ONBOARDING',
      att: 'CLOSE'
    });

    resetSearchParams();
    resetSelectedSearchOptions();

    const query: { subParentIds?: number[]; genders?: string[] } = {};

    if (gender.length && ['F', 'M'].includes(gender)) {
      query.genders = [gender === 'F' ? 'female' : 'male'];
    }

    if (brand.name.length > 0) {
      router.replace({
        pathname: `/products/brands/${brand.name}`,
        query
      });
      return;
    }

    if (parentCategory.name.length > 0) {
      if (subParentCategory.id > 0) {
        query.subParentIds = [subParentCategory.id];
      }

      router.push({
        pathname: `/products/categories/${parentCategory.name}`,
        query
      });
      return;
    }

    router.replace('/search');
  };

  useEffect(() => {
    logEvent(attrKeys.searchHelper.VIEW_SEARCHHELPER, { name: 'ONBOARDING' });
  }, []);

  return (
    <>
      <GeneralTemplate disablePadding hideAppDownloadBanner>
        <Box
          customStyle={{
            padding: `calc(${
              isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'
            } + 48px) 20px 116px`
          }}
        >
          <Typography
            variant="h2"
            weight="bold"
            customStyle={{ '& > span': { color: primary.main } }}
          >
            득템까지 책임질 <span>검색집사</span>
          </Typography>
          <Typography
            variant="h4"
            weight="medium"
            customStyle={{ color: common.ui60, marginTop: 4 }}
          >
            알려주신 조건에 맞게 집사처럼 꿀매물
            <br />
            대신 찾아다 드릴거에요!
          </Typography>
        </Box>
        <Image src="/images/searchHelperWelcome.png" alt="Search Helper Welcome Img" />
      </GeneralTemplate>
      <PortalConsumer>
        <ButtonGroups>
          <Button
            variant="solid"
            size="large"
            brandColor="primary"
            fullWidth
            onClick={handleClickSearchHelper}
          >
            도와주세요, 검색집사!
          </Button>
          <Button variant="outline" size="large" fullWidth onClick={handleClickClose}>
            직접 찾을게요
          </Button>
        </ButtonGroups>
      </PortalConsumer>
    </>
  );
}

const ButtonGroups = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 0 20px 30px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};

  button + button {
    margin-top: 8px;
  }
`;

export default Onboarding;
