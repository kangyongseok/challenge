import { useMemo, useState } from 'react';
import type { HTMLAttributes } from 'react';

import dayjs from 'dayjs';
import { Box, Flexbox, Icon, Image, Label, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { Badge } from '@components/UI/atoms';

import type { ProductLegit } from '@dto/productLegit';

import { productPostType } from '@constants/common';

import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber, getProductCardImageResizePath } from '@utils/common';

import useSession from '@hooks/useSession';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

interface LegitStatusCardProps extends HTMLAttributes<HTMLDivElement> {
  productLegit: ProductLegit;
  useInAdmin?: boolean;
  hidePrice?: boolean;
}

function LegitStatusCard({
  productLegit: {
    userId,
    status,
    result,
    legitOpinions,
    dateCreated,
    dateCompleted,
    isViewed,
    productResult: { title, imageMain, imageThumbnail, price, postType, brand }
  },
  useInAdmin = false,
  hidePrice = false,
  ...props
}: LegitStatusCardProps) {
  const {
    theme: {
      palette: { common, secondary }
    }
  } = useTheme();

  const [loadFailed, setLoadFailed] = useState(false);

  const { data: accessUser } = useSession();
  const { data: { roles = [] } = {} } = useQueryUserInfo();

  const isMine = accessUser && accessUser.userId === userId;

  const role = useMemo(() => {
    if ((roles as string[]).includes('PRODUCT_LEGIT_HEAD')) {
      return 'head';
    }
    if ((roles as string[]).includes('PRODUCT_LEGIT')) {
      return 'normal';
    }

    return 'none';
  }, [roles]);

  const labelText = useMemo(() => {
    let newLabelText = '';

    if (useInAdmin) {
      if (role === 'head') {
        const hasMyLegitOpinion = legitOpinions.find(
          ({ roleLegit }) => roleLegit.userId === (accessUser || {}).userId
        );
        if (status === 10 && !hasMyLegitOpinion) {
          newLabelText = '감정신청';
        } else if (status === 10 && hasMyLegitOpinion) {
          newLabelText = '작성완료';
        } else if (status === 11) {
          newLabelText = '감정불가';
        } else if (status === 12) {
          newLabelText = '보완요청';
        } else if (status === 13) {
          newLabelText = '보완완료';
        } else if (status === 20 && !hasMyLegitOpinion) {
          newLabelText = '감정중';
        } else if (status === 20 && hasMyLegitOpinion) {
          newLabelText = '작성완료';
        } else if (status === 30) {
          if (result === 1) {
            newLabelText = '정품의견';
          } else if (result === 2) {
            newLabelText = '가품의심';
          } else {
            newLabelText = '감정불가';
          }
        }
      } else if (role === 'normal') {
        const hasMyLegitOpinion = legitOpinions.find(
          ({ roleLegit }) => roleLegit.userId === (accessUser || {}).userId
        );

        if (status === 20 && !hasMyLegitOpinion) {
          newLabelText = '감정신청';
        } else if (status === 20 && hasMyLegitOpinion) {
          newLabelText = '작성완료';
        } else if (status === 30) {
          if (result === 1) {
            newLabelText = '정품의견';
          } else if (result === 2) {
            newLabelText = '가품의심';
          } else {
            newLabelText = '감정불가';
          }
        }
      }
    } else if (isMine) {
      if (status === 10) {
        newLabelText = '감정중';
      } else if (status === 11) {
        newLabelText = '감정불가';
      } else if (status === 12) {
        newLabelText = '감정불가';
      } else if (status === 13) {
        newLabelText = '감정중';
      } else if (status === 20) {
        newLabelText = '감정중';
      } else if (status === 30) {
        if (result === 1) {
          newLabelText = '정품의견';
        } else if (result === 2) {
          newLabelText = '가품의심';
        } else {
          newLabelText = '감정불가';
        }
      }
    } else if (status === 10) {
      newLabelText = '감정중';
    } else if (status === 11) {
      newLabelText = '감정불가';
    } else if (status === 12) {
      newLabelText = '감정불가';
    } else if (status === 13) {
      newLabelText = '감정중';
    } else if (status === 20) {
      newLabelText = '감정중';
    } else if (status === 30) {
      if (result === 1) {
        newLabelText = '정품의견';
      } else if (result === 2) {
        newLabelText = '가품의심';
      } else {
        newLabelText = '감정불가';
      }
    }

    return newLabelText;
  }, [useInAdmin, isMine, status, role, legitOpinions, accessUser, result]);

  return (
    <Flexbox {...props} gap={16} customStyle={{ cursor: 'pointer', userSelect: 'none' }}>
      <Box
        customStyle={{
          position: 'relative',
          flexGrow: 1,
          minWidth: 100,
          maxWidth: 100,
          borderRadius: 8
        }}
      >
        <Image
          ratio="5:6"
          src={
            loadFailed
              ? imageMain || imageThumbnail
              : getProductCardImageResizePath(imageMain || imageThumbnail)
          }
          alt={`${title} 이미지`}
          round={8}
          onError={() => setLoadFailed(true)}
        />
        {labelText === '감정신청' && (
          <Label
            variant="outline"
            brandColor="red"
            text={labelText}
            size="small"
            customStyle={{ position: 'absolute', top: 8, left: 8 }}
          />
        )}
        {labelText === '정품의견' && (
          <Label
            variant="darked"
            brandColor="primary"
            text={labelText}
            size="small"
            customStyle={{
              position: 'absolute',
              top: 8,
              left: 8
            }}
            startIcon={<Icon name="OpinionAuthenticOutlined" color={common.uiWhite} />}
          />
        )}
        {labelText === '가품의심' && (
          <Label
            variant="darked"
            brandColor="red"
            text={labelText}
            size="small"
            customStyle={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: secondary.red.dark
            }}
            startIcon={<Icon name="OpinionFakeOutlined" color={common.uiWhite} />}
          />
        )}
        {['보완요청', '보완완료', '감정불가'].includes(labelText) && (
          <Label
            variant="darked"
            brandColor="black"
            text={labelText}
            size="small"
            customStyle={{ position: 'absolute', top: 8, left: 8 }}
            startIcon={<Icon name="OpinionImpossibleOutlined" color={common.uiWhite} />}
          />
        )}
        {['작성완료', '감정중'].includes(labelText) && (
          <Label
            variant="outline"
            brandColor="gray"
            text={labelText}
            size="small"
            customStyle={{ position: 'absolute', top: 8, left: 8 }}
          />
        )}
        <Badge
          open={!isViewed}
          variant="two-tone"
          type="alone"
          brandColor="red"
          width={20}
          height={20}
          customStyle={{ position: 'absolute', top: -10, right: -10 }}
        >
          <Typography variant="small2" weight="bold" customStyle={{ color: common.cmnW }}>
            N
          </Typography>
        </Badge>
      </Box>
      <Flexbox
        direction="vertical"
        gap={2}
        customStyle={{
          position: 'relative',
          flexGrow: 1,
          padding: '2px 0'
        }}
      >
        <Typography variant="body2" weight="bold">
          {(brand?.nameEng || '')
            .split(' ')
            .map(
              (splitNameEng) =>
                `${splitNameEng.charAt(0).toUpperCase()}${splitNameEng.slice(
                  1,
                  splitNameEng.length
                )}`
            )
            .join(' ')}
        </Typography>
        <Typography variant="body2" noWrap lineClamp={2} customStyle={{ color: common.ui60 }}>
          {title}
        </Typography>
        {!hidePrice && !!price && postType !== productPostType.photoLegit && (
          <Typography variant="h3" weight="bold" customStyle={{ paddingTop: 2 }}>
            {`${commaNumber(getTenThousandUnitPrice(price || 0))}만원`}
          </Typography>
        )}
        <Box customStyle={{ paddingTop: 6 }}>
          {(role === 'head'
            ? ['감정중', '보완요청', '보완완료'].includes(labelText)
            : ['감정중', '감정불가'].includes(labelText)) && (
            <Typography variant="body3" customStyle={{ color: common.ui60 }}>
              신청일 : {dayjs(dateCreated).format('YYYY.MM.DD HH:mm')}
            </Typography>
          )}
          {labelText === '작성완료' && (
            <>
              <Typography variant="body3" customStyle={{ color: common.ui60 }}>
                신청일 : {dayjs(dateCreated).format('YYYY.MM.DD HH:mm')}
              </Typography>
              {dateCompleted && (
                <Typography variant="body3" customStyle={{ color: common.ui60 }}>
                  완료예정일 : {dayjs(dateCompleted).format('YYYY.MM.DD HH:mm')}
                </Typography>
              )}
            </>
          )}
          {['정품의견', '가품의심'].includes(labelText) && (
            <>
              <Typography variant="body3" customStyle={{ color: common.ui60 }}>
                신청일 : {dayjs(dateCreated).format('YYYY.MM.DD HH:mm')}
              </Typography>
              {dateCompleted && (
                <Typography variant="body3" customStyle={{ color: common.ui60 }}>
                  완료일 : {dayjs(dateCompleted).format('YYYY.MM.DD HH:mm')}
                </Typography>
              )}
            </>
          )}
        </Box>
      </Flexbox>
    </Flexbox>
  );
}

export default LegitStatusCard;
