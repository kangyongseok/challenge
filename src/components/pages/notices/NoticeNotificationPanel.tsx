import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { Box, Button, Flexbox, Icon, Image, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchAnnounceBase } from '@api/common';

import queryKeys from '@constants/queryKeys';
import { NOTI, SOURCE } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getImagePathStaticParser, getImageResizePath } from '@utils/common';

import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';

function NoticeNotificationPanel() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();
  const [openNoticeId, setOpenNoticeId] = useState(0);
  const [targetIndex, setTargetIndex] = useState(0);
  const { data } = useQuery(queryKeys.commons.announces(), fetchAnnounceBase);
  const { userNickName } = useQueryMyUserInfo();

  useEffect(() => {
    if (data && !openNoticeId) {
      setOpenNoticeId(data.content[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (targetIndex && openNoticeId) {
      setTimeout(() => {
        window.scrollTo({
          top: targetIndex * 120,
          behavior: 'smooth'
        });
      }, 200);
    }
  }, [openNoticeId, targetIndex]);

  const handleClickItem = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget as HTMLElement;
    logEvent(attrKeys.noti.CLICK_ANNOUNCE_DETAIL, {
      name: attrProperty.name.ANNOUNCE_LIST,
      att: target.dataset.noticeId
    });

    if (target.dataset.index) {
      setTargetIndex(Number(target.dataset.index));
    }
    if (target.dataset.noticeId) {
      setOpenNoticeId((prev) =>
        prev === Number(target.dataset.noticeId) ? 0 : Number(target.dataset.noticeId)
      );
    }
  };

  const handleClickCtaButton = (event: MouseEvent<HTMLButtonElement>) => {
    const pathname = event.currentTarget.getAttribute('data-pathname');

    LocalStorage.set(SOURCE, NOTI);
    if (pathname) {
      router.push(pathname);
    }
  };

  useEffect(() => {
    if (router.query.announceId) {
      setTargetIndex(
        data?.content.findIndex((content) => content.id === Number(router.query.announceId)) || 0
      );
      setOpenNoticeId(Number(router.query.announceId));
    }
  }, [data?.content, router.query.announceId]);

  return (
    <Flexbox customStyle={{ padding: '32px 20px' }} direction="vertical">
      {data?.content.map((notice, i) => (
        <>
          <Flexbox
            alignment="center"
            justifyContent="space-between"
            gap={20}
            data-index={i}
            data-notice-id={notice.id}
            onClick={handleClickItem}
          >
            <Box>
              <Typography
                variant="h3"
                weight="bold"
                customStyle={{ marginBottom: 8 }}
                dangerouslySetInnerHTML={{ __html: notice.title }}
              />
              <Typography variant="body2" customStyle={{ color: common.ui60 }}>
                {dayjs(notice.dateCreated).format('YYYY.MM.DD')}
              </Typography>
            </Box>
            <IconWrap alignment="center" justifyContent="center" open={openNoticeId === notice.id}>
              <Icon
                name={openNoticeId === notice.id ? 'DropUpFilled' : 'DropdownFilled'}
                width={25}
              />
            </IconWrap>
          </Flexbox>
          <NoticeContentsWrap gap={32} direction="vertical" open={openNoticeId === notice.id}>
            {openNoticeId === notice.id &&
              notice.announceDetails.map((announceDetail) => {
                if (announceDetail.type === 1) {
                  return (
                    <Box
                      key={`announce-detail-${announceDetail.id}`}
                      customStyle={{
                        padding: '0 0 16px'
                      }}
                    >
                      <Button
                        data-pathname={announceDetail.parameter}
                        onClick={handleClickCtaButton}
                        brandColor="primary"
                        variant="solid"
                        size="large"
                        fullWidth
                      >
                        {announceDetail.content}
                      </Button>
                    </Box>
                  );
                }
                if (announceDetail.type === 2 || announceDetail.images.split('|').length > 1) {
                  return (
                    <Swiper
                      key={`announce-detail-${announceDetail.id}`}
                      spaceBetween={30}
                      speed={2500}
                      loop
                      modules={[Autoplay]}
                      autoplay={{
                        delay: 0
                      }}
                      slidesPerView="auto"
                      style={{
                        position: 'relative',
                        width: '100%'
                      }}
                    >
                      {announceDetail.images.split('|').map((img) => (
                        <SwiperSlide key={`announce-detail-${announceDetail.id}-${img}`}>
                          <Box>
                            <Image
                              src={getImageResizePath({
                                imagePath: getImagePathStaticParser(img),
                                w: 350
                              })}
                              alt="구매대행 후기"
                              disableAspectRatio
                            />
                          </Box>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  );
                }
                return (
                  <Wrap key={`announce-detail-${announceDetail.id}`}>
                    <Box
                      customStyle={{
                        padding: '0 0 8px'
                      }}
                    >
                      <Typography
                        variant="h4"
                        weight="bold"
                        customStyle={{ wordBreak: 'keep-all' }}
                        dangerouslySetInnerHTML={{
                          __html: announceDetail.content.replace(/{userName}/gi, userNickName ?? '')
                        }}
                      />
                    </Box>
                    <Box
                      customStyle={{
                        padding: '0 0 20px'
                      }}
                    >
                      <Typography
                        customStyle={{
                          lineHeight: '18px',
                          letterSpacing: '-0.2px',
                          wordBreak: 'keep-all'
                        }}
                        dangerouslySetInnerHTML={{
                          __html: announceDetail.subContent.replace(
                            /{userName}/gi,
                            userNickName ?? ''
                          )
                        }}
                      />
                    </Box>
                    {announceDetail.images
                      .split('|')
                      .map(
                        (src) =>
                          src && (
                            <Image
                              key={`announce-detail-image-${src}`}
                              src={src}
                              alt="Announce Detail Img"
                              round={8}
                              disableAspectRatio
                            />
                          )
                      )}
                  </Wrap>
                );
              })}
          </NoticeContentsWrap>
          <Line open={openNoticeId === notice.id} />
        </>
      ))}
    </Flexbox>
  );
}

const Wrap = styled.div`
  span {
    color: #7b7d85;
    font-size: 12px;
    margin-top: -25px;
    position: relative;
    display: block;
  }
`;

const IconWrap = styled(Flexbox)<{ open: boolean }>`
  width: 24px;
  height: 24px;
  border: 1px solid
    ${({ theme: { palette }, open }) => (open ? palette.common.ui20 : palette.common.ui80)};
  border-radius: 50%;
  padding-left: 9px;
  svg {
    min-width: 20px;
    color: ${({ theme: { palette }, open }) => (open ? palette.common.ui20 : palette.common.ui80)};
  }
`;

const Line = styled.div<{ open: boolean }>`
  width: calc(100% + 40px);
  border-bottom: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line02};
  margin: ${({ open }) => (open ? '0 0 32px 0' : '32px 0')};
  margin-left: -20px;
`;

const NoticeContentsWrap = styled(Flexbox)<{ open: boolean }>`
  width: calc(100% + 40px);
  margin-left: -20px;
  background: ${({ theme: { palette } }) => palette.common.bg03};
  padding: ${({ open }) => (open ? '32px 20px' : '0 20px')};
  opacity: ${({ open }) => (open ? 1 : 0)};
  margin-top: ${({ open }) => (open ? 32 : 0)}px;
  transition: all 0.2s ease-in-out;
`;

export default NoticeNotificationPanel;
