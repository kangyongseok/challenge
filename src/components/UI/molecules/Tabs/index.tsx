import type { HTMLAttributes, MouseEvent } from 'react';
import { forwardRef, useState } from 'react';

import { useRouter } from 'next/router';
import { CtaButton, CustomStyle, Dialog, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { StyledTabs, Tab } from './Tabs.styles';

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  id?: string;
  value: string;
  changeValue: (e: MouseEvent<HTMLButtonElement> | null, newValue: string) => void;
  labels: { key: string; value: string }[];
  customStyle?: CustomStyle;
  customTabStyle?: CustomStyle;
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { value, changeValue, labels, customStyle, id, customTabStyle, ...props },
  ref
) {
  const router = useRouter();
  const { hiddenTab } = router.query;
  const {
    theme: { palette }
  } = useTheme();

  const [open, setOpen] = useState(false);

  const handleClick =
    (selected: boolean, selectedValue: string) => (e: MouseEvent<HTMLButtonElement>) => {
      if (hiddenTab === 'legit') {
        logEvent(attrKeys.wishes.CLICK_WISHLEGIT_TAB, {
          title: attrProperty.productTitle.RECENT
        });
        setOpen(true);
        return;
      }
      if (!selected) {
        changeValue(e, selectedValue);
      }
    };

  const handleClose = () => {
    logEvent(attrKeys.wishes.CLICK_WISHLEGIT_POPUP, {
      title: attrProperty.productTitle.RECENT,
      att: 'CLOSE'
    });
    setOpen(false);
  };

  const handleClickConfirm = () => {
    logEvent(attrKeys.wishes.CLICK_WISHLEGIT_POPUP, {
      title: attrProperty.productTitle.RECENT,
      att: 'OK'
    });
    setOpen(false);
    changeValue(null, 'history');
  };

  return (
    <>
      <StyledTabs
        ref={ref}
        id={id}
        css={customStyle}
        role="tablist"
        aria-label={`${id}-tabs`}
        {...props}
      >
        {labels.map((label) => {
          const selected = label.key === value;

          return (
            <Tab
              key={`tab-${label.key}`}
              id={`${id}-tab-${label.key}`}
              type="button"
              role="tab"
              tabIndex={selected ? 0 : -1}
              aria-controls={`${id}-tabpanel-${label.key}`}
              aria-selected={selected}
              selected={selected}
              onClick={handleClick(selected, label.key)}
              count={labels.length}
              css={customTabStyle}
            >
              <Typography
                variant="body1"
                weight={selected ? 'bold' : 'medium'}
                customStyle={{
                  color: palette.common.grey[selected ? '20' : '60']
                }}
              >
                {label.value}
              </Typography>
            </Tab>
          );
        })}
      </StyledTabs>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Typography weight="medium" customStyle={{ textAlign: 'center' }}>
          실시간 사진감정을 중단하고
          <br />
          최근 본 매물로 이동하시겠어요?
        </Typography>
        <Flexbox gap={7} customStyle={{ marginTop: 20 }}>
          <CtaButton
            fullWidth
            variant="ghost"
            brandColor="primary"
            onClick={handleClose}
            customStyle={{ minWidth: 128 }}
          >
            취소
          </CtaButton>
          <CtaButton
            fullWidth
            variant="contained"
            brandColor="primary"
            onClick={handleClickConfirm}
            customStyle={{ minWidth: 128 }}
          >
            확인
          </CtaButton>
        </Flexbox>
      </Dialog>
    </>
  );
});

export default Tabs;
