import React, { memo } from 'react';
import { Avatar, Box, Flexbox, Typography } from 'mrcamel-ui';

function MainBrandList() {
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
        {Array.from({ length: 10 }).map((_, index) => (
          <Box
            // eslint-disable-next-line react/no-array-index-key
            key={`brand-${index}`}
            customStyle={{
              minWidth: 64,
              textAlign: 'center'
            }}
          >
            <Avatar
              width={64}
              height={64}
              src="https://mrcamel.s3.ap-northeast-2.amazonaws.com/assets/images/brands/airjordan.png"
              alt="Brand Img"
              customStyle={{
                borderRadius: '50%',
                backgroundColor: 'rgb(196, 196, 196)'
              }}
            />
            <Typography variant="body2" weight="medium" customStyle={{ marginTop: 8 }}>
              조던
            </Typography>
          </Box>
        ))}
      </Flexbox>
    </Box>
  );
}

export default memo(MainBrandList);
