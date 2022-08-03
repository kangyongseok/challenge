import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Avatar, Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import styled from '@emotion/styled';

import { ProductLegitLabel } from '@components/UI/atoms';

import { fetchProductLegit } from '@api/product';

import queryKeys from '@constants/queryKeys';

function LegitResultOpinionList() {
  const router = useRouter();
  const { id } = router.query;

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: { legitOpinions = [] } = {} } = useQuery(
    queryKeys.products.productLegit({ productId: Number(id) }),
    () => fetchProductLegit(Number(id)),
    {
      enabled: !!id
    }
  );

  return (
    <Box component="section" customStyle={{ marginTop: 48 }}>
      {legitOpinions.map(
        (
          { dateCreated, description, result, roleLegit: { image, name, ip, title, subTitle } },
          index
        ) => (
          <>
            <Flexbox gap={12}>
              {image && (
                <Avatar
                  width={32}
                  height={32}
                  src={image}
                  alt="User Avatar Img"
                  customStyle={{ minWidth: 32, maxHeight: 32, borderRadius: '50%' }}
                />
              )}
              <Box customStyle={{ flexGrow: 1 }}>
                <Flexbox justifyContent="space-between">
                  <Flexbox gap={6} alignment="center" customStyle={{ flexGrow: 1 }}>
                    <Typography weight="bold">{name}</Typography>
                    {ip && (
                      <Typography variant="small1" customStyle={{ color: common.grey['60'] }}>
                        ({ip})
                      </Typography>
                    )}
                  </Flexbox>
                  {result === 1 && <ProductLegitLabel text="정품의견" />}
                  {result === 2 && <ProductLegitLabel variant="fake" text="가품의심" />}
                  {result !== 1 && result !== 2 && (
                    <ProductLegitLabel variant="impossible" text="감정불가" />
                  )}
                </Flexbox>
                <Typography
                  variant="body2"
                  customStyle={{ marginTop: 4, color: common.grey['40'] }}
                >
                  {title}
                </Typography>
                <Typography variant="body2" customStyle={{ color: common.grey['40'] }}>
                  {subTitle}
                </Typography>
                <Typography
                  customStyle={{ marginTop: 8 }}
                  dangerouslySetInnerHTML={{ __html: description }}
                />
                <Typography
                  variant="small2"
                  customStyle={{ marginTop: 8, color: common.grey['60'] }}
                >
                  {dayjs(dateCreated).format('YYYY.MM.DD HH:mm')}
                </Typography>
              </Box>
            </Flexbox>
            {index !== legitOpinions.length - 1 && <Divider />}
          </>
        )
      )}
    </Box>
  );
}

const Divider = styled.div`
  margin: 32px 0;
  border-bottom: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.grey['90']};
`;

export default LegitResultOpinionList;
