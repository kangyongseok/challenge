import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Avatar, Button, Flexbox, Icon, Input, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import {
  settingsTransferDataState,
  settingsTransferPlatformsState,
  settingsTransferSelectBottomSheetOpenState
} from '@recoil/settingsTransfer';

function SettingsTransferForm() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [selectedPlatform, setSelectedPlatform] = useState<
    | {
        id: number;
        name: string;
        selected: boolean;
      }
    | undefined
  >();

  const [{ url }, setData] = useRecoilState(settingsTransferDataState);
  const platforms = useRecoilValue(settingsTransferPlatformsState);
  const setOpen = useSetRecoilState(settingsTransferSelectBottomSheetOpenState);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setData((prevState) => ({
      ...prevState,
      url: e.currentTarget.value
    }));

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
      gap={20}
      customStyle={{
        marginTop: 32
      }}
    >
      <Flexbox direction="vertical" gap={12}>
        <Typography
          weight="bold"
          customStyle={{
            color: common.ui80
          }}
        >
          가져오기 할 플랫폼
        </Typography>
        <SelectBox onClick={() => setOpen(true)}>
          {selectedPlatform ? (
            <Button
              variant="inline"
              size="xlarge"
              brandColor="black"
              startIcon={
                <Avatar
                  width={24}
                  height={24}
                  src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${selectedPlatform.id}.png`}
                  alt="플랫폼 아이콘"
                  round={4}
                />
              }
              customStyle={{
                paddingLeft: 0,
                paddingRight: 0
              }}
            >
              {selectedPlatform.name}
            </Button>
          ) : (
            <>
              <Typography
                variant="h3"
                customStyle={{
                  color: common.ui80
                }}
              >
                플랫폼을 선택해주세요.
              </Typography>
              <Icon name="DropdownFilled" viewBox="0 0 12 24" />
            </>
          )}
        </SelectBox>
      </Flexbox>
      <Flexbox direction="vertical" gap={12}>
        <Typography
          weight="bold"
          customStyle={{
            color: common.ui80
          }}
        >
          본인의 상품 URL을 입력해주세요
        </Typography>
        <Input
          fullWidth
          size="xlarge"
          onChange={handleChange}
          value={url}
          placeholder="상품 URL을 입력해주세요."
        />
      </Flexbox>
    </Flexbox>
  );
}

const SelectBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-height: 52px;
  padding: 14px;
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
  border-radius: 8px;
`;

export default SettingsTransferForm;
