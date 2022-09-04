import { memo, useCallback, useEffect, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useMutation } from 'react-query';
import { Box, Button, CtaButton, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import amplitude from 'amplitude-js';
import styled from '@emotion/styled';

import type { Product } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { postSellerReport } from '@api/product';

import { INITIAL_REPORT_OPTIONS } from '@constants/product';
import type {
  REPORT_TYPE_COUNTERFEITER,
  REPORT_TYPE_FAKE_PRODUCT,
  REPORT_TYPE_PRICE,
  REPORT_TYPE_SWINDLER
} from '@constants/product';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { productDetailAtt } from '@utils/products';
import { getRandomNumber } from '@utils/common';
import checkAgent from '@utils/checkAgent';

import { dialogState, toastState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

type ReportType =
  | typeof REPORT_TYPE_FAKE_PRODUCT
  | typeof REPORT_TYPE_COUNTERFEITER
  | typeof REPORT_TYPE_SWINDLER
  | typeof REPORT_TYPE_PRICE;

interface ProductActionsProps {
  product?: Product;
  onClickSMS: ({
    siteId,
    sellerType,
    id,
    sellerPhoneNumber
  }: {
    siteId?: number;
    sellerType?: number;
    id?: number;
    sellerPhoneNumber: string | null;
  }) => void;
}

function ProductActions({ product, onClickSMS }: ProductActionsProps) {
  const {
    theme: { palette }
  } = useTheme();
  const { data: accessUser } = useQueryAccessUser();
  const setToastState = useSetRecoilState(toastState);
  const setDialogState = useSetRecoilState(dialogState);
  const [isOpenReportTooltip, setIsOpenReportTooltip] = useState(false);
  const { mutate: postSellerReportMutate } = useMutation(postSellerReport);
  const [reportOptions, setReportOptions] = useState(INITIAL_REPORT_OPTIONS);
  const sellerPhoneNumber =
    (checkAgent.isIOSApp() || checkAgent.isAndroidApp() || !checkAgent.isMobileApp()) && product
      ? product.productSeller.phone
      : null;
  const hasCheckedReportOption = Object.values(reportOptions).some(({ checked }) => checked);

  const handleClickShare = () => {
    if (!product) return;

    const url = window.location.href;

    productDetailAtt({
      key: attrKeys.products.CLICK_SHARE,
      product,
      source: attrProperty.productSource.PRODUCT_LIST
    });

    if (checkAgent.isAndroidApp() && window.AndroidShareHandler) {
      window.AndroidShareHandler.share(url);
      return;
    }

    if (
      ['android', 'iphone', 'ipad', 'ipod'].some((platfrom) =>
        navigator.userAgent.toLowerCase().indexOf(platfrom)
      )
    ) {
      if (navigator.share) {
        navigator.share({ text: product.title, url });
        return;
      }

      if (checkAgent.isAndroidApp() && window.webview && window.webview.callShareProduct) {
        window.webview.callShareProduct(url, JSON.stringify(product));
        return;
      }

      if (
        checkAgent.isIOSApp() &&
        window.webkit &&
        window.webkit.messageHandlers &&
        window.webkit.messageHandlers.callShareProduct
      ) {
        window.webkit.messageHandlers.callShareProduct.postMessage(
          JSON.stringify({ url, product })
        );
        return;
      }
    }

    setDialogState({ type: 'SNSShare', product });
  };

  const handleClickReport = useCallback(() => {
    setIsOpenReportTooltip(!isOpenReportTooltip);
    if (!isOpenReportTooltip && product) {
      logEvent(attrKeys.products.CLICK_REPORT, {
        name: attrProperty.productName.PRODUCT_DETAIL,
        id: product.id,
        brand: product.brand.name,
        category: product.category.name,
        line: product.line
      });
    }
    if (isOpenReportTooltip) {
      setReportOptions((prevState) => {
        const newReportOptions = { ...prevState };
        Object.keys(prevState).forEach((reportType) => {
          newReportOptions[Number(reportType) as ReportType].checked = false;
        });

        return newReportOptions;
      });
    }
  }, [isOpenReportTooltip, product]);

  const handleClickReportOption =
    ({ reported, checked, type }: { reported: boolean; checked: boolean; type: number }) =>
    () => {
      if (reported || checked) return;
      logEvent(attrKeys.products.SELECT_REPORT, {
        name: attrProperty.productName.PRODUCT_DETAIL,
        value: type
      });
      setReportOptions((prevState) => {
        const newReportOptions = { ...prevState };
        Object.keys(prevState).forEach((reportType) => {
          const convertedReportType = Number(reportType) as ReportType;
          newReportOptions[convertedReportType].checked = convertedReportType === type;
        });

        return newReportOptions;
      });
    };

  const handleSubmitReport = async () => {
    if (!hasCheckedReportOption || !product) return;

    const checkedReportOption = Object.entries(reportOptions).find(([_, { checked }]) => checked);

    if (checkedReportOption) {
      const reportType = Number(checkedReportOption[0]);

      logEvent(attrKeys.products.CLICK_REPORTSUBMIT, {
        name: attrProperty.productName.PRODUCT_DETAIL,
        id: product.id,
        brand: product.brand.name,
        category: product.category.name,
        line: product.line,
        value: reportType
      });
      postSellerReportMutate(
        {
          reportType,
          productId: product.id,
          deviceId: amplitude.getInstance().getDeviceId()
        },
        {
          onSuccess: () => {
            setReportOptions((prevState) => {
              const newState = { ...prevState };
              newState[reportType as ReportType].reported = true;
              newState[reportType as ReportType].count += 1;

              return newState;
            });
            setToastState({
              type: 'product',
              status: 'successReport',
              hideDuration: 1500
            });
          }
        }
      );
    }
  };

  useEffect(() => {
    if (product) {
      const { id, productSeller } = product;

      const initReportOptions = reportOptions;

      productSeller?.productSellerReports
        .filter((report) => report.sellerId === productSeller.id && report.productId === id)
        .forEach((report) => {
          if (report.type) {
            const reportType = report.type as keyof typeof INITIAL_REPORT_OPTIONS;
            initReportOptions[reportType].count += 1;

            if (
              report.userId === accessUser?.userId ||
              report.deviceId === amplitude.getInstance().getDeviceId()
            ) {
              initReportOptions[reportType].reported = true;
            }
          }
        });

      setReportOptions(initReportOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessUser?.userId, product]);

  return (
    <Box customStyle={{ position: 'relative' }}>
      <ActionButtons>
        <Button
          variant="ghost"
          brandColor="black"
          size="small"
          disabled={!product || !sellerPhoneNumber}
          onClick={
            product
              ? () => {
                  const conversionId = Number(
                    `${dayjs().format('YYMMDDHHmmss')}${getRandomNumber()}`
                  );
                  productDetailAtt({
                    key: 'CLICK_SEND_MESSAGE',
                    product,
                    rest: { att: 'SMS', conversionId }
                  });
                  onClickSMS({
                    siteId: product.site?.id,
                    sellerType: product.productSeller?.type,
                    id: product.id,
                    sellerPhoneNumber
                  });
                }
              : undefined
          }
        >
          <Typography variant="body2" weight="medium" customStyle={{ whiteSpace: 'nowrap' }}>
            문자보내기
          </Typography>
        </Button>
        <Button
          variant="ghost"
          brandColor="black"
          size="small"
          disabled={!product}
          onClick={handleClickShare}
        >
          <Typography variant="body2" weight="medium" customStyle={{ whiteSpace: 'nowrap' }}>
            공유하기
          </Typography>
        </Button>
        <Button
          variant="ghost"
          brandColor="black"
          size="small"
          disabled={!product}
          onClick={handleClickReport}
        >
          <Typography variant="body2" weight="medium" customStyle={{ whiteSpace: 'nowrap' }}>
            신고하기
          </Typography>
        </Button>
      </ActionButtons>
      <ReportTooltip open={isOpenReportTooltip}>
        {Object.values(reportOptions).map(({ type, label, count, checked, reported }) => (
          <ReportOption
            key={`report-option-${type}`}
            variant="body1"
            weight={reported || checked ? 'bold' : 'medium'}
            onClick={handleClickReportOption({ reported, checked, type })}
          >
            <Flexbox
              alignment="center"
              customStyle={{ color: reported || checked ? palette.primary.main : 'inherit' }}
            >
              {(reported || checked) && (
                <Icon
                  name="CheckOutlined"
                  size="small"
                  customStyle={{ marginRight: 6, color: palette.primary.main }}
                />
              )}
              <Typography
                variant="body1"
                weight={reported || checked ? 'bold' : 'medium'}
                brandColor={reported || checked ? 'primary' : 'black'}
              >
                {label}
              </Typography>
            </Flexbox>
            <Typography
              variant="small1"
              weight="medium"
              customStyle={{ color: palette.common.grey['60'] }}
            >
              {count}
            </Typography>
          </ReportOption>
        ))}
        <CtaButton
          fullWidth
          brandColor="black"
          variant="contained"
          customStyle={{ marginTop: 20 }}
          disabled={!hasCheckedReportOption}
          onClick={handleSubmitReport}
        >
          제출하기
        </CtaButton>
      </ReportTooltip>
    </Box>
  );
}

const ActionButtons = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 6px;

  button {
    width: 100%;
  }
`;

const ReportTooltip = styled.div<{ open: boolean }>`
  position: absolute;
  border: 1px solid ${({ theme }) => theme.palette.common.grey['90']};
  background-color: ${({ theme }) => theme.palette.common.white};
  border-radius: 8px;
  padding: 20px 24px;
  top: 57px;
  width: 100%;
  visibility: ${({ open }) => (open ? 'visible' : 'hidden')};
  opacity: ${({ open }) => Number(open)};
  transition: all 225ms cubic-bezier(0, 0, 0.2, 1) 0ms;

  :before {
    content: '';
    position: absolute;
    top: -19px;
    right: 40px;
    width: 0;
    height: 0;
    z-index: 1;
    border-width: 12px 0 12px 15px;
    border-style: solid;
    border-color: transparent transparent transparent rgb(255, 255, 255);
    border-image: initial;
    filter: drop-shadow(rgb(221, 221, 221) 1px 0px 0px);
    transform: rotate(270deg);
  }
`;

const ReportOption = styled(Typography)`
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.palette.common.grey['90']};
  display: flex;
  justify-content: space-between;

  :first-of-type {
    padding: 0 0 8px;
  }
  :last-of-type {
    border-bottom: none;
    padding: 8px 0 0;
  }
`;

export default memo(ProductActions);
