import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

jest.mock('./firebase', () => ({ auth: {}, db: {} }));
jest.mock('./PlayEditor', () => () => <div>Editor</div>);
jest.mock('./components/PlayLibrary', () => () => <div>PlayLibrary</div>);
jest.mock('./components/PlaybookLibrary', () => () => <div>PlaybookLibrary</div>);
jest.mock('./components/SignInModal', () => () => <div>SignInModal</div>);
jest.mock('./assets/huddlup_logo_white_w_trans.png', () => 'logo.png');
jest.mock('./LandingPage', () => () => <div>LandingPage</div>);
jest.mock('./assets/test_play_for_marketing.png', () => 'play.png');
jest.mock('./assets/playbook_bg.png', () => 'bg.png');
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(() => () => {}),
  signOut: jest.fn(),
}));

test('renders LandingPage text', () => {
  render(<App />);
  expect(screen.getByText(/LandingPage/i)).toBeVisible();
});
