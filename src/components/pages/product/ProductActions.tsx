import { useCallback, useEffect, useState } from 'react';

import { Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import amplitude from 'amplitude-js';

import { Gap } from '@components/UI/atoms';

import type { Product } from '@dto/product';

import { INITIAL_REPORT_OPTIONS } from '@constants/product';
import attrKeys from '@constants/attrKeys';

import { productDetailAtt } from '@utils/products';
import { checkAgent, getRandomNumber } from '@utils/common';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

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

function ProductActions({ product, hasRoleSeller, onClickSMS }: ProductActionsProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const { data: accessUser } = useQueryAccessUser();

  const [reportOptions, setReportOptions] = useState(INITIAL_REPORT_OPTIONS);
  const sellerPhoneNumber =
    (checkAgent.isIOSApp() || checkAgent.isAndroidApp() || !checkAgent.isMobileApp()) && product
      ? product.productSeller.phone
      : null;

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

  if (product && sellerPhoneNumber && !hasRoleSeller) {
    return (
      <>
        <Flexbox
          justifyContent="center"
          customStyle={{
            width: 'calc(100% + 40px)',
            margin: '20px -20px 0',
            padding: 16,
            borderTop: `1px solid ${common.line02}`
          }}
        >
          <Flexbox gap={4} alignment="center" onClick={handleClickSendSMS}>
            <Icon name="PhoneFilled" color={common.ui60} />
            <Typography
              customStyle={{
                color: common.ui60
              }}
            >
              판매자에게 문자보내기
            </Typography>
          </Flexbox>
        </Flexbox>
        <Gap
          height={8}
          customStyle={{
            width: 'calc(100% + 40px)',
            margin: '0 -20px'
          }}
        />
      </>
    );
  }

  return (
    <Gap
      height={8}
      customStyle={{
        width: 'calc(100% + 40px)',
        margin: '20px -20px 0'
      }}
    />
  );
}

export default ProductActions;
