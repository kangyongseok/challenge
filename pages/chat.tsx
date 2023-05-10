import { ChangeEvent, useEffect, useRef, useState } from 'react';

import { Box, Input } from '@mrcamelhub/camel-ui';

import FlexibleTemplate from '@components/templates/FlexibleTemplate';

function Chat() {
  const [value, setValue] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [scrollCount, setScrollCount] = useState(0);

  const firstScrollYRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setValue(e.currentTarget.value);

  const handleFocus = () => {
    setIsFocus(!isFocus);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!window.scrollY) {
        setIsFocus(false);
        return;
      }

      if (!firstScrollYRef.current) {
        firstScrollYRef.current = window.scrollY;
      }

      window.scrollTo(0, firstScrollYRef.current);
      setScrollCount(firstScrollYRef.current);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isFocus]);

  return (
    <FlexibleTemplate
      header={
        <Box
          component="header"
          customStyle={{
            position: 'sticky',
            top: isFocus ? firstScrollYRef.current : 0,
            left: 0,
            width: '100%',
            minHeight: 72,
            backgroundColor: 'red',
            color: 'white'
          }}
        >
          Box Header
        </Box>
      }
      footer={
        <>
          <Box
            customStyle={{
              border: '1px solid',
              minHeight: 30
            }}
          >
            Buttons
          </Box>
          <Input
            ref={inputRef}
            variant="outline"
            size="xlarge"
            fullWidth
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleFocus}
            onClick={() => setIsFocus(true)}
            value={value}
            placeholder="내용을 입력해 주세요."
            customStyle={{
              borderRadius: 0
            }}
          />
        </>
      }
      disablePadding
    >
      {isFocus && (
        <Box
          customStyle={{
            width: '100%',
            minHeight: firstScrollYRef.current
          }}
        />
      )}
      {Array.from({ length: 100 }).map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={`flex-box-${index}`}>
          Flexbox Content {String(isFocus)} {index} {scrollCount}
        </div>
      ))}
    </FlexibleTemplate>
  );
}

export default Chat;
