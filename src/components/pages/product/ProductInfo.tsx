import { MutableRefObject, useEffect, useMemo, useState } from 'react';

import { useRecoilState } from 'recoil';
import LinesEllipsis from 'react-lines-ellipsis';
import { Box, Button, Flexbox, Icon, Label, Typography, useTheme } from 'mrcamel-ui';
import { find } from 'lodash-es';
import styled from '@emotion/styled';

import { Divider } from '@components/UI/molecules';
import { ProductInfoSkeleton } from '@components/pages/product';

import { Product } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { productSellerType } from '@constants/user';
import { ID_FILTER, LABELS, PRODUCT_SITE, productInfoLabels } from '@constants/product';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getFormattedDistanceTime, getProductArea, getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber, removeTagAndAddNewLine } from '@utils/common';

import { toastState } from '@recoil/common';

import ProductInfoColorIcon from './ProductInfoColorIcon';

interface ProductInfoProps {
  contentRef: MutableRefObject<HTMLHRElement | null>;
  product?: Product;
  isCamelSellerProduct?: boolean;
  sizeData?: string[];
  unitText?: string;
  storeText?: string;
  distanceText?: string;
}

const UNDERPRICE_ID = 2745;

function ProductInfo({
  contentRef,
  product,
  isCamelSellerProduct = false,
  sizeData,
  unitText,
  storeText,
  distanceText
}: ProductInfoProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const [isClamped, setIsClamped] = useState(false);
  const [isExpended, setIsExpended] = useState(false);
  const [hoistingState, setHoistingState] = useState(false);
  const [getToastState] = useRecoilState(toastState);
  // const isCamelProduct = product?.productSeller.site.id === PRODUCT_SITE.CAMEL.id;
  const isNormalseller = product?.sellerType === productSellerType.normal;
  const isCertificationSeller =
    product?.sellerType === productSellerType.certification ||
    product?.sellerType === productSellerType.legit;

  const convertedDescription = useMemo(() => {
    const newDescription = removeTagAndAddNewLine(
      product?.viewDescription || product?.description || ''
    );

    // TODO 트렌비 매물 설명이 css코드로 시작되는 경우 공백 표시하도록 임시처리
    return product?.site.id === PRODUCT_SITE.TRENBE.id && newDescription.startsWith('.box')
      ? ''
      : newDescription;
  }, [product?.description, product?.site.id, product?.viewDescription]);

  const productStatusData = product?.labels.filter((label) => label.codeId === 14)[0];

  useEffect(() => {
    if (getToastState.status === 'hoisting') {
      setHoistingState(true);
    }
  }, [getToastState]);

  const productLabels = useMemo(() => {
    if (!product?.productSeller.site || !product?.labels) return [];
    let labels = productInfoLabels;

    if (isNormalseller) {
      labels = productInfoLabels.filter((label) => label !== '카멜인증');
    }
    return product.labels
      .filter(
        (label) =>
          label.codeId === ID_FILTER &&
          LABELS[ID_FILTER].some(
            ({ description: labelDescription, name: labelName }) =>
              labels.includes(labelDescription) && labelName === label.name
          )
      )
      .map(({ id, name, description: labelDescription }) => ({
        id,
        name,
        description: labelDescription
      }));
  }, [isNormalseller, product?.labels, product?.productSeller.site]);

  const templateInfoData = [
    {
      label: '상태',
      value: `${productStatusData?.synonyms} ${productStatusData?.name}`,
      isView: !!product?.labels.filter((label) => label.codeId === 14)[0].name
    },
    { label: '사이즈', value: sizeData?.join(' ∙ '), isView: !!sizeData },
    {
      label: '색상',
      value: <ProductInfoColorIcon colorData={product?.colors} />,
      isView: !!product?.color
    },
    { label: '구성품', value: unitText, isView: !!unitText },
    { label: '구입처', value: storeText, isView: !!storeText }
  ];

  const handleClickMoreInfo = () => {
    if (product) {
      logEvent(attrKeys.products.CLICK_EXPAND, {
        name: attrProperty.productName.PRODUCT_DETAIL,
        id: product.id,
        site: product.site.name,
        brand: product.brand.name,
        category: product.category.name,
        parentId: product.category.parentId,
        parentCategory: FIRST_CATEGORIES[product.category.parentId as number],
        line: product.line,
        price: product.price,
        scoreTotal: product.scoreTotal,
        scoreStatus: product.scoreStatus,
        scoreSeller: product.scoreSeller,
        scorePrice: product.scorePrice,
        scorePriceAvg: product.scorePriceAvg,
        scorePriceCount: product.scorePriceCount,
        scorePriceRate: product.scorePriceRate
      });
    }
    setIsExpended(!isExpended);
  };

  return !product ? (
    <ProductInfoSkeleton />
  ) : (
    <Box customStyle={{ marginTop: 20 }}>
      <Title component="h1" variant="h4" weight="medium">
        {product?.title}
      </Title>
      <Flexbox alignment="center">
        <Typography component="h2" variant="h2" weight="bold">
          {commaNumber(getTenThousandUnitPrice(product?.price || 0))}만원
        </Typography>
        {find(productLabels, { id: UNDERPRICE_ID }) && (
          <Label
            text={find(productLabels, { id: UNDERPRICE_ID })?.description || ''}
            variant="ghost"
            customStyle={{ marginLeft: 6 }}
          />
        )}
      </Flexbox>
      <Flexbox
        justifyContent="space-between"
        alignment="center"
        customStyle={{ color: common.ui60, marginTop: 12 }}
      >
        <Typography variant="small1" weight="medium" customStyle={{ color: common.ui60 }}>
          {isCamelSellerProduct && product.datePosted > product.dateFirstPosted ? '끌올 ' : ''}
          {getFormattedDistanceTime(hoistingState ? new Date() : new Date(product.datePosted))}
        </Typography>
        <Flexbox alignment="center">
          {product?.viewCount > 0 && (
            <>
              <Icon
                name="ViewFilled"
                width={15}
                height={15}
                customStyle={{ color: common.ui80, marginRight: 2 }}
              />
              <Typography
                variant="small1"
                weight="medium"
                customStyle={{ color: common.ui80, marginRight: 6 }}
              >
                {product.viewCount}
              </Typography>
            </>
          )}
          {product.wishCount > 0 && (
            <>
              <Icon
                name="HeartFilled"
                width={15}
                height={15}
                customStyle={{ color: common.ui80, marginRight: 2 }}
              />
              <Typography
                variant="small1"
                weight="medium"
                customStyle={{ color: common.ui80, marginRight: 6 }}
              >
                {product.wishCount}
              </Typography>
            </>
          )}
          {product.purchaseCount > 0 && (
            <>
              <Icon
                name="MessageFilled"
                width={15}
                height={15}
                customStyle={{ color: common.ui80, marginRight: 2 }}
              />
              <Typography variant="small1" weight="medium" customStyle={{ color: common.ui80 }}>
                {product.purchaseCount}
              </Typography>
            </>
          )}
        </Flexbox>
      </Flexbox>
      {isCertificationSeller && (
        <CertificationCard>
          <Flexbox alignment="center" gap={6} customStyle={{ marginBottom: 4 }}>
            <SafeIcon />
            <Typography variant="small1" weight="medium">
              카멜이 직접 인증한 판매자예요. 편하게 문의해보세요.
            </Typography>
          </Flexbox>
          <Typography variant="small1" customStyle={{ color: common.ui60, paddingLeft: 18 }}>
            가품시, 100% 환불
          </Typography>
        </CertificationCard>
      )}
      {!isCertificationSeller && <CustomDivider ref={contentRef} />}
      {product?.site.code === 'CAMELSELLER' &&
        (!!product?.area || !!distanceText || find(product.labels, { name: '33' })) && (
          <Flexbox alignment="center" gap={4} customStyle={{ margin: '20px 0' }}>
            {!!product.labels.length && find(product.labels, { name: '33' }) ? (
              <Label variant="ghost" brandColor="gray" text="배송비 포함" />
            ) : (
              <Label variant="ghost" brandColor="gray" text="배송비 별도" />
            )}
            {distanceText === '직거래' && (
              <Label variant="ghost" brandColor="gray" text={distanceText} />
            )}
            {product?.area && !!(distanceText === '직거래' || distanceText === '모든위치') && (
              <Label
                variant="ghost"
                brandColor="gray"
                startIcon={<Icon name="PinFilled" />}
                text={getProductArea(product.area)}
              />
            )}
          </Flexbox>
        )}
      {product?.site.code === 'CAMELSELLER' && (
        <Flexbox direction="vertical" gap={8}>
          {templateInfoData.map((stateData) => (
            <Flexbox
              gap={8}
              key={`product-status-data-${stateData.label}`}
              customStyle={{ display: stateData.isView ? 'flex' : 'none' }}
            >
              <Typography variant="h4" customStyle={{ minWidth: 60, color: common.ui60 }}>
                {stateData.label}
              </Typography>
              <Typography variant="h4">{stateData.value}</Typography>
            </Flexbox>
          ))}
        </Flexbox>
      )}
      {isExpended ? (
        <Typography
          variant="body1"
          dangerouslySetInnerHTML={{
            __html: convertedDescription !== 'null' ? convertedDescription : ''
          }}
          customStyle={{ marginTop: 24, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        />
      ) : (
        <Content component="article" variant="body1" isClamped={isClamped}>
          <LinesEllipsis
            text={convertedDescription !== 'null' ? convertedDescription : ''}
            maxLine="20"
            ellipsis="..."
            basedOn="letters"
            component="p"
            onReflow={({ clamped }) => isClamped !== clamped && setIsClamped(clamped)}
          />
        </Content>
      )}
      {isClamped && (
        <MoreInfoButton
          isExpended={isExpended}
          fullWidth
          variant="solid"
          size="large"
          onClick={handleClickMoreInfo}
        >
          <Flexbox
            alignment="center"
            justifyContent="center"
            customStyle={{ padding: '8px 0' }}
            gap={8}
          >
            <Typography variant="h4">{isExpended ? '접어보기' : '펼쳐보기'}</Typography>
            <Icon
              customStyle={{ color: common.uiBlack }}
              name={isExpended ? 'CaretUpOutlined' : 'CaretDownOutlined'}
            />
          </Flexbox>
        </MoreInfoButton>
      )}
    </Box>
  );
}

const Title = styled(Typography)`
  margin-bottom: 4px;

  strong {
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const CustomDivider = styled(Divider)<{ isClamped?: boolean }>`
  margin-top: 24px;
  margin-bottom: ${({ isClamped }) => !isClamped && '24px'};
`;

const Content = styled(Typography)<{ isClamped: boolean }>`
  margin-top: 24px;
  margin-bottom: ${({ isClamped }) => isClamped && '24px'};
  white-space: pre-wrap;
  overflow: hidden;
`;

const MoreInfoButton = styled(Button)<{ isExpended: boolean }>`
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui95};
  ${({ isExpended }) =>
    !isExpended && {
      boxShadow: '1px -40px 28px 13px rgba(255, 255, 255, 0.8)'
    }}
  svg {
    color: ${({
      theme: {
        palette: { common }
      }
    }) => common.ui20};
  }
`;

const CertificationCard = styled.div`
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg02};
  border-radius: 9px;
  padding: 14px;
  margin-top: 20px;
`;

function SafeIcon() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 0H0V7.90618C0 8.79778 0.445603 9.6304 1.18747 10.125L6 13.3333L10.8125 10.125C11.5544 9.6304 12 8.79778 12 7.90618V0ZM5.3333 8.94286L9.80471 4.47145L8.8619 3.52865L5.3333 7.05724L3.13804 4.86198L2.19523 5.80479L5.3333 8.94286Z"
        fill="#425BFF"
      />
    </svg>
  );
}

export default ProductInfo;
