import { useMemo } from 'react';
import type { HTMLAttributes } from 'react';

import { Avatar, Label, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';

import { Badge, Image } from '@components/UI/atoms';

import type { ProductLegit } from '@dto/productLegit';

import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber } from '@utils/common';

import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

import { Content, ImageBox, StyledLegitStatusCard, Title } from './LegitStatusCard.styles';

interface LegitStatusCardProps extends HTMLAttributes<HTMLDivElement> {
  productLegit: ProductLegit;
  useInAdmin?: boolean;
}

function LegitStatusCard({
  productLegit: {
    userId,
    status,
    legitOpinions,
    dateCreated,
    dateCompleted,
    isViewed,
    productResult: { title, imageMain, imageThumbnail, site, siteUrl, price, postType }
  },
  useInAdmin = false,
  ...props
}: LegitStatusCardProps) {
  const {
    theme: {
      box: { round },
      palette: { secondary, common }
    }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();
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
          newLabelText = '감정신청';
        } else if (status === 20 && hasMyLegitOpinion) {
          newLabelText = '작성완료';
        } else if (status === 30) {
          newLabelText = '감정완료';
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
          newLabelText = '감정완료';
        }
      }
    } else if (isMine) {
      if (status === 10) {
        newLabelText = '감정신청';
      } else if (status === 11) {
        newLabelText = '감정불가';
      } else if (status === 12) {
        newLabelText = '감정불가';
      } else if (status === 13) {
        newLabelText = '감정신청';
      } else if (status === 20) {
        newLabelText = '감정중';
      } else if (status === 30) {
        newLabelText = '감정완료';
      }
    } else if (status === 10) {
      newLabelText = '감정신청';
    } else if (status === 11) {
      newLabelText = '감정불가';
    } else if (status === 12) {
      newLabelText = '감정불가';
    } else if (status === 13) {
      newLabelText = '감정신청';
    } else if (status === 20) {
      newLabelText = '감정중';
    } else if (status === 30) {
      newLabelText = '감정완료';
    }

    return newLabelText;
  }, [legitOpinions, role, isMine, status, accessUser, useInAdmin]);

  return (
    <StyledLegitStatusCard
      alignment="center"
      useInAdmin={useInAdmin}
      status={status}
      gap={12}
      {...props}
    >
      <ImageBox>
        <Image
          variant="backgroundImage"
          src={imageMain || imageThumbnail}
          alt="Product Legit Img"
          disableAspectRatio
          customStyle={{ borderRadius: round['8'] }}
        />
        {!postType && (
          <Avatar
            width="20px"
            height="20px"
            alt="Platform Logo Img"
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${
              (siteUrl || {}).id || (site || {}).id
            }.png`}
            round="4"
            customStyle={{
              position: 'absolute',
              top: 8,
              left: 8
            }}
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
      </ImageBox>
      <Content>
        {labelText === '감정신청' && (
          <Label
            variant="contained"
            text={labelText}
            size="xsmall"
            customStyle={{ maxWidth: 'fit-content', backgroundColor: secondary.blue.light }}
          />
        )}
        {labelText === '감정완료' && (
          <Label
            variant="contained"
            brandColor="black"
            text={labelText}
            size="xsmall"
            customStyle={{ maxWidth: 'fit-content' }}
          />
        )}
        {['보완요청', '보완완료', '감정불가'].includes(labelText) && (
          <Label
            variant="contained"
            text={labelText}
            size="xsmall"
            customStyle={{ maxWidth: 'fit-content', backgroundColor: secondary.red.light }}
          />
        )}
        {['작성완료', '감정중'].includes(labelText) && (
          <Label
            variant="darked"
            brandColor="primary"
            text={labelText}
            size="xsmall"
            customStyle={{ maxWidth: 'fit-content' }}
          />
        )}
        <Title variant="body2" weight="medium">
          {title}
        </Title>
        {!postType && (
          <Typography variant="h4" weight="bold" customStyle={{ marginTop: 4 }}>
            {`${commaNumber(getTenThousandUnitPrice(price))}만원`}
          </Typography>
        )}
        {role === 'head' && ['감정신청', '보완요청', '보완완료'].includes(labelText) && (
          <Typography
            variant="small2"
            weight="medium"
            customStyle={{ marginTop: 8, color: common.ui60 }}
          >
            신청일 : {dayjs(dateCreated).format('YYYY.MM.DD HH:mm')}
          </Typography>
        )}
        {role !== 'head' && ['감정신청', '감정불가'].includes(labelText) && (
          <Typography
            variant="small2"
            weight="medium"
            customStyle={{ marginTop: 8, color: common.ui60 }}
          >
            신청일 : {dayjs(dateCreated).format('YYYY.MM.DD HH:mm')}
          </Typography>
        )}
        {['감정중', '작성완료'].includes(labelText) && (
          <>
            <Typography
              variant="small2"
              weight="medium"
              customStyle={{ marginTop: 8, color: common.ui60 }}
            >
              신청일 : {dayjs(dateCreated).format('YYYY.MM.DD HH:mm')}
            </Typography>
            {dateCompleted && (
              <Typography
                variant="small2"
                weight="medium"
                customStyle={{ marginTop: 2, color: common.ui60 }}
              >
                완료예정일 : {dayjs(dateCompleted).format('YYYY.MM.DD HH:mm')}
              </Typography>
            )}
          </>
        )}
        {labelText === '감정완료' && (
          <>
            <Typography
              variant="small2"
              weight="medium"
              customStyle={{ marginTop: 8, color: common.ui60 }}
            >
              신청일 : {dayjs(dateCreated).format('YYYY.MM.DD HH:mm')}
            </Typography>
            {dateCompleted && (
              <Typography
                variant="small2"
                weight="medium"
                customStyle={{ marginTop: 2, color: common.ui60 }}
              >
                완료일 : {dayjs(dateCompleted).format('YYYY.MM.DD HH:mm')}
              </Typography>
            )}
          </>
        )}
      </Content>
    </StyledLegitStatusCard>
  );
}

export default LegitStatusCard;
