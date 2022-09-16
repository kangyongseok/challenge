import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox, Typography } from 'mrcamel-ui';
import { isEmpty } from 'lodash-es';
import styled from '@emotion/styled';

import ProductLegitLabel from '@components/UI/atoms/ProductLegitLabel';

import { fetchProductLegit } from '@api/product';

import queryKeys from '@constants/queryKeys';
import authInfoIcon from '@constants/authInfoIcon';

const guidCardData = [
  {
    text: '내부 브랜드 각인',
    Icon: authInfoIcon.ImportantIconBrand
  },
  {
    text: '내부 숫자,영문 각인',
    Icon: authInfoIcon.ImportantIconEngrave
  },
  {
    text: '프린팅 디테일',
    Icon: authInfoIcon.ImportantIconDetail
  },
  {
    text: '영수증 및 개런티카드',
    Icon: authInfoIcon.ImportantIconReceipt
  },
  {
    text: '지퍼 앞뒷면',
    Icon: authInfoIcon.ImportantIconZipper
  },
  {
    text: '금속 부속품',
    Icon: authInfoIcon.ImportantIconPart
  }
];

function ProductLegitProcessFailContents() {
  const router = useRouter();
  const splitIds = String(router.query.id || '').split('-');
  const productId = Number(splitIds[splitIds.length - 1] || 0);
  const { data } = useQuery(
    queryKeys.products.productLegit({ productId }),
    () => fetchProductLegit(productId),
    {
      enabled: !!router.query.id
    }
  );

  return (
    <Box
      customStyle={{
        textAlign: 'center',
        display: data?.status === 11 ? 'block' : 'none',
        marginBottom: 64
      }}
    >
      <Typography weight="bold" variant="h3">
        판매자의 현재 사진들로는
        <Flexbox alignment="center" justifyContent="center">
          <Typography brandColor="red" weight="bold" variant="h3">
            사진감정이 불가
          </Typography>
          해요
        </Flexbox>
      </Typography>
      <OpinionCard>
        <Typography weight="bold" customStyle={{ marginBottom: 4 }}>
          {!isEmpty(data?.legitOpinions) && data?.legitOpinions[0].roleLegit.name}
        </Typography>
        <Typography variant="small1">
          {!isEmpty(data?.legitOpinions) && data?.legitOpinions[0].roleLegit.title}
        </Typography>
        <Typography
          customStyle={{ marginTop: 8 }}
          dangerouslySetInnerHTML={{
            __html: !isEmpty(data?.legitOpinions) ? data?.legitOpinions[0].description || '' : ''
          }}
        />
        <Box customStyle={{ position: 'absolute', top: 20, right: 20 }}>
          <ProductLegitLabel variant="impossible" text="감정불가" />
        </Box>
      </OpinionCard>
      <Box>
        <Typography customStyle={{ marginBottom: 11 }}>사진감정시 필요사진</Typography>
        <GuidImage alignment="center" justifyContent="center">
          {guidCardData.map(({ text, Icon }) => (
            <GuidCard key={`guid-card-${text}`}>
              <Icon />
              <Typography variant="small2">{text}</Typography>
            </GuidCard>
          ))}
        </GuidImage>
      </Box>
    </Box>
  );
}

const OpinionCard = styled.div`
  position: relative;
  width: 100%;
  background: ${({ theme: { palette } }) => palette.common.grey['98']};
  border-radius: 8px;
  padding: 20px;
  margin: 24px 0 32px;
  text-align: left;
`;

const GuidImage = styled(Flexbox)`
  flex-wrap: wrap;
`;

const GuidCard = styled.div`
  min-width: 96px;
  height: 96px;
  border: 1px solid ${({ theme: { palette } }) => palette.common.grey['90']};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-left: -1px;
  margin-top: -1px;
`;

export default ProductLegitProcessFailContents;
