import { useState } from 'react';

import { useRouter } from 'next/router';
import { Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import LogoutModal from './LogoutDialog';

function MypageEtc() {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const [logoutToggle, setLogoutToggle] = useState(false);

  const handleLogout = () => {
    logEvent(attrKeys.mypage.CLICK_LOGOUT);

    setLogoutToggle(true);
  };

  return (
    <Flexbox
      direction="vertical"
      justifyContent="center"
      gap={20}
      customStyle={{ padding: '32px 20px 52px', backgroundColor: common.bg03 }}
    >
      <Flexbox direction="vertical" gap={12}>
        <Typography weight="bold" color="ui80">
          카멜 SNS
        </Typography>
        <Flexbox alignment="center" gap={8}>
          {[
            { icon: <CafeSvg />, url: 'https://cafe.naver.com/camelseoul' },
            { icon: <BlogSvg />, url: 'https://blog.naver.com/mrcamel_korea' },
            { icon: <FacebookSvg />, url: 'https://www.facebook.com/Mrcamel.Luxury' },
            { icon: <InstarSvg />, url: 'https://www.instagram.com/mrcamelseoul' }
          ].map(({ icon, url }) => (
            <SNSIcon
              key={`sns-icon-${url.substring(url.lastIndexOf('/') + 1)}`}
              onClick={() => router.push(url)}
            >
              {icon}
            </SNSIcon>
          ))}
        </Flexbox>
      </Flexbox>
      <Box customStyle={{ padding: 4 }} onClick={handleLogout}>
        <Typography
          variant="body2"
          color="ui60"
          customStyle={{ width: 'fit-content', textDecoration: 'underline' }}
        >
          로그아웃
        </Typography>
      </Box>
      <LogoutModal status={logoutToggle} setLogoutToggle={setLogoutToggle} />
    </Flexbox>
  );
}

const SNSIcon = styled.div`
  min-width: 40px;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme: { palette } }) => palette.common.uiWhite};
`;

function CafeSvg() {
  return (
    <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.17728 0.00185518H11.1897C11.246 0.00026693 11.3006 0.0209141 11.3408 0.0622086C11.3794 0.101915 11.4019 0.155915 11.4003 0.211504C11.3441 3.52459 8.03765 4.05347 8.00549 4.05824C7.99584 4.05983 7.98458 4.06141 7.97332 4.06141H3.73579C3.67628 4.06141 3.62 4.036 3.5814 3.99312C3.5412 3.95024 3.5219 3.89306 3.52672 3.8343C3.80976 0.514859 7.14351 0.00661992 7.17728 0.00185518ZM14.4961 10.6415H12.8236C12.5003 12.4029 11.2556 15.9987 6.46807 15.9987C0.130262 16.0003 0 9.69175 0 9.69175V5.90378C0 5.78943 0.093274 5.69572 0.210671 5.69572H14.4961C15.8759 5.69572 17 6.80432 17 8.16862C17 9.53293 15.8775 10.6415 14.4961 10.6415ZM14.4382 6.95361C13.7676 6.95361 13.2224 7.49044 13.2224 8.15433C13.2224 8.81821 13.766 9.35345 14.4382 9.35345C15.1104 9.35345 15.654 8.81663 15.654 8.15433C15.654 7.49203 15.1104 6.95361 14.4382 6.95361Z"
        fill="#DCDDE0"
      />
    </svg>
  );
}

function BlogSvg() {
  return (
    <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.8615 6.10352e-05H2.13845C0.958059 6.10352e-05 0 0.968462 0 2.1616V9.19374C0 10.3869 0.958059 11.3553 2.13845 11.3553H6.27792L7.68469 14.71C7.68469 14.71 7.78171 15.0001 8.01617 15.0001C8.25063 15.0001 8.34765 14.71 8.34765 14.71L9.75442 11.3553H13.8575C15.0379 11.3553 15.996 10.3869 15.996 9.19374V2.1616C15.996 0.968462 15.0379 6.10352e-05 13.8575 6.10352e-05H13.8615ZM5.0288 6.21499C5.02072 7.5021 3.70692 7.53888 3.70692 7.53888C3.19757 7.53888 2.91056 7.19974 2.91056 7.19974V7.43264H1.9525V3.43645C1.9525 3.43645 1.94846 3.43645 1.9525 3.43645C2.01314 3.44871 2.91056 3.43645 2.91056 3.43645V4.96465C3.13694 4.57647 3.78777 4.58464 3.78777 4.58464C5.20667 4.71948 5.0288 6.21908 5.0288 6.21908V6.21499ZM6.7145 4.70314V7.43673H5.77665V4.73174C5.77665 4.364 5.3239 4.26184 5.3239 4.26184V3.30979C6.81961 3.37108 6.7145 4.70723 6.7145 4.70723V4.70314ZM8.93785 7.53888C8.06872 7.53888 7.36534 6.88511 7.36534 6.07606C7.36534 5.26702 8.06872 4.61325 8.93785 4.61325C9.80697 4.61325 10.5104 5.26702 10.5104 6.07606C10.5104 6.88511 9.80697 7.53888 8.93785 7.53888ZM14.0718 7.53888C14.0718 7.53888 14.0839 8.92815 12.6892 8.92815H12.2648V8.02921H12.5195C12.5195 8.02921 13.1056 8.08233 13.0975 7.17113C13.0975 7.17113 12.9843 7.54297 12.1597 7.54297C12.1597 7.54297 10.9955 7.45716 10.9955 6.30897V5.87176C10.9955 5.87176 11.0237 4.67862 12.3012 4.58464C12.3012 4.58464 12.8065 4.53152 13.1177 4.95239V4.65819H14.0677V7.54297L14.0718 7.53888Z"
        fill="#DCDDE0"
      />
    </svg>
  );
}
function FacebookSvg() {
  return (
    <svg width="8" height="16" viewBox="0 0 8 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2.52632 15.9993H5.19298V8.94697H7.66316L7.91579 6.28765C7.91579 6.28765 7.97193 6.15542 7.70526 6.15542H5.19298V4.14256C5.19298 4.14256 5.0807 2.62925 6.52632 2.62925H8V0.278468C8 0.278468 7.36842 -0.0153799 5.82456 -0.000687547C5.82456 -0.000687547 4.46316 -0.0153799 3.41053 1.04247C3.41053 1.04247 2.52632 1.87994 2.52632 2.82025V6.15542H0V8.94697H2.52632V15.9993Z"
        fill="#DCDDE0"
      />
    </svg>
  );
}

function InstarSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_1091_34590)">
        <path
          d="M0 10.9303V5.06971C0.0114515 5.02629 0.0274835 4.98514 0.0320641 4.94171C0.0458059 4.74743 0.0549671 4.55543 0.0641283 4.36343C0.0870312 3.81943 0.208417 3.29829 0.393931 2.79086C0.661895 2.06171 1.11766 1.46743 1.72688 0.996571C2.43458 0.445714 3.26367 0.189714 4.14085 0.102857C4.6951 0.048 5.25394 0.0525714 5.81048 0.0342857C6.00515 0.0274286 6.20212 0.0342857 6.39679 0.032C6.44489 0.032 6.4907 0.0114286 6.53879 0H9.45892C9.49098 0.0114286 9.52305 0.0297143 9.55511 0.032C10.0865 0.0434286 10.6178 0.0457143 11.1492 0.0685714C11.5087 0.0845714 11.866 0.121143 12.2233 0.162286C12.7272 0.219429 13.2035 0.381714 13.6502 0.610286C14.1311 0.854857 14.548 1.18857 14.8984 1.60686C15.2121 1.98171 15.4457 2.39543 15.6175 2.85029C15.8786 3.54514 15.9611 4.26971 15.9679 5.00571C15.9679 5.06971 15.9885 5.13143 16 5.19543V10.8343C15.9885 10.8549 15.9702 10.8754 15.9702 10.8983C15.9565 11.1337 15.9542 11.3691 15.9336 11.6046C15.9084 11.888 15.8946 12.1783 15.8328 12.4549C15.6267 13.36 15.2419 14.1691 14.525 14.8C14.0968 15.1771 13.625 15.4629 13.089 15.648C12.3859 15.8903 11.6599 15.968 10.9201 15.9657C10.856 15.9657 10.7942 15.9863 10.73 15.9977H5.26997C5.2379 15.9863 5.20584 15.968 5.17378 15.9657C4.72488 15.9337 4.27598 15.9131 3.82937 15.8674C3.35757 15.8171 2.90867 15.6731 2.48039 15.4743C1.95591 15.2297 1.5093 14.8846 1.12224 14.4457C0.835958 14.1211 0.616089 13.76 0.451188 13.3669C0.146579 12.6331 0.0297738 11.8606 0.0320641 11.0697C0.0320641 11.024 0.0114515 10.976 0 10.928L0 10.9303ZM10.6865 14.5417C10.6865 14.5417 10.6865 14.5326 10.6865 14.5257C11.0209 14.4983 11.3553 14.4731 11.6897 14.4457C12.1775 14.4091 12.6378 14.2766 13.0661 14.0389C13.5356 13.7783 13.8861 13.3966 14.1265 12.9211C14.3395 12.496 14.4357 12.032 14.4747 11.5611C14.5159 11.0971 14.5388 10.6309 14.5388 10.1646C14.5388 8.59886 14.5205 7.03314 14.5113 5.46743C14.509 4.93943 14.4907 4.41371 14.3853 3.89257C14.2708 3.31886 14.0349 2.80914 13.6227 2.39314C13.2585 2.02743 12.8096 1.808 12.3149 1.67543C11.708 1.51086 11.0827 1.49943 10.4644 1.49486C8.72373 1.48114 6.98769 1.51086 5.24936 1.51771C4.7661 1.51771 4.28743 1.54514 3.81563 1.648C3.10564 1.80343 2.50787 2.13943 2.08188 2.74743C1.72917 3.25257 1.57572 3.824 1.52992 4.42286C1.48182 5.04 1.47266 5.65943 1.4635 6.27886C1.45205 6.85486 1.45434 7.42857 1.4635 8.00457C1.47953 9.14057 1.50014 10.2766 1.52763 11.4149C1.53908 11.9063 1.63985 12.3771 1.83911 12.832C2.09333 13.4126 2.51474 13.8309 3.06212 14.1189C3.4927 14.3451 3.97137 14.4411 4.45233 14.4777C4.95849 14.5166 5.47151 14.5394 5.97996 14.5417C7.54881 14.5509 9.11766 14.5463 10.6865 14.5463V14.5417Z"
          fill="#DCDDE0"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.87308 8.0183C3.86392 5.7623 5.70532 3.80344 8.18342 3.89944C10.2836 3.98173 12.1754 5.6983 12.1204 8.11887C12.07 10.3063 10.3248 12.1509 7.93148 12.1257C5.70761 12.1029 3.88682 10.3292 3.87308 8.0183ZM10.634 8.01144C10.6546 6.54173 9.4385 5.35087 7.99332 5.3623C6.4886 5.37601 5.34803 6.5303 5.34574 8.01144C5.34116 9.4423 6.45653 10.5646 7.84674 10.6446C9.44079 10.7383 10.6844 9.40116 10.6363 8.00916L10.634 8.01144Z"
          fill="#DCDDE0"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.5314 3.75316C11.4696 3.26173 11.9849 2.75201 12.5369 2.77944C13.0018 2.8023 13.4873 3.22287 13.4736 3.78287C13.4599 4.2583 13.0316 4.7383 12.475 4.72687C11.9986 4.71544 11.4856 4.29487 11.5314 3.75316Z"
          fill="#DCDDE0"
        />
      </g>
      <defs>
        <clipPath id="clip0_1091_34590">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export default MypageEtc;
