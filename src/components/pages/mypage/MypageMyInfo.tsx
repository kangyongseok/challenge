import { useMemo } from 'react';

import { useRouter } from 'next/router';
import { find } from 'lodash-es';
import { Flexbox, Icon, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { Menu, MenuItem } from '@components/UI/molecules';

import { SizeValue } from '@dto/user';

import { logEvent } from '@library/amplitude';

import { purchaseType } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';

function MypageMyInfo() {
  const router = useRouter();

  const {
    data: {
      size,
      area: { values: area = [] } = {},
      info: { value: { yearOfBirth = '', gender = '' } = {} } = {},
      personalStyle: { purchaseTypes = [], styles = [] } = {}
    } = {}
  } = useQueryMyUserInfo();

  const userSizeParser = useMemo(() => {
    if (size && size.value) {
      const sizeValue = size.value as SizeValue;
      const keys = Object.keys(sizeValue);
      const hasSizeDataKeys = keys.filter((key) => !!sizeValue[key].length);

      if (hasSizeDataKeys.length === 1) {
        return sizeValue[hasSizeDataKeys[0]].map((value) => value.size).join(', ');
      }
      if (hasSizeDataKeys.length > 1) {
        const result: string[] = [];
        keys.forEach((key) => {
          if (sizeValue[key].length) {
            if (sizeValue[key].length > 2) {
              result.push(
                ...[sizeValue[key][0].size, ', ', sizeValue[key][1].size, ', ', '...', ' / ']
              );
            } else {
              result.push(
                ...[
                  ...sizeValue[key].map((value, i, origin) =>
                    origin.length - 1 !== i ? `${value.size}, ` : value.size
                  ),
                  ' / '
                ]
              );
            }
          }
        });
        return result.slice(0, result.length - 1);
      }
    }
    return '';
  }, [size]);

  const infoMenu = useMemo(() => {
    return [
      {
        label: '성별, 출생연도',
        data: gender && yearOfBirth ? `${gender === 'M' ? '남' : '여'}, ${yearOfBirth}` : '',
        onClick: () => {
          logEvent(attrKeys.mypage.CLICK_PERSONAL_INPUT, {
            name: attrProperty.name.MY,
            att: 'INFO',
            value: `${gender}/${yearOfBirth}`
          });

          router.push('/user/personalInput');
        }
      },
      {
        label: '사이즈',
        data: userSizeParser,
        onClick: () => {
          if (size?.value) {
            const { tops, bottoms, shoes } = size.value;
            logEvent(attrKeys.mypage.CLICK_PERSONAL_INPUT, {
              name: attrProperty.name.MY,
              att: 'SIZE',
              value: [...tops, ...bottoms, ...shoes]
                .map((info) => info.size || info.viewSize)
                .join(', ')
            });
          }

          router.push('/user/sizeInput');
        }
      },
      {
        label: '거래지역',
        data: area?.filter((list) => list.isActive)[0]?.areaName || '',
        onClick: () => {
          logEvent(attrKeys.mypage.CLICK_PERSONAL_INPUT, {
            name: attrProperty.name.MY,
            att: 'ADDRESS',
            value: area?.filter((list) => list.isActive)[0]?.areaName
          });

          router.push('/user/addressInput');
        }
      },
      {
        label: '관심모델',
        data:
          styles.length > 0
            ? `${styles[0].name} ${styles.length > 1 ? `외 ${styles.length - 1}` : ''}`
            : '',
        onClick: () => {
          logEvent(attrKeys.mypage.CLICK_PERSONAL_INPUT, {
            name: attrProperty.name.MY,
            att: 'STYLE_MODEL',
            value: styles.map((styleInfo) => styleInfo.name).join(', ')
          });

          router.push('/user/likeModelInput');
        }
      },
      {
        label: '중고 구매 유형',
        data: find(purchaseType, { value: purchaseTypes[0]?.id })?.subTitle || '',
        onClick: () => {
          logEvent(attrKeys.mypage.CLICK_PERSONAL_INPUT, {
            name: attrProperty.name.MY,
            att: 'BUYINGTYPE',
            value: find(purchaseType, { value: purchaseTypes[0]?.id })?.title
          });

          router.push('/user/purchaseInput');
        }
      }
    ];
  }, [area, gender, purchaseTypes, router, size, styles, userSizeParser, yearOfBirth]);

  return (
    <Menu title="내 정보">
      {infoMenu.map(({ label, data, onClick }) => (
        <MenuItem
          key={`info-menu-${label}`}
          action={
            <Flexbox
              gap={4}
              alignment="center"
              customStyle={{ width: 'calc(100% - 142px)', justifyContent: 'flex-end' }}
            >
              <ElipsisText>{data}</ElipsisText>
              <Icon
                name="Arrow2RightOutlined"
                size="small"
                customStyle={{ minWidth: 16, minHeight: 16 }}
              />
            </Flexbox>
          }
          onClick={onClick}
        >
          {label}
        </MenuItem>
      ))}
    </Menu>
  );
}

const ElipsisText = styled(Typography)`
  color: ${({
    theme: {
      palette: { secondary }
    }
  }) => secondary.blue.main};
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export default MypageMyInfo;
