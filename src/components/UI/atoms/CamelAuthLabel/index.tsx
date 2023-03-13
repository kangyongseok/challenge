import { Flexbox, Typography, useTheme } from 'mrcamel-ui';

function CamelAuthLabel() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  return (
    <Flexbox
      customStyle={{
        borderRadius: 4,
        backgroundColor: common.ui20
      }}
    >
      <CamelLogoIcon />
      <Typography
        variant="small2"
        weight="bold"
        customStyle={{
          padding: '3px 4px 3px 2px',
          color: common.uiWhite
        }}
      >
        인증판매자
      </Typography>
    </Flexbox>
  );
}

function CamelLogoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2.67529 12.2355L4.39429 7.51046C4.50051 7.21865 4.7183 6.981 4.99974 6.84977C5.28119 6.71854 5.60324 6.70449 5.89504 6.81071C6.18685 6.91693 6.4245 7.13471 6.55573 7.41616C6.68696 7.69761 6.70101 8.01965 6.59479 8.31146L5.17504 12.2355H2.67529ZM8.52529 12.2355H6.02554L7.74454 7.51046C7.85076 7.21865 8.06855 6.981 8.34999 6.84977C8.63144 6.71854 8.95349 6.70449 9.24529 6.81071C9.5371 6.91693 9.77475 7.13471 9.90598 7.41616C10.0372 7.69761 10.0513 8.01965 9.94504 8.31146L8.52529 12.2355ZM14.445 8.07071L13.275 8.37221L11.8665 12.2355H9.37354L11.4953 6.41021L13.8623 5.80271C14.163 5.72543 14.4822 5.77079 14.7495 5.92882C15.0168 6.08684 15.2104 6.34458 15.2877 6.64533C15.3649 6.94609 15.3196 7.26522 15.1616 7.53253C15.0035 7.79984 14.7458 7.99343 14.445 8.07071Z"
        fill="white"
      />
    </svg>
  );
}

export default CamelAuthLabel;
