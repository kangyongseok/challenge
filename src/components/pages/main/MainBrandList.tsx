import React, { memo } from 'react';
import { Avatar, Box, Flexbox, Typography } from 'mrcamel-ui';

import { Brand } from '@dto/brand';

interface MainBrandListProps {
  brands: Brand[];
}

function MainBrandList({ brands = [] }: MainBrandListProps) {
  return (
    <Box
      component="section"
      customStyle={{
        marginTop: 32
      }}
    >
      <Typography variant="h4" weight="bold" brandColor="common-black">
        브랜드로 빠른검색
      </Typography>
      <Flexbox
        gap={16}
        customStyle={{
          margin: '16px -20px 0 -20px',
          padding: '0 20px',
          overflowX: 'auto',
          flexWrap: 'nowrap',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }}
      >
        {brands &&
          Array.isArray(brands) &&
          brands.map((brand) => (
            <Box
              key={`brand-${brand.name}`}
              customStyle={{
                minWidth: 64,
                textAlign: 'center'
              }}
            >
              <Avatar
                width={64}
                height={64}
                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/brands/${brand.nameLogo
                  .toLowerCase()
                  .replace(/\s/g, '')}.png`}
                alt="Brand Img"
                customStyle={{
                  borderRadius: '50%',
                  backgroundColor: 'rgb(196, 196, 196)'
                }}
              />
              <Typography variant="body2" weight="medium" customStyle={{ marginTop: 8 }}>
                {brand.name}
              </Typography>
            </Box>
          ))}
      </Flexbox>
    </Box>
  );
}

export default memo(MainBrandList);
