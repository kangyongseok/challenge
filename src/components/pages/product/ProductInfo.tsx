import type { MutableRefObject } from 'react';
import { useMemo, useState } from 'react';

import LinesEllipsis from 'react-lines-ellipsis';
import { Box, Flexbox, Icon, Label, Typography, useTheme } from 'mrcamel-ui';
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
import { removeTagAndAddNewLine } from '@utils/common';
import commaNumber from '@utils/commaNumber';

interface ProductInfoProps {
  contentRef: MutableRefObject<HTMLHRElement | null>;
  isSafe: boolean;
  product?: Product;
}

function ProductInfo({ contentRef, isSafe, product }: ProductInfoProps) {
  const {
    theme: { palette }
  } = useTheme();
  const [isClamped, setIsClamped] = useState(false);
  const [isExpended, setIsExpended] = useState(false);
  const isCamelProduct = product?.productSeller.site.id === PRODUCT_SITE.CAMEL.id;
  const isCamelSeller =
    product &&
    SELLER_STATUS[product.productSeller.type as keyof typeof SELLER_STATUS] === SELLER_STATUS['3'];
  const convertedDescription = useMemo(
    () => removeTagAndAddNewLine(product?.viewDescription || product?.description || ''),
    [product?.description, product?.viewDescription]
  );

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

  return !product ? (
    <ProductInfoSkeleton />
  ) : (
    <Box customStyle={{ marginTop: isCamelSeller ? 16 : 20 }}>
      {(isCamelProduct || isCamelSeller) && (
        <Flexbox customStyle={{ marginBottom: 8 }}>
          <Icon name="SafeFilled" size="small" customStyle={{ color: palette.primary.main }} />
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
      <Title variant="h4" weight="medium">
        {isSafe && <strong>안전결제 </strong>}
        {product?.title}
      </Title>
      <Typography variant="h3" weight="bold">
        {commaNumber(getTenThousandUnitPrice(product?.price || 0))}만원
      </Typography>
      <Flexbox
        justifyContent="space-between"
        alignment="center"
        customStyle={{ color: palette.common.grey['60'], marginTop: 8 }}
      >
        <Typography
          variant="small2"
          weight="medium"
          customStyle={{ color: palette.common.grey['60'] }}
        >
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
                customStyle={{ color: palette.common.grey['60'], marginRight: 2 }}
              />
              <Typography
                variant="small2"
                weight="medium"
                customStyle={{ color: palette.common.grey['60'], marginRight: 6 }}
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
                customStyle={{ color: palette.common.grey['60'], marginRight: 2 }}
              />
              <Typography
                variant="small2"
                weight="medium"
                customStyle={{ color: palette.common.grey['60'], marginRight: 6 }}
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
                customStyle={{ color: palette.common.grey['60'], marginRight: 2 }}
              />
              <Typography
                variant="small2"
                weight="medium"
                customStyle={{ color: palette.common.grey['60'] }}
              >
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
      <CustomDivider isClamped={isClamped} />
      {isClamped && (
        <Flexbox
          justifyContent="center"
          onClick={() => {
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
            setIsExpended(!isExpended);
          }}
          customStyle={{ padding: '8px 0' }}
        >
          <Icon name={isExpended ? 'CaretUpOutlined' : 'CaretDownOutlined'} />
        </Flexbox>
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
  overflow-x: hidden;
`;

export default ProductInfo;