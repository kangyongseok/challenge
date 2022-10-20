import { useCallback, useMemo } from 'react';

import { useRouter } from 'next/router';
import type { IconProps } from 'mrcamel-ui/dist/components/Icon';
import { Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import LegitLabel from '@components/UI/atoms/LegitLabel';
import { Image, Skeleton } from '@components/UI/atoms';

import type { ProductLegit } from '@dto/productLegit';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/formats';
import { getProductDetailUrl } from '@utils/common';

import type { LegitOpinionType } from '@typings/common';

interface LegitCaseHistoryCardProps {
  productLegit?: ProductLegit | undefined;
  isLoading?: boolean;
  rank: number;
}

function LegitCaseHistoryCard({ productLegit, isLoading, rank }: LegitCaseHistoryCardProps) {
  const {
    result = 0,
    legitOpinions = [],
    productResult: { title = '', imageMain = '', brand: { nameEng: brandNameEng = '' } = {} } = {}
  } = productLegit || {};

  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const resultLabel: { variant: LegitOpinionType; text: string } = useMemo(() => {
    switch (result) {
      case 1:
        return { text: '정품의견', variant: 'authentic' };
      case 2:
        return { text: '가품의심', variant: 'fake' };
      default:
        return { text: '감정진행중', variant: 'impossible' };
    }
  }, [result]);
  const comments: { icon: IconProps['name']; count: number }[] = useMemo(
    () => [
      {
        icon: 'OpinionAuthenticOutlined',
        count: legitOpinions.filter((legitOpinion) => legitOpinion.result === 1).length
      },
      {
        icon: 'OpinionFakeOutlined',
        count: legitOpinions.filter((legitOpinion) => legitOpinion.result === 2).length
      }
    ],
    [legitOpinions]
  );

  const handleClick = useCallback(() => {
    logEvent(attrKeys.legit.CLICK_LEGIT_INFO, {
      name: attrProperty.legitName.LEGIT_MAIN,
      title: attrProperty.legitTitle.BEST,
      att: `주간${rank}위`
    });

    if (!productLegit) return;

    router.push(
      `/legit${getProductDetailUrl({
        type: 'productResult',
        product: productLegit.productResult
      }).replace('/products', '')}/result`
    );
  }, [productLegit, rank, router]);

  return isLoading ? (
    <Flexbox direction="vertical" gap={12} customStyle={{ position: 'relative', width: '100%' }}>
      <Skeleton width="100%" height="160px" disableAspectRatio isRound />
      <Flexbox direction="vertical" gap={8}>
        <Flexbox direction="vertical" gap={2}>
          <Skeleton width="60px" height="26px" disableAspectRatio isRound />
          <Skeleton width="100%" height="20px" disableAspectRatio isRound />
        </Flexbox>
        <Flexbox gap={8}>
          <Skeleton width="21px" height="12px" disableAspectRatio isRound />
          <Skeleton width="26px" height="12px" disableAspectRatio isRound />
          <Skeleton width="21px" height="12px" disableAspectRatio isRound />
        </Flexbox>
      </Flexbox>
    </Flexbox>
  ) : (
    <Flexbox
      direction="vertical"
      gap={12}
      customStyle={{ position: 'relative', width: '100%', cursor: 'pointer' }}
      onClick={handleClick}
    >
      <LegitLabel
        {...resultLabel}
        customStyle={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}
      />
      <CustomImage src={imageMain}>
        <RankLabel variant="body2" weight="medium">{`주간 ${rank}위`}</RankLabel>
      </CustomImage>
      <Flexbox gap={8} direction="vertical">
        <Flexbox direction="vertical" gap={2} customStyle={{ mixBlendMode: 'multiply' }}>
          <Image
            width="auto"
            height="24px"
            disableAspectRatio
            src={`https://${
              process.env.IMAGE_DOMAIN
            }/assets/images/horizon_brands/white/${brandNameEng
              .toLowerCase()
              .replace(/\s/g, '')}.jpg`}
          />
          <Title variant="body1" line={rank === 1 ? 1 : 2}>
            {title}
          </Title>
        </Flexbox>
        {comments.length > 0 && (
          <Flexbox gap={8} alignment="center" customStyle={{ color: common.ui80 }}>
            {comments.map(({ icon, count }) => (
              <Flexbox key={`comment-${icon}`} gap={2} alignment="center">
                <Icon name={icon} width={12} height={12} customStyle={{ color: 'inherit' }} />
                <Typography variant="small2" weight="medium" customStyle={{ color: 'inherit' }}>
                  {commaNumber(count)}
                </Typography>
              </Flexbox>
            ))}
          </Flexbox>
        )}
      </Flexbox>
    </Flexbox>
  );
}

const CustomImage = styled.div<{ src: string }>`
  position: relative;
  height: 160px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url(${({ src }) => src});
`;

const RankLabel = styled(Typography)`
  position: absolute;
  bottom: 0;
  padding: 4px 6px;
  width: 100%;
  color: ${({ theme }) => theme.palette.common.uiWhite};
  text-align: center;
  background-color: ${({ theme }) => theme.palette.common.uiBlack};
  opacity: 0.8;
  border-radius: 0 0 4px 4px;
`;

const Title = styled(Typography)<{ line: number }>`
  color: ${({ theme }) => theme.palette.common.ui60};
  overflow-x: hidden;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export default LegitCaseHistoryCard;
