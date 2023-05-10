import type { Dispatch, SetStateAction } from 'react';

import { BottomSheet, Flexbox, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import type { PostReportData } from '@dto/user';

import { userReportType } from '@constants/user';

interface ReportUserBottomSheetProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setParams: Dispatch<SetStateAction<PostReportData>>;
}

function ReportUserBottomSheet({ open, setOpen, setParams }: ReportUserBottomSheetProps) {
  const handleClick = (type: number) => () => {
    setParams((prevState) => ({ ...prevState, type }));
    setOpen(false);
  };

  return (
    <BottomSheet disableSwipeable open={open} onClose={() => setOpen(false)}>
      <Flexbox direction="vertical" gap={20} customStyle={{ padding: 20 }}>
        <Flexbox direction="vertical">
          {Object.entries(userReportType).map(([key, value]) => (
            <Menu
              key={`report-type-${key}`}
              variant="h3"
              weight="medium"
              onClick={handleClick(+key)}
            >
              {value}
            </Menu>
          ))}
        </Flexbox>
      </Flexbox>
    </BottomSheet>
  );
}

const Menu = styled(Typography)`
  padding: 12px;
  text-align: center;
  cursor: pointer;
`;

export default ReportUserBottomSheet;
