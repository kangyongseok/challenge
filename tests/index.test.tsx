import { render, screen } from '@testing-library/react';

import Login from '../pages/login';

// TODO: 생각해봐야 할 부분
// git hook 사용하여 push 했을때 자동 테스트
// 개발환경에서 진행하게되면 코드량이 늘어났을때 대기 시간이 길어짐
// github action 을 통핸 테스트 코드 실행
// 테스트를 통과하면 push 가 되도록
// 테스트 실패시 slack 봇으로 연동 알림

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.Kakao = {
  isInitialized: jest.fn(),
  init: jest.fn()
};

describe('Ranking', () => {
  it('renders', async () => {
    render(<Login />);
    expect(await screen.findByText('서비스약관')).toBeVisible();
  });
});
