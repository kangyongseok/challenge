import { useEffect, useMemo, useState } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Typography } from '@mrcamelhub/camel-ui';

import type { PhotoGuideParams } from '@dto/common';

import { logEvent } from '@library/amplitude';

import { fetchPhotoGuide } from '@api/common';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { legitRequestState, productLegitParamsState } from '@recoil/legitRequest';

function LegitRequestSampleGuideDialog() {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [{ isViewedSampleGuide }, setLegitRequestState] = useRecoilState(legitRequestState);
  const productLegitParams = useRecoilValue(productLegitParamsState);

  const photoGuideParams: PhotoGuideParams = useMemo(
    () => ({
      type: 1,
      brandId: productLegitParams.brandIds[0],
      categoryId: productLegitParams.categoryIds[0]
    }),
    [productLegitParams.brandIds, productLegitParams.categoryIds]
  );

  const { data: { photoGuideDetails = [] } = {} } = useQuery(
    queryKeys.commons.photoGuide(photoGuideParams),
    () => fetchPhotoGuide(photoGuideParams)
  );

  const handleClick = () => {
    logEvent(attrKeys.legit.CLICK_UPLOAD_GUIDE, {
      name: attrProperty.name.LEGIT_UPLOAD,
      title: attrProperty.title.POPUP
    });
    setLegitRequestState((prevState) => ({
      ...prevState,
      isViewedSampleGuide: true
    }));
    router.push({
      pathname: '/legit/guide/sample',
      query: { ...photoGuideParams }
    });
  };

  useEffect(() => {
    if (isViewedSampleGuide || !photoGuideDetails.filter(({ imageSample }) => imageSample).length)
      return;

    setOpen(true);
  }, [isViewedSampleGuide, photoGuideDetails]);

  return (
    <Dialog
      open={open}
      onClose={() => {
        setLegitRequestState((prevState) => ({
          ...prevState,
          isViewedSampleGuide: true
        }));
        setOpen(false);
      }}
    >
      <Typography variant="h3" weight="bold">
        샘플사진을 확인해 주세요!
      </Typography>
      <Typography
        variant="h4"
        customStyle={{
          marginTop: 8
        }}
      >
        어떻게 등록해야 감정결과를
        <br />더 빨리 받을 수 있는지 알아보세요.
      </Typography>
      <Button
        fullWidth
        variant="solid"
        brandColor="primary"
        size="large"
        onClick={handleClick}
        customStyle={{
          marginTop: 20
        }}
      >
        사진 샘플 보기
      </Button>
    </Dialog>
  );
}

export default LegitRequestSampleGuideDialog;
