import { memo, useEffect, useState } from 'react';

import { useMutation } from 'react-query';
import {
  Box,
  Button,
  CtaButton,
  Dialog,
  Flexbox,
  Icon,
  Toast,
  Typography,
  useTheme
} from 'mrcamel-ui';
import dayjs from 'dayjs';
import styled from '@emotion/styled';

import type { Product } from '@dto/product';

import Amplitude, { logEvent } from '@library/amplitude';

import { postSellerReport } from '@api/product';

import { INITIAL_REPORT_OPTIONS } from '@constants/product';
import type {
  REPORT_TYPE_COUNTERFEITER,
  REPORT_TYPE_FAKE_PRODUCT,
  REPORT_TYPE_PRICE,
  REPORT_TYPE_SWINDLER
} from '@constants/product';
import { FACEBOOK_SHARE_URL, TWITTER_SHARE_URL } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { scrollDisable, scrollEnable } from '@utils/scroll';
import { productDetailAtt } from '@utils/products';
import { copyToClipboard, getRandomNumber } from '@utils/common';
import commaNumber from '@utils/commaNumber';
import checkAgent from '@utils/checkAgent';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

type SocialPlatform = 'kakao' | 'facebook' | 'twitter' | 'linkCopy';
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
  const [{ isOpenSuccessCopyToast, isOpenSuccessReportToast }, setIsOpenToast] = useState({
    isOpenSuccessCopyToast: false,
    isOpenSuccessReportToast: false
  });
  const [isOpenReportTooltip, setIsOpenReportTooltip] = useState(false);
  const { mutate: postSellerReportMutate } = useMutation(postSellerReport);
  const [reportOptions, setReportOptions] = useState(INITIAL_REPORT_OPTIONS);
  const [isOpenSNSSharePopup, setIsOpenSNSSharePopup] = useState(false);
  const sellerPhoneNumber =
    (checkAgent.isIOSApp() || checkAgent.isAndroidApp() || !checkAgent.isMobileApp()) && product
      ? product.productSeller.phone
      : null;
  const hasCheckedReportOption = Object.values(reportOptions).some(({ checked }) => checked);

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
              report.deviceId === Amplitude.getClient()?.getDeviceId()
            ) {
              initReportOptions[reportType].reported = true;
            }
          }
        });

      setReportOptions(initReportOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessUser?.userId, product]);

  useEffect(() => {
    if (isOpenSNSSharePopup) {
      scrollDisable();
    } else {
      scrollEnable();
    }

    return () => scrollEnable();
  }, [isOpenSNSSharePopup]);

  const handleClickShare = () => {
    if (!product) return;

    const url = window.location.href;

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
        navigator
          .share({ text: product.title, url })
          .then(() => console.log('Successful share'))
          .catch((error) => console.log('Error sharing', error));
        return;
      }

      if (checkAgent.isAndroidApp() && window.webview.callShareProduct) {
        window.webview.callShareProduct(url, JSON.stringify(product));
        return;
      }

      if (checkAgent.isIOSApp() && window.webkit.messageHandlers?.callShareProduct) {
        window.webkit.messageHandlers.callShareProduct.postMessage(
          JSON.stringify({ url, product })
        );
        return;
      }
    }

    setIsOpenSNSSharePopup(true);
  };

  const handleClickReport = () => {
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
  };

  const handleClickShareIcon = (platform: SocialPlatform) => () => {
    if (!product) return;

    const url = `${window.location.origin}/product/${product.id}`;
    let viewPrice = product.price / 10000;

    const title = () => {
      switch (platform) {
        case 'kakao':
          return 'KATALK';
        case 'facebook':
          return 'FB';
        case 'twitter':
          return 'TWITTER';
        default:
          return 'URL';
      }
    };

    productDetailAtt({
      key: attrKeys.products.CLICK_SHARE,
      product,
      rest: { title: title() },
      source: attrProperty.productSource.PRODUCT_LIST
    });

    switch (platform) {
      case 'kakao':
        if (window.Kakao === undefined) {
          return;
        }

        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(process.env.KAKAO_JS_KEY);
        }

        if (Number.isNaN(viewPrice)) {
          viewPrice = 0;
        }

        if (viewPrice - Math.floor(viewPrice) > 0) {
          viewPrice = Number(viewPrice.toFixed(1));
        } else {
          viewPrice = Math.floor(viewPrice);
        }

        window.Kakao.Link.sendDefault({
          objectType: 'feed',
          content: {
            title: product.title,
            description: `${product.site.name} ${commaNumber(viewPrice)}만원\r\nAi추천지수 ${
              product.scoreTotal
            }/10`,
            imageUrl: product.imageMain,
            link: {
              mobileWebUrl: url,
              webUrl: url
            }
          }
        });

        break;
      case 'facebook':
        window.open(`${FACEBOOK_SHARE_URL}?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`${TWITTER_SHARE_URL}?text=${product.title}&url=${encodeURIComponent(url)}`);
        break;
      case 'linkCopy':
      default:
        copyToClipboard(`${product.title} ${url}`);
        setIsOpenToast((prevState) => ({ ...prevState, isOpenSuccessCopyToast: true }));
        setIsOpenSNSSharePopup(false);
        break;
    }
  };

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
          deviceId: Amplitude.getClient()?.getDeviceId()
        },
        {
          onSuccess: () => {
            setReportOptions((prevState) => {
              const newState = { ...prevState };
              newState[reportType as ReportType].reported = true;
              newState[reportType as ReportType].count += 1;

              return newState;
            });
            setIsOpenToast((prevState) => ({ ...prevState, isOpenSuccessReportToast: true }));
          }
        }
      );
    }
  };

  return (
    <>
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
      <Dialog open={isOpenSNSSharePopup} onClose={() => setIsOpenSNSSharePopup(false)}>
        <Box customStyle={{ float: 'right', marginRight: -4 }}>
          <Icon name="CloseOutlined" onClick={() => setIsOpenSNSSharePopup(false)} />
        </Box>
        <Typography
          variant="body1"
          weight="medium"
          customStyle={{ textAlign: 'center', marginTop: 16 }}
        >
          공유하기
        </Typography>
        {/* TODO: 아이콘 파일 확인 */}
        <Flexbox
          justifyContent="center"
          gap={16}
          customStyle={{ margin: '16px 20px 16px', flexWrap: 'wrap' }}
        >
          {[
            { platform: 'kakao', backgroundPosition: '-297px -66px' },
            { platform: 'facebook', backgroundPosition: '-240px -122px' },
            { platform: 'twitter', backgroundPosition: '-356px -122px' },
            { platform: 'linkCopy', backgroundPosition: '-297px -122px' }
          ].map(({ platform, backgroundPosition }) => (
            <Box
              key={`share-platform-${platform}`}
              onClick={handleClickShareIcon(platform as SocialPlatform)}
            >
              <SNSIcon
                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/ico/fullpage_ico.png`}
                backgroundPosition={backgroundPosition}
              />
            </Box>
          ))}
        </Flexbox>
      </Dialog>
      <Toast
        open={isOpenSuccessCopyToast}
        onClose={() =>
          setIsOpenToast((prevState) => ({ ...prevState, isOpenSuccessCopyToast: false }))
        }
        bottom="50%"
        autoHideDuration={1500}
      >
        <Typography variant="body1" weight="medium" customStyle={{ color: palette.common.white }}>
          URL이 복사 되었어요.
        </Typography>
      </Toast>
      <Toast
        open={isOpenSuccessReportToast}
        onClose={() =>
          setIsOpenToast((prevState) => ({ ...prevState, isOpenSuccessReportToast: false }))
        }
        bottom="50%"
        autoHideDuration={1500}
      >
        <Typography variant="body1" weight="medium" customStyle={{ color: palette.common.white }}>
          감사합니다! 신고 접수 완료되었습니다 😇
        </Typography>
      </Toast>
    </>
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

const SNSIcon = styled.span<{ src: string; backgroundPosition: string }>`
  display: inline-block;
  width: 33px;
  height: 33px;
  background-image: url(${({ src }) => src});
  background-repeat: no-repeat;
  background-size: 432px;
  background-position: ${({ backgroundPosition }) => backgroundPosition};
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
