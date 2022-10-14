import type { HTMLAttributes, MouseEvent, RefObject } from 'react';

import styled, { CSSObject } from '@emotion/styled';

interface FilterOptionNavigationProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  scrollElement: RefObject<HTMLElement>;
  consonants: string[];
}

function FilterOptionNavigation({
  scrollElement,
  consonants,
  ...props
}: FilterOptionNavigationProps) {
  const handleClick = (event: MouseEvent<HTMLSpanElement>) => {
    const dataConsonant = event.currentTarget.getAttribute('data-consonant');

    if (dataConsonant && scrollElement.current) {
      const filterOptionElements = scrollElement.current.querySelectorAll(
        `div[data-consonant=consonant-${dataConsonant}]`
      );

      if (filterOptionElements[0]) filterOptionElements[0].scrollIntoView();
    }
  };

  return (
    <StyledFilterOptionNavigation>
      {consonants.map((consonant) => (
        <NavigationItem
          key={`filter-option-navigation-${consonant}`}
          data-consonant={consonant}
          onClick={handleClick}
          {...props}
          dangerouslySetInnerHTML={{ __html: consonant }}
        />
      ))}
    </StyledFilterOptionNavigation>
  );
}

const StyledFilterOptionNavigation = styled.aside`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 18px;
  min-width: 18px;
  margin-bottom: 20px;
  padding: 4px 0;
  border-radius: 8px 8px 0 0;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui95};
  overflow-y: auto;

  & > span:after {
    content: '';
    display: block;
    width: 1.5px;
    height: 1.5px;
    margin: 6px auto;
    border-radius: 50%;
    background-color: ${({
      theme: {
        palette: { common }
      }
    }) => common.ui60};
  }
  & > span:last-child:after {
    display: none;
  }
`;

const NavigationItem = styled.span`
  cursor: pointer;
  ${({
    theme: {
      palette: { common },
      typography: {
        small2: { size, weight, lineHeight, letterSpacing }
      }
    }
  }): CSSObject => ({
    fontSize: size,
    fontWeight: weight.regular,
    lineHeight,
    letterSpacing,
    color: common.ui60
  })};
`;

export default FilterOptionNavigation;
