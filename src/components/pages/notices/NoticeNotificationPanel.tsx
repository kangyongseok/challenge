import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import { useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { fetchAnnounceBase } from '@api/common';

import queryKeys from '@constants/queryKeys';
import { filterGenders } from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { selectedSearchOptionsDefault, selectedSearchOptionsState } from '@recoil/searchHelper';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

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
  const { data: accessUser } = useQueryAccessUser();
  const setSelectedSearchOptions = useSetRecoilState(selectedSearchOptionsState);
  const { data: { info: { value: { gender = '' } = {} } = {} } = {} } = useQueryUserInfo();

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
          top: targetIndex * 112,
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

    if (pathname) {
      if (pathname.includes('/searchHelper')) {
        const genderName = gender === 'F' ? 'female' : 'male';

        setSelectedSearchOptions((currVal) => ({
          ...currVal,
          pathname: router.asPath,
          gender: gender
            ? {
                id: filterGenders[genderName].id,
                name: genderName
              }
            : selectedSearchOptionsDefault.gender
        }));
      }

      router.push(pathname);
    }
  };

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
              <Typography variant="h3" weight="bold" customStyle={{ marginBottom: 8 }}>
                {notice.title}
              </Typography>
              <Typography variant="small1" customStyle={{ color: common.ui60 }}>
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
                        padding: '0 20px 16px'
                      }}
                    >
                      <Button
                        data-pathname={announceDetail.parameter}
                        onClick={handleClickCtaButton}
                        brandColor="primary"
                        variant="contained"
                        size="large"
                        fullWidth
                      >
                        {announceDetail.content}
                      </Button>
                    </Box>
                  );
                }
                return (
                  <Box key={`announce-detail-${announceDetail.id}`}>
                    <Box
                      customStyle={{
                        padding: '0 20px 8px'
                      }}
                    >
                      <Typography
                        variant="h4"
                        weight="bold"
                        dangerouslySetInnerHTML={{
                          __html: announceDetail.content.replace(
                            /{userName}/gi,
                            accessUser?.userName ?? ''
                          )
                        }}
                      />
                    </Box>
                    <Box
                      customStyle={{
                        padding: '0 20px 20px'
                      }}
                    >
                      <Typography
                        customStyle={{
                          lineHeight: '18px',
                          letterSpacing: '-0.2px'
                        }}
                        dangerouslySetInnerHTML={{
                          __html: announceDetail.subContent.replace(
                            /{userName}/gi,
                            accessUser?.userName ?? ''
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
                            />
                          )
                      )}
                  </Box>
                );
              })}
          </NoticeContentsWrap>
          <Line open={openNoticeId === notice.id} />
        </>
      ))}
    </Flexbox>
  );
}

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

const Image = styled.img`
  width: 100%;
`;

export default NoticeNotificationPanel;
