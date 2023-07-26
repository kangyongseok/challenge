import type { MouseEvent } from 'react';

import { useSetRecoilState } from 'recoil';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Box, Chip, Flexbox, Icon, Image, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { Empty } from '@components/UI/atoms';

import { UserKeywordInfo } from '@dto/user';

import { logEvent } from '@library/amplitude';

import { deleteUserKeywords, fetchAlarm, fetchUserKeywords } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import { getTenThousandUnitPrice } from '@utils/formats';
import { getImageResizePath } from '@utils/common';

import {
  keywordAlertManageBottomSheetState,
  keywordAlertOffDialogOpenState
} from '@recoil/keywordAlert';

function SettingsKeywordAlertList() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const setKeywordAlertManageBottomSheetState = useSetRecoilState(
    keywordAlertManageBottomSheetState
  );
  const setKeywordAlertOffOpenState = useSetRecoilState(keywordAlertOffDialogOpenState);

  const {
    data = [],
    fetchStatus,
    refetch
  } = useQuery(queryKeys.users.userKeywords(), () => fetchUserKeywords(), {
    staleTime: 5 * 60 * 1000
  });

  const { data: { isNotiKeyword } = {} } = useQuery(queryKeys.users.alarms(), fetchAlarm, {
    staleTime: 5 * 60 * 1000
  });

  const { mutate } = useMutation(deleteUserKeywords);

  const handleClickDelete = (id: number, keyword: string) => (e: MouseEvent<HTMLOrSVGElement>) => {
    logEvent(attrKeys.mypage.CLICK_KEYWORD_ALERT, {
      att: 'DELETE',
      keyword
    });

    e.stopPropagation();

    mutate(id, {
      onSuccess() {
        refetch();
      }
    });
  };

  const handleClick =
    ({ id, keyword, minPrice, maxPrice, isMySize }: Omit<UserKeywordInfo, 'userId'>) =>
    () => {
      logEvent(attrKeys.mypage.CLICK_KEYWORD_ALERT, {
        att: 'EDIT',
        keyword
      });

      if (!isNotiKeyword) {
        setKeywordAlertManageBottomSheetState((prevState) => ({
          ...prevState,
          id,
          keyword,
          minPrice: getTenThousandUnitPrice(minPrice || 0),
          maxPrice: getTenThousandUnitPrice(maxPrice || 0),
          isMySize
        }));
        setKeywordAlertOffOpenState(true);
      } else {
        setKeywordAlertManageBottomSheetState((prevState) => ({
          ...prevState,
          open: true,
          id,
          keyword,
          minPrice: getTenThousandUnitPrice(minPrice || 0),
          maxPrice: getTenThousandUnitPrice(maxPrice || 0),
          isMySize
        }));
      }
    };

  const convertPrice = (minPrice: number, maxPrice: number) => () => {
    if (minPrice && !maxPrice) {
      return `${minPrice}만원~`;
    }
    if (!minPrice && maxPrice) {
      return `~${maxPrice}만원`;
    }
    if (minPrice && maxPrice) {
      return `${minPrice}만원~${maxPrice}만원`;
    }
    return undefined;
  };

  if (fetchStatus === 'idle' && !data.length) {
    return (
      <Empty>
        <Image
          src={getImageResizePath({
            imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/empty_face.png`,
            w: 52
          })}
          alt="empty img"
          width={52}
          height={52}
          disableAspectRatio
          disableSkeleton
        />
        <Flexbox direction="vertical" alignment="center" justifyContent="center" gap={8}>
          <Typography variant="h3" weight="bold" color="ui60">
            등록된 키워드가 없어요
          </Typography>
          <Typography variant="h4" color="ui60" customStyle={{ textAlign: 'center' }}>
            관심있는 매물의 키워드를 등록해보세요.
            <br />새 매물이 등록되면 알려드려요.
          </Typography>
        </Flexbox>
      </Empty>
    );
  }

  // if (!isLoading && !data.length) {
  //   return (
  //     <Flexbox
  //       component="section"
  //       direction="vertical"
  //       alignment="center"
  //       justifyContent="center"
  //       customStyle={{
  //         marginTop: 116
  //       }}
  //     >
  //       <Flexbox
  //         direction="vertical"
  //         alignment="center"
  //         justifyContent="center"
  //         customStyle={{
  //           maxWidth: 52,
  //           maxHeight: 52,
  //           fontSize: 52
  //         }}
  //       >
  //         🫥
  //       </Flexbox>
  //       <Typography
  //         variant="h3"
  //         weight="bold"
  //         color="ui60"
  //         textAlign="center"
  //         customStyle={{
  //           marginTop: 20
  //         }}
  //       >
  //         등록된 키워드가 없어요.
  //       </Typography>
  //       <Typography
  //         variant="h4"
  //         color="ui60"
  //         textAlign="center"
  //         customStyle={{
  //           marginTop: 8
  //         }}
  //       >
  //         관심있는 매물의 키워드를 등록해보세요. 새 매물이 등록되면 알려드려요.
  //       </Typography>
  //     </Flexbox>
  //   );
  // }

  return (
    <Box
      component="section"
      customStyle={{
        marginTop: 32
      }}
    >
      <Flexbox gap={8}>
        <Typography color="ui60">등록한 키워드</Typography>
        <Typography
          color="ui60"
          customStyle={{
            '& > span': {
              fontWeight: 500,
              color: common.ui20
            }
          }}
        >
          <span>{data.length}</span>/50
        </Typography>
      </Flexbox>
      <Flexbox
        gap={8}
        customStyle={{
          marginTop: 12,
          flexWrap: 'wrap'
        }}
      >
        {data.map(({ id, keyword, minPrice, maxPrice, isMySize }) => (
          <Chip
            key={`keyword-${id}`}
            variant="ghost"
            brandColor="black"
            subText={convertPrice(
              getTenThousandUnitPrice(minPrice || 0),
              getTenThousandUnitPrice(maxPrice || 0)
            )()}
            endIcon={<Icon name="CloseOutlined" onClick={handleClickDelete(id, keyword)} />}
            onClick={handleClick({ id, keyword, minPrice, maxPrice, isMySize })}
            customStyle={{
              // TODO UI 라이브러리 Chip 컴포넌트 noWrap 추가
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            <Typography noWrap>{keyword}</Typography>
          </Chip>
        ))}
      </Flexbox>
    </Box>
  );
}

export default SettingsKeywordAlertList;
