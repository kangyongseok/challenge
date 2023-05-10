import { useRecoilState } from 'recoil';
import { Avatar, BottomSheet, Button, Flexbox } from '@mrcamelhub/camel-ui';

import {
  settingsTransferPlatformsState,
  settingsTransferSelectBottomSheetOpenState
} from '@recoil/settingsTransfer';

function SettingsTransferSelectBottomSheet() {
  const [open, setOpen] = useRecoilState(settingsTransferSelectBottomSheetOpenState);
  const [platforms, setPlatforms] = useRecoilState(settingsTransferPlatformsState);

  const handleClick = (id: number) => () => {
    setPlatforms((prevState) =>
      prevState.map((platform) => ({
        ...platform,
        selected: platform.id === id
      }))
    );
    setOpen(false);
  };

  return (
    <BottomSheet
      open={open}
      onClose={() => setOpen(false)}
      disableSwipeable
      customStyle={{
        maxHeight: 366
      }}
    >
      <Flexbox
        direction="vertical"
        justifyContent="center"
        customStyle={{
          height: '100%',
          padding: 20,
          overflowY: 'auto'
        }}
      >
        {platforms.map(({ id, name }) => (
          <Button
            key={`transfer-platform-${id}`}
            variant="inline"
            brandColor="black"
            size="xlarge"
            startIcon={
              <Avatar
                width={24}
                height={24}
                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${id}.png`}
                alt="플랫폼 아이콘"
                round={4}
              />
            }
            fullWidth
            onClick={handleClick(id)}
            customStyle={{
              justifyContent: 'flex-start',
              paddingLeft: 0,
              paddingRight: 0,
              // TODO UI 라이브러리 수정 필요
              fontWeight: 400
            }}
          >
            {name}
          </Button>
        ))}
      </Flexbox>
    </BottomSheet>
  );
}

export default SettingsTransferSelectBottomSheet;
