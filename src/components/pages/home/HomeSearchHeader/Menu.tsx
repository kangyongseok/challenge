import { useRouter } from 'next/router';
import { Flexbox, Icon } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import Badge from '@components/UI/atoms/Badge';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { ACCESS_USER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryUserInfo from '@hooks/useQueryUserInfo';

interface MenuProps {
  reverseAnimation?: boolean;
}

function Menu({ reverseAnimation }: MenuProps) {
  const router = useRouter();

  const { data: { notViewedHistoryCount = 0 } = {} } = useQueryUserInfo();

  const handleClick = () => {
    logEvent(attrKeys.home.CLICK_BEHAVIOR_LIST, {
      name: attrProperty.name.MAIN,
      title: notViewedHistoryCount > 0 ? attrProperty.title.NEW : attrProperty.title.GENERAL
    });

    if (!LocalStorage.get(ACCESS_USER)) {
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
    <Flexbox gap={16} alignment="center">
      <SlideDown delay={0.5} reverseAnimation={reverseAnimation}>
        <Icon name="HeartOutlined" onClick={handleClickWish} />
      </SlideDown>
      <SlideDown reverseAnimation={reverseAnimation}>
        <Badge
          open={!!notViewedHistoryCount}
          variant="two-tone"
          brandColor="red"
          text={notViewedHistoryCount > 99 ? '99+' : notViewedHistoryCount}
          width={20}
          height={20}
          customStyle={{ top: -8, right: -8, width: 'fit-content', minWidth: 20 }}
        >
          <Icon name="AlarmOutlined" onClick={handleClick} />
        </Badge>
      </SlideDown>
    </Flexbox>
  );
}

const SlideDown = styled.div<{
  delay?: number;
  reverseAnimation?: boolean;
}>`
  animation: ${({ reverseAnimation }) => (reverseAnimation ? 'slideUp' : 'slideDown')}
    ${({ delay = 0.3 }) => delay}s forwards;
  @keyframes slideUp {
    0% {
      transform: translateY(100%);
    }
    100% {
      transform: translateY(0);
    }
  }
  @keyframes slideDown {
    0% {
      transform: translateY(-100%);
    }
    100% {
      transform: translateY(0);
    }
  }
`;

export default Menu;
