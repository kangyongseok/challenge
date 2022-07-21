import { useEffect } from 'react';

import { Box, Button, CtaButton, Dialog, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import { PRODUCT_NAME } from '@constants/product';

import handleClickAppDownload from '@utils/common';

import { FeatureBox } from './AppDownloadDialog.styles';

interface AppDownloadDialogProps {
  variant?: 'common' | 'wish' | 'map';
  open: boolean;
  onClose: () => void;
  productId?: number;
  att?: string;
  name?: string;
}

function AppDownloadDialog({
  variant = 'common',
  open,
  onClose,
  productId,
  att,
  name
}: AppDownloadDialogProps) {
  const {
    theme: {
      palette: { primary, secondary, common }
    }
  } = useTheme();

  useEffect(() => {
    if (open) {
      logEvent('VIEW_APPDOWNLOAD', {
        name,
        att,
        type: 'POPUP'
      });
    }
  }, [name, att, open]);

  if (variant === 'map') {
    return (
      <Dialog open={open} onClose={onClose}>
        <Box customStyle={{ textAlign: 'center' }}>
          <Button size="small" startIcon={<Icon name="ShareFilled" />}>
            내 주변
          </Button>
        </Box>
        <Typography weight="medium" customStyle={{ marginTop: 6, textAlign: 'center' }}>
          앱에서 바로
          <br />
          직거래 가능한 주변매물만 모아보세요!
        </Typography>
        <Flexbox gap={7} customStyle={{ marginTop: 20 }}>
          <CtaButton
            fullWidth
            variant="ghost"
            brandColor="primary"
            onClick={onClose}
            customStyle={{ minWidth: 128 }}
          >
            웹으로 볼게요
          </CtaButton>
          <CtaButton
            fullWidth
            variant="contained"
            brandColor="primary"
            onClick={() => handleClickAppDownload({})}
            customStyle={{ minWidth: 128 }}
          >
            앱 다운로드
          </CtaButton>
        </Flexbox>
      </Dialog>
    );
  }

  if (variant === 'wish') {
    return (
      <Dialog open={open} onClose={onClose}>
        <Flexbox justifyContent="center" alignment="center" customStyle={{ marginBottom: 5 }}>
          <Icon name="HeartFilled" customStyle={{ color: secondary.red.main }} />
        </Flexbox>
        <Typography
          variant="body1"
          weight="medium"
          customStyle={{ marginBottom: 20, textAlign: 'center' }}
        >
          앱에서 찜하고 <br />
          가격 내려갔을 때 알림 받아보세요!
        </Typography>
        <Flexbox gap={7}>
          <CtaButton
            variant="ghost"
            brandColor="primary"
            customStyle={{ width: 128 }}
            onClick={onClose}
          >
            <Typography variant="body1" weight="bold" customStyle={{ color: primary.main }}>
              웹으로 볼게요
            </Typography>
          </CtaButton>
          <CtaButton
            variant="contained"
            brandColor="primary"
            customStyle={{ width: 128 }}
            onClick={() => handleClickAppDownload({ name: PRODUCT_NAME.PRODUCT_DETAIL, productId })}
          >
            <Typography variant="body1" weight="bold" customStyle={{ color: common.white }}>
              앱 다운로드
            </Typography>
          </CtaButton>
        </Flexbox>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <Typography weight="medium" customStyle={{ marginTop: 6, textAlign: 'center' }}>
        카멜 앱 다운로드하고 <br />더 똑똑하게 득템하세요!
      </Typography>
      <FeatureBox>
        <Flexbox gap={6} alignment="center">
          <TargetIcon />
          <Typography variant="body2" weight="regular" customStyle={{ color: common.grey['60'] }}>
            꿀매알림
          </Typography>
        </Flexbox>
        <Flexbox gap={6} alignment="center">
          <HeartIcon />
          <Typography variant="body2" weight="regular" customStyle={{ color: common.grey['60'] }}>
            찜 리스트
          </Typography>
        </Flexbox>
        <Flexbox gap={6} alignment="center">
          <UserIcon />
          <Typography variant="body2" weight="regular" customStyle={{ color: common.grey['60'] }}>
            취향추천
          </Typography>
        </Flexbox>
        <Flexbox gap={6} alignment="center">
          <TimerIcon />
          <Typography variant="body2" weight="regular" customStyle={{ color: common.grey['60'] }}>
            매물거래
          </Typography>
        </Flexbox>
      </FeatureBox>
      <Flexbox gap={7} customStyle={{ marginTop: 20 }}>
        <CtaButton
          fullWidth
          variant="ghost"
          brandColor="primary"
          onClick={onClose}
          customStyle={{ minWidth: 128 }}
        >
          괜찮아요
        </CtaButton>
        <CtaButton
          fullWidth
          variant="contained"
          brandColor="primary"
          onClick={() => handleClickAppDownload({})}
          customStyle={{ minWidth: 128 }}
        >
          앱 다운로드
        </CtaButton>
      </Flexbox>
    </Dialog>
  );
}

function TargetIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.4167 11.4997C13.4167 12.5582 12.5586 13.4163 11.5 13.4163C10.4415 13.4163 9.58334 12.5582 9.58334 11.4997C9.58334 10.4411 10.4415 9.58301 11.5 9.58301C12.5586 9.58301 13.4167 10.4411 13.4167 11.4997Z"
        fill="#1833FF"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.5 16.292C14.1464 16.292 16.2917 14.1467 16.2917 11.5003C16.2917 8.85396 14.1464 6.70866 11.5 6.70866C8.85363 6.70866 6.70832 8.85396 6.70832 11.5003C6.70832 14.1467 8.85363 16.292 11.5 16.292ZM11.5 18.2087C15.2049 18.2087 18.2083 15.2052 18.2083 11.5003C18.2083 7.79542 15.2049 4.79199 11.5 4.79199C7.79508 4.79199 4.79166 7.79542 4.79166 11.5003C4.79166 15.2052 7.79508 18.2087 11.5 18.2087Z"
        fill="#333333"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.91666 11.5003C1.91666 10.9711 2.34572 10.542 2.87499 10.542L5.74999 10.542C6.27926 10.542 6.70832 10.9711 6.70832 11.5003C6.70832 12.0296 6.27926 12.4587 5.74999 12.4587H2.87499C2.34572 12.4587 1.91666 12.0296 1.91666 11.5003Z"
        fill="#333333"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.5 1.91699C12.0293 1.91699 12.4583 2.34605 12.4583 2.87533L12.4583 5.75033C12.4583 6.2796 12.0293 6.70866 11.5 6.70866C10.9707 6.70866 10.5416 6.2796 10.5416 5.75033L10.5416 2.87533C10.5416 2.34605 10.9707 1.91699 11.5 1.91699Z"
        fill="#333333"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.5 16.292C12.0293 16.292 12.4583 16.7211 12.4583 17.2503L12.4583 20.1253C12.4583 20.6546 12.0293 21.0837 11.5 21.0837C10.9707 21.0837 10.5416 20.6546 10.5416 20.1253L10.5416 17.2503C10.5416 16.7211 10.9707 16.292 11.5 16.292Z"
        fill="#333333"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.2917 11.5003C16.2917 10.9711 16.7207 10.542 17.25 10.542L20.125 10.542C20.6543 10.542 21.0834 10.9711 21.0834 11.5003C21.0834 12.0296 20.6543 12.4587 20.125 12.4587H17.25C16.7207 12.4587 16.2917 12.0296 16.2917 11.5003Z"
        fill="#333333"
      />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.88 18.9085C14.9937 17.1277 16.9852 15.2067 18.8409 13.1585C20.3934 11.2898 21.0834 9.71809 21.0834 8.05059V7.94517C21.0507 6.57593 20.4785 5.27501 19.4913 4.32556C18.5042 3.37611 17.182 2.85498 15.8125 2.87559C14.996 2.88147 14.1899 3.05948 13.4468 3.398C13.1605 3.52842 12.886 3.68155 12.6258 3.85554C12.2108 4.13313 11.8322 4.46382 11.5 4.84017C11.1728 4.46605 10.7994 4.13697 10.3897 3.86031C10.1258 3.68211 9.8469 3.52567 9.55557 3.39295C8.81195 3.05419 8.00467 2.87782 7.18752 2.87559H7.09169C5.71919 2.87559 4.40291 3.42081 3.43241 4.39131C2.46191 5.36181 1.91669 6.67809 1.91669 8.05059C1.91669 9.71809 2.60669 11.2898 4.15919 13.1298C6.00729 15.182 7.99584 17.1033 10.1104 18.8798L11.5 20.1256L12.88 18.9085ZM11.5105 17.5608L11.3669 17.4321L11.3433 17.4122C9.30476 15.6997 7.38726 13.848 5.60457 11.8706C4.2357 10.242 3.83335 9.10003 3.83335 8.05059C3.83335 7.18642 4.17664 6.35765 4.7877 5.7466C5.39875 5.13554 6.22752 4.79226 7.09169 4.79226H7.18462C7.72859 4.79407 8.26595 4.91164 8.76099 5.13716C9.25674 5.363 9.69865 5.69191 10.0573 6.10197L11.4935 7.74415L12.9371 6.10841C13.2991 5.69823 13.7435 5.369 14.2414 5.1422C14.7392 4.91541 15.2793 4.79615 15.8263 4.79221L15.8338 4.79215L15.8414 4.79204C16.7055 4.77904 17.5398 5.10787 18.1627 5.70697C18.7807 6.30138 19.1409 7.11411 19.1667 7.97066V8.05059C19.1667 9.09898 18.7654 10.2418 17.3923 11.9027C15.6024 13.8755 13.6823 15.7263 11.6451 17.4427L11.6285 17.4567L11.5105 17.5608Z"
        fill="#333333"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.5 3.83366C9.91218 3.83366 8.625 5.12084 8.625 6.70866C8.625 8.29648 9.91218 9.58366 11.5 9.58366C13.0878 9.58366 14.375 8.29648 14.375 6.70866C14.375 5.12084 13.0878 3.83366 11.5 3.83366ZM6.70833 6.70866C6.70833 4.06229 8.85364 1.91699 11.5 1.91699C14.1464 1.91699 16.2917 4.06229 16.2917 6.70866C16.2917 8.50933 15.2984 10.078 13.8299 10.8967C15.2963 11.3506 16.5923 12.2073 17.6139 13.2761C19.1438 14.8768 20.125 17.0222 20.125 19.167H18.2083C18.2083 17.5909 17.4733 15.9029 16.2284 14.6005C14.9893 13.304 13.3118 12.4587 11.5 12.4587C9.68821 12.4587 8.01075 13.304 6.77163 14.6005C5.52674 15.9029 4.79167 17.5909 4.79167 19.167H2.875C2.875 17.0222 3.85617 14.8768 5.38607 13.2761C6.40765 12.2073 7.7037 11.3506 9.17009 10.8967C7.70158 10.078 6.70833 8.50933 6.70833 6.70866Z"
        fill="#333333"
      />
    </svg>
  );
}

function TimerIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 4.8C9.17434 4.8 6.72718 6.4276 5.54793 8.80053C5.32672 9.24565 4.78656 9.42717 4.34144 9.20596C3.89632 8.98476 3.7148 8.44459 3.936 7.99947C5.40762 5.03822 8.46496 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 11.5029 3.40294 11.1 3.9 11.1C4.39706 11.1 4.8 11.5029 4.8 12C4.8 15.9764 8.02355 19.2 12 19.2C15.9764 19.2 19.2 15.9764 19.2 12C19.2 8.02355 15.9764 4.8 12 4.8Z"
        fill="#333333"
      />
      <path
        d="M3.45001 5.15137L4.70153 9.00315L8.55331 7.75163"
        stroke="#333333"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 7C12.5523 7 13 7.40294 13 7.9V12.0272L15.7071 14.4636C16.0976 14.8151 16.0976 15.3849 15.7071 15.7364C15.3166 16.0879 14.6834 16.0879 14.2929 15.7364L11.2929 13.0364C11.1054 12.8676 11 12.6387 11 12.4V7.9C11 7.40294 11.4477 7 12 7Z"
        fill="#1833FF"
      />
    </svg>
  );
}

export default AppDownloadDialog;
