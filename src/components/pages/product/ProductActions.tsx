import { memo, useCallback, useEffect, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { Button, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import amplitude from 'amplitude-js';
import { useMutation } from '@tanstack/react-query';
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
import { checkAgent, commaNumber, executedShareURl, getRandomNumber } from '@utils/common';

import { dialogState, toastState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

type ReportType =
  | typeof REPORT_TYPE_FAKE_PRODUCT
  | typeof REPORT_TYPE_COUNTERFEITER
  | typeof REPORT_TYPE_SWINDLER
  | typeof REPORT_TYPE_PRICE;

interface ProductActionsProps {
  product?: Product;
  hasRoleSeller: boolean;
  isCamelSellerProduct: boolean;
  onClickSMS: ({
    siteId,
    sellerType,
    id,
    sellerPhoneNumber,
    conversionId
  }: {
    siteId?: number;
    sellerType?: number;
    id?: number;
    sellerPhoneNumber: string | null;
    conversionId?: number;
  }) => void;
}

function ProductActions({
  product,
  hasRoleSeller,
  isCamelSellerProduct,
  onClickSMS
}: ProductActionsProps) {
  const {
    theme: {
      palette: { primary, common }
    }
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

    productDetailAtt({
      key: attrKeys.products.CLICK_SHARE,
      product,
      source: attrProperty.productSource.PRODUCT_LIST
    });

    let viewPrice = product ? product.price / 10000 : 0;

    if (Number.isNaN(viewPrice)) {
      viewPrice = 0;
    }

    if (
      !executedShareURl({
        title: product.title,
        text: `${product.site.name} ${commaNumber(
          viewPrice - Math.floor(viewPrice) > 0
            ? Number(viewPrice.toFixed(1))
            : Math.floor(viewPrice)
        )}만원\r\nAi추천지수 ${product.scoreTotal}/10`,
        url: window.location.href,
        product
      })
    ) {
      setDialogState({ type: 'SNSShare', product });
    }
  };

  const handleClickSendSMS = useCallback(() => {
    if (!product) return;

    const conversionId = Number(`${dayjs().format('YYMMDDHHmmss')}${getRandomNumber()}`);

    productDetailAtt({
      key: attrKeys.products.CLICK_SEND_MESSAGE,
      product,
      rest: { att: 'SMS', conversionId, title: 'SMS', name: 'PRODUCT_LIST' }
    });
    onClickSMS({
      siteId: product.site?.id,
      sellerType: product.productSeller?.type,
      id: product.id,
      sellerPhoneNumber,
      conversionId
    });
  }, [onClickSMS, product, sellerPhoneNumber]);

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
    <ActionButtonWrap>
      <ActionButtons>
        {product && sellerPhoneNumber && !hasRoleSeller && (
          <ActionButton
            size="small"
            disabled={!product || !sellerPhoneNumber}
            onClick={handleClickSendSMS}
            sms
          >
            <Icon name="MessageFilled" customStyle={{ color: primary.light }} />
            <Typography weight="medium">문자보내기</Typography>
          </ActionButton>
        )}
        <ActionButton size="small" disabled={!product} onClick={handleClickShare}>
          <Icon name="ShareFilled" />
          <Typography weight="medium">공유</Typography>
        </ActionButton>
        {!isCamelSellerProduct && (
          <ActionButton size="small" disabled={!product} onClick={handleClickReport}>
            <Icon name="NotiFilled" />
            <Typography weight="medium">신고</Typography>
          </ActionButton>
        )}
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
              customStyle={{ color: reported || checked ? primary.main : 'inherit' }}
            >
              {(reported || checked) && (
                <Icon
                  name="CheckOutlined"
                  size="small"
                  customStyle={{ marginRight: 6, color: primary.main }}
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
            <Typography variant="body2" weight="medium" customStyle={{ color: common.ui60 }}>
              {count}
            </Typography>
          </ReportOption>
        ))}
        <Button
          fullWidth
          brandColor="black"
          variant="solid"
          customStyle={{ marginTop: 20 }}
          disabled={!hasCheckedReportOption}
          onClick={handleSubmitReport}
        >
          제출하기
        </Button>
      </ReportTooltip>
    </ActionButtonWrap>
  );
}

const ActionButtonWrap = styled.div`
  position: relative;
  left: -20px;
  border-top: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.bg02};
  border-bottom: 8px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.bg02};
  width: calc(100% + 40px);
  margin-top: 20px;
  padding: 10px 0;
`;

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
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui90};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  border-radius: 8px;
  padding: 20px 24px;
  top: 57px;
  width: 100%;
  visibility: ${({ open }) => (open ? 'visible' : 'hidden')};
  opacity: ${({ open }) => Number(open)};
  transition: all 225ms cubic-bezier(0, 0, 0.2, 1) 0ms;
  z-index: ${({ theme: { zIndex } }) => zIndex.button};

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
    border-color: transparent transparent transparent
      ${({
        theme: {
          palette: { common }
        }
      }) => common.uiWhite};
    border-image: initial;
    filter: drop-shadow(
      ${({
          theme: {
            palette: { common }
          }
        }) => common.ui90}
        1px 0px 0px
    );
    transform: rotate(270deg);
  }
`;

const ReportOption = styled(Typography)`
  padding: 8px 0;
  border-bottom: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui90};
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

const ActionButton = styled(Button)<{ sms?: boolean }>`
  border: none;
  div {
    color: ${({ theme: { palette }, sms }) => (sms ? palette.primary.light : palette.common.ui60)};
  }
  svg {
    color: ${({ theme: { palette }, sms }) => (sms ? palette.primary.light : palette.common.ui60)};
  }
`;

export default memo(ProductActions);
