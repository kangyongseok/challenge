import type { MouseEvent } from 'react';

import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Avatar, Flexbox, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import Skeleton from '@components/UI/atoms/Skeleton';

import { logEvent } from '@library/amplitude';

import { fetchLegitDashboard } from '@api/dashboard';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function LegitTargetBrandList() {
  const router = useRouter();
  const { data: { targetBrands = [] } = {}, isLoading } = useQuery(
    queryKeys.dashboard.legitDashboard(),
    fetchLegitDashboard
  );

  const handleClick = (e: MouseEvent<HTMLImageElement>) => {
    const dataName = e.currentTarget.getAttribute('data-name');

    logEvent(attrKeys.legit.CLICK_LEGIT_BRAND, {
      name: attrProperty.legitName.LEGIT_MAIN,
      att: 'BRAND'
    });

    router.push({
      pathname: `/products/brands/${dataName}`,
      query: {
        idFilterIds: 100
      }
    });
  };

  return (
    <Flexbox
      component="section"
      direction="vertical"
      customStyle={{
        margin: '52px -20px 0'
      }}
    >
      <Typography variant="h3" weight="bold" customStyle={{ margin: '0 20px' }}>
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
                data-name={name}
                onClick={handleClick}
                customStyle={{
                  filter: 'drop-shadow(0px 4px 24px #E6E6E6)',
                  borderRadius: '50%',
                  cursor: 'pointer'
                }}
              />
            ))}
      </BrandList>
    </Flexbox>
  );
}

const BrandList = styled.div`
  padding: 16px 20px 32px;
  white-space: nowrap;
  overflow-x: auto;

  & > img,
  div {
    display: inline-block;
    margin-right: 8px;
    &:last-child {
      margin-right: 0;
    }
  }
`;

export default LegitTargetBrandList;
