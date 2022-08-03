import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Avatar, Box, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { fetchLegitDashboard } from '@api/dashboard';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import Skeleton from '../../UI/atoms/Skeleton';

function LegitGuideTargetBrandList() {
  const router = useRouter();
  const { data: { targetBrands = [] } = {}, isLoading } = useQuery(
    queryKeys.dashboard.legitDashboard(),
    fetchLegitDashboard
  );

  return (
    <Box customStyle={{ marginTop: 32 }}>
      <Typography variant="h3" weight="bold" customStyle={{ textAlign: 'center' }}>
        감정가능 브랜드 둘러보기
      </Typography>
      <BrandList>
        {isLoading
          ? Array.from({ length: 10 }).map((_, index) => (
              <Skeleton
                // eslint-disable-next-line react/no-array-index-key
                key={`target-brand-skeleton-${index}`}
                width="80px"
                height="80px"
                disableAspectRatio
                customStyle={{
                  filter: 'drop-shadow(0px 4px 24px #E6E6E6)',
                  borderRadius: '50%'
                }}
              />
            ))
          : targetBrands.map(({ id, name, nameEng }) => (
              <Avatar
                key={`target-brand-${id}`}
                width={80}
                height={80}
                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/brands/white/${nameEng
                  .toLocaleLowerCase()
                  .split(' ')
                  .join('')}.jpg`}
                alt="Brand Logo Img"
                onClick={() => {
                  logEvent(attrKeys.legitGuide.CLICK_LEGIT_BRAND, {
                    name: attrProperty.legitName.LEGIT_POPUP,
                    title: attrProperty.legitTitle.HOWTO
                  });
                  router.push({
                    pathname: `/products/brands/${name}`,
                    query: {
                      idFilterIds: 100
                    }
                  });
                }}
                customStyle={{
                  filter: 'drop-shadow(0px 4px 24px #E6E6E6)',
                  borderRadius: '50%',
                  cursor: 'pointer'
                }}
              />
            ))}
      </BrandList>
    </Box>
  );
}

const BrandList = styled.div`
  padding: 16px 20px 32px;
  white-space: nowrap;
  overflow-x: auto;

  & > img {
    margin-right: 8px;
    &:last-child {
      margin-right: 0;
    }
  }
`;

export default LegitGuideTargetBrandList;
