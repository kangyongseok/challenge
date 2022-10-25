import type { MutableRefObject } from 'react';
import { useMemo, useState } from 'react';

import LinesEllipsis from 'react-lines-ellipsis';
import { Box, Button, Flexbox, Icon, Label, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { ProductLabel } from '@components/UI/organisms';
import { Divider } from '@components/UI/molecules';
import { ProductInfoSkeleton } from '@components/pages/product';

import { Product } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { SELLER_STATUS } from '@constants/user';
import { ID_FILTER, LABELS, PRODUCT_SITE } from '@constants/product';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getFormattedDistanceTime, getProductArea, getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber, removeTagAndAddNewLine } from '@utils/common';

interface ProductInfoProps {
  contentRef: MutableRefObject<HTMLHRElement | null>;
  isSafe: boolean;
  product?: Product;
}

function ProductInfo({ contentRef, isSafe, product }: ProductInfoProps) {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();
  const [isClamped, setIsClamped] = useState(false);
  const [isExpended, setIsExpended] = useState(false);
  const isCamelProduct = product?.productSeller.site.id === PRODUCT_SITE.CAMEL.id;
  const isCamelSeller =
    product &&
    SELLER_STATUS[product.productSeller.type as keyof typeof SELLER_STATUS] === SELLER_STATUS['3'];
  const convertedDescription = useMemo(() => {
    const newDescription = removeTagAndAddNewLine(
      product?.viewDescription || product?.description || ''
    );

    if (product?.site.code === 'CAMELSELLER') {
      return `
∙ 상품상태: ${product.labels.filter((label) => label.codeId === 14)[0].name}
∙ 사이즈: ${product.size}
∙ 색상: ${product.color}
${newDescription}
      `;
    }

    // TODO 트렌비 매물 설명이 css코드로 시작되는 경우 공백 표시하도록 임시처리
    return product?.site.id === PRODUCT_SITE.TRENBE.id && newDescription.startsWith('.box')
      ? ''
      : newDescription;
  }, [
    product?.color,
    product?.description,
    product?.labels,
    product?.site.code,
    product?.site.id,
    product?.size,
    product?.viewDescription
  ]);

  const productLabels = useMemo(() => {
    if (!product?.productSeller.site || !product?.labels) return [];

    return product.labels
      .filter(
        (label) =>
          label.codeId === ID_FILTER &&
          LABELS[ID_FILTER].some(
            ({ description: labelDescription, name: labelName }) =>
              ['카멜인증', '새상품급', '시세이하'].includes(labelDescription) &&
              labelName === label.name
          )
      )
      .map(({ id, name, description: labelDescription }) => ({
        id,
        name,
        description: labelDescription
      }));
  }, [product?.labels, product?.productSeller.site]);

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
    <Box customStyle={{ marginTop: isCamelSeller ? 16 : 20 }}>
      {(isCamelProduct || isCamelSeller) && (
        <Flexbox customStyle={{ marginBottom: 8 }}>
          <Icon name="SafeFilled" size="small" customStyle={{ color: primary.main }} />
          <Typography variant="small2" weight="bold">
            {isCamelSeller
              ? '저희 카멜이 인증한 친절한 판매자입니다. 편하게 연락해보세요 :)'
              : '카멜중개거래'}
          </Typography>
        </Flexbox>
      )}
      <Flexbox gap={6} customStyle={{ marginBottom: 8 }}>
        <Flexbox>
          {productLabels.map((label, index) => (
            <ProductLabel
              key={`product-label-${label.id}`}
              showDivider={index !== 0}
              text={label.description}
              isSingle={productLabels.length === 1}
            />
          ))}
        </Flexbox>
        {isCamelSeller && (
          <Label text="가품 시, 100%환불" size="xsmall" variant="ghost" brandColor="black" />
        )}
      </Flexbox>
      <Title component="h1" variant="h4" weight="medium">
        {isSafe && <strong>안전결제 </strong>}
        {product?.title}
      </Title>
      <Typography component="h2" variant="h3" weight="bold">
        {commaNumber(getTenThousandUnitPrice(product?.price || 0))}만원
      </Typography>
      <Flexbox
        justifyContent="space-between"
        alignment="center"
        customStyle={{ color: common.ui60, marginTop: 8 }}
      >
        <Typography variant="small2" weight="medium" customStyle={{ color: common.ui60 }}>
          {getFormattedDistanceTime(new Date(product.datePosted))}
          {product?.area && ` · ${getProductArea(product.area)}`}
        </Typography>
        <Flexbox alignment="center">
          {product?.viewCount > 0 && (
            <>
              <Icon
                name="ViewOutlined"
                width={14}
                height={14}
                customStyle={{ color: common.ui60, marginRight: 2 }}
              />
              <Typography
                variant="small2"
                weight="medium"
                customStyle={{ color: common.ui60, marginRight: 6 }}
              >
                {product.viewCount}
              </Typography>
            </>
          )}
          {product.wishCount > 0 && (
            <>
              <Icon
                name="HeartOutlined"
                width={14}
                height={14}
                customStyle={{ color: common.ui60, marginRight: 2 }}
              />
              <Typography
                variant="small2"
                weight="medium"
                customStyle={{ color: common.ui60, marginRight: 6 }}
              >
                {product.wishCount}
              </Typography>
            </>
          )}
          {product.purchaseCount > 0 && (
            <>
              <Icon
                name="MessageOutlined"
                width={14}
                height={14}
                customStyle={{ color: common.ui60, marginRight: 2 }}
              />
              <Typography variant="small2" weight="medium" customStyle={{ color: common.ui60 }}>
                {product.purchaseCount}
              </Typography>
            </>
          )}
        </Flexbox>
      </Flexbox>
      <CustomDivider ref={contentRef} />
      {isExpended ? (
        <Typography
          variant="body1"
          dangerouslySetInnerHTML={{ __html: convertedDescription }}
          customStyle={{ marginTop: 24, whiteSpace: 'pre-wrap' }}
        />
      ) : (
        <Content variant="body1" isClamped={isClamped}>
          <LinesEllipsis
            text={convertedDescription}
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
          variant="contained"
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
      // -webkit-boxShadow: '1px -56px 28px 13px rgba(255, 255, 255, 0.8)',
      // -moz-boxShadow: `1px -56px 28px 13px rgba(255, 255, 255, 0.8)`
    }}
  svg {
    color: ${({
      theme: {
        palette: { common }
      }
    }) => common.ui20};
  }
`;

export default ProductInfo;
