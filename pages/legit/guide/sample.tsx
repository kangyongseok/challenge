import { useEffect, useRef } from 'react';

import { useRouter } from 'next/router';
import {
  Alert,
  Box,
  Flexbox,
  Icon,
  Image,
  ThemeProvider,
  Typography,
  dark,
  useTheme
} from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';

import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';

import { logEvent } from '@library/amplitude';

import { fetchPhotoGuide } from '@api/common';

import queryKeys from '@constants/queryKeys';
import { HEADER_HEIGHT } from '@constants/common';
import attrKeys from '@constants/attrKeys';

function LegitGuideSample() {
  const router = useRouter();
  const { brandId, categoryId, scrollToElementId } = router.query;

  const photoGuideDetailsRef = useRef<HTMLDivElement[]>([]);
  const scrollToElementTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: { photoGuideDetails = [] } = {}, isFetched } = useQuery(
    queryKeys.commons.photoGuide({
      type: 1,
      brandId: Number(brandId),
      categoryId: Number(categoryId)
    }),
    () =>
      fetchPhotoGuide({
        type: 1,
        brandId: Number(brandId),
        categoryId: Number(categoryId)
      }),
    {
      enabled: !!brandId && !!categoryId
    }
  );

  useEffect(() => {
    document.body.className = 'legit-dark';

    return () => {
      document.body.removeAttribute('class');
    };
  }, []);

  useEffect(() => {
    if (isFetched && scrollToElementId) {
      const findPhotoGuideDetailRef = photoGuideDetailsRef.current.find((photoGuideDetailRef) => {
        const dataId = Number(photoGuideDetailRef.getAttribute('data-id') || 0);

        return dataId === Number(scrollToElementId);
      });

      if (findPhotoGuideDetailRef) {
        if (scrollToElementTimerRef.current) {
          clearTimeout(scrollToElementTimerRef.current);
        }

        scrollToElementTimerRef.current = setTimeout(() => {
          let top = findPhotoGuideDetailRef.getBoundingClientRect().top + window.scrollY;
          const infoElement = findPhotoGuideDetailRef.querySelector(`#info-${scrollToElementId}`);

          if (infoElement) {
            top -= infoElement.clientHeight + 20;
          }

          top -= HEADER_HEIGHT;

          window.scrollTo({
            top,
            behavior: 'smooth'
          });
        }, 200);
      }
    }
  }, [isFetched, scrollToElementId]);

  useEffect(() => {
    return () => {
      if (scrollToElementTimerRef.current) {
        clearTimeout(scrollToElementTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    logEvent(attrKeys.legitGuide.VIEW_UPLOAD_GUIDE);
  }, []);

  return (
    <ThemeProvider theme="dark">
      <GeneralTemplate
        header={
          <Header
            leftIcon={
              <Box customStyle={{ padding: 16 }} onClick={() => router.back()}>
                <Icon name="CloseOutlined" />
              </Box>
            }
            showRight={false}
            customStyle={{
              backgroundColor: dark.palette.common.bg03
            }}
          >
            <Typography variant="h3" weight="bold">
              사진 업로드 가이드
            </Typography>
          </Header>
        }
        customStyle={{ height: 'auto', backgroundColor: dark.palette.common.bg03 }}
      >
        <Alert
          brandColor="primary"
          customStyle={{ margin: '0 -20px', padding: '12px 20px', borderRadius: 0 }}
        >
          <Flexbox alignment="center" gap={2}>
            <Icon name="BangCircleFilled" width={16} height={16} />
            <Typography variant="body2" weight="medium">
              똑같지 않아도 괜찮아요! 가장 비슷하게 등록해주세요!
            </Typography>
          </Flexbox>
        </Alert>
        <Flexbox direction="vertical" gap={28} customStyle={{ margin: '28px 0' }}>
          {photoGuideDetails
            .filter(({ imageSample }) => imageSample)
            .map(({ id, name, description, imageSample }, index) => (
              <div
                key={`photo-guide-detail-${id}`}
                ref={(ref) => {
                  if (ref) photoGuideDetailsRef.current[index] = ref;
                }}
                data-id={id}
              >
                <div id={`info-${id}`}>
                  <Typography variant="h3" weight="bold">
                    {name}
                  </Typography>
                  <Typography customStyle={{ marginTop: 4, color: common.ui60 }}>
                    {description}
                  </Typography>
                </div>
                <Image
                  width="100%"
                  src={imageSample}
                  alt="Sample Img"
                  round={8}
                  disableAspectRatio
                  customStyle={{ marginTop: 16 }}
                />
              </div>
            ))}
        </Flexbox>
      </GeneralTemplate>
    </ThemeProvider>
  );
}

export default LegitGuideSample;
