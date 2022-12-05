import { useEffect, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Box, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { SearchHelperFixedBottomCTAButton } from '@components/pages/searchHelper';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import { APP_TOP_STATUS_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import { allSelectedSearchOptionsSelector } from '@recoil/searchHelper';

function AllOptions() {
  const router = useRouter();
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();
  const allSelectedSearchOptions = useRecoilValue(allSelectedSearchOptionsSelector);
  const [
    { brandLineCategoryLabels, sizeLabel, maxPriceLabel, moreLabels, platformLabel },
    setLabels
  ] = useState<{
    brandLineCategoryLabels: string[];
    sizeLabel: string;
    maxPriceLabel: string;
    moreLabels: string[];
    platformLabel: string;
  }>({
    brandLineCategoryLabels: [],
    sizeLabel: '',
    maxPriceLabel: '',
    moreLabels: [],
    platformLabel: ''
  });

  const handleClickLabel = (title: string) => () => {
    logEvent(attrKeys.searchHelper.CLICK_SEARCHHELPER, { title });
  };

  const handleClickNext = () => {
    logEvent(attrKeys.searchHelper.SUBMIT_SEARCHHELPER, { name: 'STEP3', att: 'YES' });
    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.productName.SEARCHHELPER,
      title: attrProperty.productTitle.SEARCHHELPER,
      type: attrProperty.productType.INPUT
    });
    router.replace('/searchHelper/searching');
  };

  useEffect(() => {
    setLabels({
      brandLineCategoryLabels: allSelectedSearchOptions.brandLineCategoryLabels,
      sizeLabel: allSelectedSearchOptions.sizeLabel,
      maxPriceLabel: allSelectedSearchOptions.maxPriceLabel,
      moreLabels: allSelectedSearchOptions.moreLabels,
      platformLabel: allSelectedSearchOptions.platformLabel
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box customStyle={{ paddingTop: isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0 }}>
      <SuccessLabelWrapper>
        <SuccessLabel variant="h4" weight="medium">
          100% 완료 👍
        </SuccessLabel>
      </SuccessLabelWrapper>
      <OptionBox>
        {brandLineCategoryLabels.map((option, index) => (
          <Link
            key={`brand-category-label-${option}`}
            href={`/searchHelper${
              brandLineCategoryLabels.length > 2 && index === 1
                ? '/lineBudgetMore'
                : '/brandCategorySize'
            }`}
            passHref
          >
            <a
              onClick={handleClickLabel(
                (index === 0 && 'BRAND') ||
                  (brandLineCategoryLabels.length > 2 && index === 1 && 'LINE') ||
                  'CATEGORY'
              )}
            >
              <CustomTypography
                variant="h2"
                weight="medium"
                customStyle={{
                  borderBottom: `4px solid ${primary.main}`,
                  marginRight: brandLineCategoryLabels.length !== index + 1 ? 8 : 0
                }}
              >
                {option}
              </CustomTypography>
            </a>
          </Link>
        ))}
        <CustomTypography
          variant="h2"
          weight="medium"
          customStyle={{ marginRight: 12, color: common.ui60 }}
        >
          의
        </CustomTypography>
        {sizeLabel.length > 0 && (
          <>
            <Link href="/searchHelper/brandCategorySize" passHref>
              <a onClick={handleClickLabel('SIZE')}>
                <CustomTypography
                  variant="h2"
                  weight="medium"
                  customStyle={{
                    borderBottom: `4px solid ${primary.main}`,
                    marginRight: 8
                  }}
                >
                  {sizeLabel}
                </CustomTypography>
              </a>
            </Link>
            <CustomTypography
              variant="h2"
              weight="medium"
              customStyle={{ marginRight: 12, color: common.ui60 }}
            >
              사이즈
            </CustomTypography>
          </>
        )}
        {maxPriceLabel?.length > 0 && (
          <>
            <Link href="/searchHelper/lineBudgetMore" passHref>
              <a onClick={handleClickLabel('BUDGET')}>
                <CustomTypography
                  variant="h2"
                  weight="medium"
                  customStyle={{
                    borderBottom: `4px solid ${primary.main}`,
                    marginRight: 8
                  }}
                >
                  {maxPriceLabel}
                </CustomTypography>
              </a>
            </Link>
            <CustomTypography
              variant="h2"
              weight="medium"
              customStyle={{ marginRight: 12, color: common.ui60 }}
            >
              이하
            </CustomTypography>
          </>
        )}
        {moreLabels.length > 0 && (
          <>
            {moreLabels.map((option, index) => (
              <Link key={`more-label-${option}`} href="/searchHelper/lineBudgetMore" passHref>
                <a onClick={handleClickLabel('MOREOPTION')}>
                  <CustomTypography
                    variant="h2"
                    weight="medium"
                    customStyle={{
                      borderBottom: `4px solid ${primary.main}`,
                      marginRight: moreLabels.length !== index + 1 ? 8 : 0
                    }}
                  >
                    {option}
                  </CustomTypography>
                </a>
              </Link>
            ))}
            <CustomTypography
              variant="h2"
              weight="medium"
              customStyle={{ marginRight: 12, color: common.ui60 }}
            >
              (으)로
            </CustomTypography>
          </>
        )}
        {platformLabel.length > 0 && (
          <>
            <Link href="/searchHelper/lineBudgetMore" passHref>
              <a onClick={handleClickLabel('MOREOPTION')}>
                <CustomTypography
                  variant="h2"
                  weight="medium"
                  customStyle={{ borderBottom: `4px solid ${primary.main}` }}
                >
                  {platformLabel}
                </CustomTypography>
              </a>
            </Link>
            <CustomTypography variant="h2" weight="medium" customStyle={{ color: common.ui60 }}>
              에서
            </CustomTypography>
          </>
        )}
      </OptionBox>
      <CustomTypography
        variant="h2"
        weight="medium"
        customStyle={{ padding: '16px 20px 187px', color: common.ui60 }}
      >
        매물 찾는게 맞으세요?
      </CustomTypography>
      <SearchHelperFixedBottomCTAButton showEnableEdit onClickNext={handleClickNext} />
    </Box>
  );
}

const SuccessLabelWrapper = styled.section`
  padding: 24px 0 80px;
  position: relative;
  overflow-x: hidden;
  white-space: pre;

  :after {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background-color: ${({
      theme: {
        palette: { common }
      }
    }) => common.uiWhite};
    transform: translateX(0%);
    animation: expandWidth 2s forwards;
  }

  @keyframes expandWidth {
    0% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

const SuccessLabel = styled(Typography)`
  margin: 0 auto;
  padding: 16px 32px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui20};
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  width: 159px;
  border-radius: 32px;
`;

const OptionBox = styled.section`
  display: flex;
  flex-wrap: wrap;
  padding: 0 20px;
  row-gap: 16px;
  transform: translateX(0);
`;

const CustomTypography = styled(Typography)`
  height: 36px;
`;

export default AllOptions;
