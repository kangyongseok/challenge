import { Box, Flexbox, Skeleton, useTheme } from 'mrcamel-ui';

import { Divider } from '@components/UI/molecules';

function ProductInfoSkeleton() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  return (
    <>
      <Box customStyle={{ marginTop: 20 }}>
        <Skeleton width="100%" maxWidth={70} height={32} round={8} disableAspectRatio />
        <Flexbox
          justifyContent="space-between"
          customStyle={{
            marginTop: 8
          }}
        >
          <Skeleton width="100%" maxWidth={150} height={46} round={8} disableAspectRatio />
          <Flexbox>
            <Box
              customStyle={{
                height: '100%',
                paddingRight: 18,
                borderLeft: `1px solid ${common.line01}`
              }}
            />
            <Skeleton width={28} height={46} round={8} disableAspectRatio />
          </Flexbox>
        </Flexbox>
        <Skeleton
          width="100%"
          maxWidth={40}
          height={16}
          round={8}
          disableAspectRatio
          customStyle={{ marginTop: 12 }}
        />
      </Box>
      <Divider
        css={{
          margin: '24px 0'
        }}
      />
      <Flexbox direction="vertical" gap={4}>
        <Skeleton width="100%" height={18} maxWidth={120} round={8} disableAspectRatio />
        <Skeleton width="100%" height={18} maxWidth={70} round={8} disableAspectRatio />
        <Skeleton width="100%" height={18} maxWidth={100} round={8} disableAspectRatio />
      </Flexbox>
      <Box customStyle={{ margin: '0 -20px' }}>
        <Skeleton width="100%" height={80} customStyle={{ marginTop: 20 }} />
      </Box>
    </>
  );
}

export default ProductInfoSkeleton;
