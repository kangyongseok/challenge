import { useMemo } from 'react';

import { Flexbox, Typography } from '@mrcamelhub/camel-ui';

interface UserShopEmptyProps {
  tab: string;
}

function UserShopEmpty({ tab }: UserShopEmptyProps) {
  const { icon, text } = useMemo(() => {
    const result = {
      icon: '🥲',
      text: '판매중인 매물이 없어요!'
    };

    switch (tab) {
      case '1':
        result.icon = '🥲';
        result.text = '판매완료된 매물이 없어요!';
        break;
      case '2':
        result.icon = '🥲';
        result.text = '등록된 후기가 없어요!';
        break;
      case '0':
      default:
        break;
    }

    return result;
  }, [tab]);

  return (
    <Flexbox
      component="section"
      alignment="center"
      direction="vertical"
      customStyle={{ margin: 20, padding: '84px 0 ' }}
      gap={20}
    >
      <Typography customStyle={{ width: 52, height: 52, fontSize: 52 }}>{icon}</Typography>
      <Typography variant="h3" weight="bold">
        {text}
      </Typography>
    </Flexbox>
  );
}

export default UserShopEmpty;
