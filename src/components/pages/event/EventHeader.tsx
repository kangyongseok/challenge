import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Flexbox, Icon, Skeleton, Typography } from 'mrcamel-ui';

import { Header } from '@components/UI/molecules';
import { Badge } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import { fetchContent } from '@api/common';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function EventHeader() {
  const router = useRouter();
  const { id } = router.query;
  const splitIds = String(id).split('-');
  const eventId = Number(splitIds[splitIds.length - 1] || 0);

  const { data: { notViewedHistoryCount = 0 } = {} } = useQueryUserInfo();
  const { data: accessUser } = useQueryAccessUser();

  const { data: { title } = {}, isLoading } = useQuery(
    queryKeys.commons.content(Number(eventId)),
    () => fetchContent(eventId),
    {
      enabled: !!id
    }
  );

  const handleClick = () => {
    logEvent(attrKeys.home.CLICK_BEHAVIOR_LIST, {
      name: attrProperty.name.MAIN,
      title: notViewedHistoryCount > 0 ? attrProperty.title.NEW : attrProperty.title.GENERAL
    });

    if (!accessUser) {
      router.push('/login');
      return;
    }

    router.push('/notices');
  };

  const handleClickWish = () => {
    logEvent(attrKeys.home.CLICK_TAB_WISH);

    router.push('/wishes');
  };

  return (
    <Header
      showRight={false}
      rightIcon={
        <Flexbox
          gap={16}
          customStyle={{
            paddingRight: 8
          }}
        >
          <Icon name="HeartOutlined" onClick={handleClickWish} />
          <Badge
            open={!!notViewedHistoryCount}
            variant="two-tone"
            brandColor="red"
            text={notViewedHistoryCount > 99 ? '99+' : notViewedHistoryCount}
            width={20}
            height={20}
            customStyle={{ top: -8, right: -8, width: 'fit-content', minWidth: 20 }}
          >
            <Icon name="NotiOutlined" onClick={handleClick} />
          </Badge>
        </Flexbox>
      }
    >
      {isLoading && (
        <Skeleton width="100%" maxWidth={70} height={24} round={8} disableAspectRatio />
      )}
      {!isLoading && (
        <Typography variant="h3" weight="bold">
          {title}
          {eventId === 14 ? '?!' : ''}
        </Typography>
      )}
    </Header>
  );
}

export default EventHeader;
