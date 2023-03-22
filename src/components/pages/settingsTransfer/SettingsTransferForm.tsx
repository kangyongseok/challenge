import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState } from 'recoil';
import {
  Avatar,
  Chip,
  Flexbox,
  Icon,
  Image,
  Input,
  Tooltip,
  Typography,
  useTheme
} from 'mrcamel-ui';

import {
  settingsTransferDataState,
  settingsTransferPlatformsState
} from '@recoil/settingsTransfer';

function SettingsTransferForm() {
  const {
    theme: {
      palette: { common, secondary }
    }
  } = useTheme();

  const [isUrlValidator, setIsUrlValidator] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<
    | {
        id: number;
        name: string;
        selected: boolean;
      }
    | undefined
  >();

  const [{ url }, setData] = useRecoilState(settingsTransferDataState);
  const [platforms, setPlatforms] = useRecoilState(settingsTransferPlatformsState);

  const urlValidator = (urlString: string) => {
    return /(http(s)?:\/\/)([a-z0-9\w]+\.*)+[a-z0-9]{2,4}/gi.test(urlString);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsUrlValidator(urlValidator(e.currentTarget.value));

    setData((prevState) => ({
      ...prevState,
      url: e.currentTarget.value,
      isUrlPattern: urlValidator(e.currentTarget.value)
    }));
  };

  const handleClick = (id: number) => () => {
    setPlatforms((prevState) =>
      prevState.map((platform) => ({
        ...platform,
        selected: platform.id === id
      }))
    );
  };

  useEffect(() => {
    setSelectedPlatform(platforms.find(({ selected }) => selected));
  }, [platforms]);

  useEffect(() => {
    if (!selectedPlatform) return;

    setData((prevState) => ({
      ...prevState,
      siteId: selectedPlatform.id
    }));
  }, [setData, selectedPlatform]);

  return (
    <Flexbox
      component="section"
      direction="vertical"
      gap={52}
      customStyle={{
        marginTop: 32
      }}
    >
      <Flexbox direction="vertical" gap={12}>
        <Typography weight="bold" variant="h4">
          가져오기 할 플랫폼을 선택해주세요
        </Typography>
        <Flexbox alignment="center" customStyle={{ flexWrap: 'wrap' }} gap={8}>
          {platforms.map((platform) => (
            <Chip
              key={`platform-${platform.id}`}
              size="xlarge"
              customStyle={{
                borderRadius: 8,
                fontSize: 15,
                background: platform.selected ? common.ui20 : common.uiWhite
              }}
              onClick={handleClick(platform.id)}
              variant={platform.selected ? 'solid' : 'outline'}
            >
              <Avatar
                width={20}
                height={20}
                src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${platform.id}.png`}
                alt="플랫폼 아이콘"
                round={4}
              />
              {platform.name}
            </Chip>
          ))}
        </Flexbox>
        {selectedPlatform && (
          <Image
            width={335}
            height={131}
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/my/platform_banner_${selectedPlatform.id}.png`}
            alt={`${selectedPlatform.name} 배너 이미지`}
            disableAspectRatio
            customStyle={{ borderRadius: 9, marginTop: 12 }}
          />
        )}
      </Flexbox>
      <Flexbox direction="vertical" gap={12}>
        <Flexbox alignment="center">
          <Typography weight="bold" variant="h4">
            내 상점의 url을 입력해주세요.
          </Typography>
          <Tooltip
            open={isOpen}
            placement="bottom"
            customStyle={{ borderRadius: 8, padding: 10, bottom: 15 }}
            message={
              <Flexbox customStyle={{ position: 'relative' }} alignment="flex-start" gap={10}>
                <Typography
                  variant="body2"
                  weight="medium"
                  customStyle={{ color: common.uiWhite, textAlign: 'left' }}
                >
                  내 상점 또는 상품 상세페이지 우측 상단에 있는
                  <br />
                  공유하기 버튼을 클릭해, 링크 복사 후 붙여넣기
                  <br />해 주세요!
                </Typography>
                <Icon
                  name="CloseOutlined"
                  customStyle={{ color: common.uiWhite }}
                  size="small"
                  onClick={() => setIsOpen(false)}
                />
              </Flexbox>
            }
          >
            <Icon
              width={20}
              height={20}
              name="QuestionCircleOutlined"
              onClick={() => setIsOpen((prev) => !prev)}
              customStyle={{ marginTop: -4 }}
            />
          </Tooltip>
        </Flexbox>
        <Input
          type="search"
          fullWidth
          size="xlarge"
          onChange={handleChange}
          value={url}
          placeholder="https://"
          customStyle={{
            border: `1px solid ${!isUrlValidator && url ? secondary.red.light : common.line01}`
          }}
        />
        {!isUrlValidator && url && (
          <Typography
            variant="small2"
            weight="medium"
            customStyle={{ color: secondary.red.light, marginLeft: 14 }}
          >
            올바른 url 형식이 아닙니다.
          </Typography>
        )}
      </Flexbox>
    </Flexbox>
  );
}

export default SettingsTransferForm;
