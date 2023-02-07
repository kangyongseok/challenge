import { useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Button, Dialog, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';

import type { ProductLegit } from '@dto/productLegit';

import { fetchProduct } from '@api/product';

import queryKeys from '@constants/queryKeys';

import { deviceIdState } from '@recoil/common';
import { camelSellerTempSaveDataState } from '@recoil/camelSeller';

function CamelSellerCategoryBrand() {
  const router = useRouter();

  const { id: productId } = router.query;

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const deviceId = useRecoilValue(deviceIdState);
  const {
    category: { name },
    brand: { name: brandName },
    size: { name: sizeName },
    sizes
  } = useRecoilValue(camelSellerTempSaveDataState);

  const [open, setOpen] = useState(false);

  const { data: { product: { productLegit = {} } = {} } = {} } = useQuery(
    queryKeys.products.sellerEditProduct({ productId: Number(productId), deviceId }),
    () => fetchProduct({ productId: Number(productId), deviceId }),
    {
      enabled: !!productId,
      refetchOnMount: 'always'
    }
  );

  const { status, result } = (productLegit as ProductLegit) || {};

  const handleClick = () => {
    if (status === 20 || (status === 30 && result === 1)) return;

    if (sizeName || sizes) {
      setOpen(true);
    } else {
      router.push('/camelSeller/registerConfirm/selectCategory');
    }
  };

  return (
    <>
      <Flexbox
        alignment="center"
        justifyContent="space-between"
        onClick={handleClick}
        customStyle={{
          height: 61,
          borderBottom: `1px solid ${common.line01}`,
          cursor: 'pointer'
        }}
      >
        {name && brandName ? (
          <Typography
            variant="h4"
            customStyle={{
              color: status === 20 || (status === 30 && result === 1) ? common.ui80 : undefined
            }}
          >
            {name} / {brandName}
          </Typography>
        ) : (
          <Typography
            variant="h4"
            customStyle={{
              color: common.ui80
            }}
          >
            카테고리 / 브랜드
          </Typography>
        )}
        {!(status === 20 || (status === 30 && result === 1)) && (
          <Icon
            name="Arrow2RightOutlined"
            width={20}
            height={20}
            color={common.ui80}
            customStyle={{
              minWidth: 20
            }}
          />
        )}
      </Flexbox>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        customStyle={{
          padding: '32px 20px 20px',
          textAlign: 'center'
        }}
      >
        <Typography variant="h3" weight="bold">
          카테고리/브랜드를 다시 선택할까요?
        </Typography>
        <Typography
          variant="h4"
          customStyle={{
            marginTop: 8
          }}
        >
          카테고리/브랜드를 변경하면
          <br />
          사이즈 정보가 초기화돼요.
        </Typography>
        <Button
          variant="solid"
          size="large"
          brandColor="blue"
          fullWidth
          onClick={() => router.push('/camelSeller/registerConfirm/selectCategory')}
          customStyle={{
            marginTop: 32
          }}
        >
          카테고리/브랜드 다시 선택
        </Button>
        <Button
          variant="ghost"
          brandColor="black"
          size="large"
          fullWidth
          onClick={() => setOpen(false)}
          customStyle={{
            marginTop: 8
          }}
        >
          취소
        </Button>
      </Dialog>
    </>
  );
}

export default CamelSellerCategoryBrand;
