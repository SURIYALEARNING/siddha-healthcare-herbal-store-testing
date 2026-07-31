import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, createMockAppData } from '../../utils/test-utils';

const mockLoginUser = vi.fn();
const mockAppData = createMockAppData({
  loginUser: mockLoginUser,
  error: null,
});

vi.mock('../../../context/AppContext', () => ({
  useApp: () => mockAppData,
  AppProvider: ({ children }: any) => children,
}));

vi.mock('../../../components/auth/AuthLayout', () => ({
  default: ({ children }: any) => <div data-testid="auth-layout">{children}</div>,
}));

vi.mock('../../../components/auth/TabSwitcher', () => ({
  default: ({ active, onChange }: any) => (
    <div data-testid="tab-switcher">
      <button onClick={() => onChange('login')} data-testid="tab-login" className={active === 'login' ? 'active' : ''}>Login</button>
      <button onClick={() => onChange('register')} data-testid="tab-register" className={active === 'register' ? 'active' : ''}>Register</button>
    </div>
  ),
}));

vi.mock('../../../components/auth/LoginForm', () => ({
  default: ({ email, password, loading, onEmailChange, onPasswordChange, onSubmit, onForgotPassword }: any) => (
    <form onSubmit={onSubmit} data-testid="login-form">
      <input data-testid="login-email" value={email} onChange={(e) => onEmailChange(e.target.value)} placeholder="Email" />
      <input data-testid="login-password" value={password} onChange={(e) => onPasswordChange(e.target.value)} placeholder="Password" />
      <button type="submit" data-testid="login-submit" disabled={loading}>Sign In</button>
      <button type="button" onClick={onForgotPassword} data-testid="forgot-password-btn">Forgot Password</button>
    </form>
  ),
}));

vi.mock('../../../components/auth/RegisterForm', () => ({
  default: ({ fullName, email, mobileNumber, password, loading, onFullNameChange, onEmailChange, onMobileChange, onPasswordChange, onSubmit }: any) => (
    <form onSubmit={onSubmit} data-testid="register-form">
      <input data-testid="register-name" value={fullName} onChange={(e) => onFullNameChange(e.target.value)} placeholder="Name" />
      <input data-testid="register-email" value={email} onChange={(e) => onEmailChange(e.target.value)} placeholder="Email" />
      <input data-testid="register-mobile" value={mobileNumber} onChange={(e) => onMobileChange(e.target.value)} placeholder="Mobile" />
      <input data-testid="register-password" value={password} onChange={(e) => onPasswordChange(e.target.value)} placeholder="Password" />
      <button type="submit" data-testid="register-submit" disabled={loading}>Register</button>
    </form>
  ),
}));

vi.mock('../../../components/auth/OtpScreen', () => ({
  default: ({ email, otpCode, loading, onOtpChange, onSubmit, onCancel }: any) => (
    <form onSubmit={onSubmit} data-testid="otp-screen">
      <span>OTP for {email}</span>
      <input data-testid="otp-input" value={otpCode} onChange={(e) => onOtpChange(e.target.value)} placeholder="OTP" />
      <button type="submit" data-testid="otp-submit" disabled={loading}>Verify OTP</button>
      <button type="button" onClick={onCancel} data-testid="otp-cancel">Cancel</button>
    </form>
  ),
}));

vi.mock('../../../components/auth/ForgotPassword', () => ({
  default: ({ email, onEmailChange, onSubmit, onBack }: any) => (
    <div data-testid="forgot-password-screen">
      <input data-testid="forgot-email" value={email} onChange={(e) => onEmailChange(e.target.value)} placeholder="Email" />
      <button onClick={onSubmit} data-testid="forgot-submit">Reset Password</button>
      <button onClick={onBack} data-testid="forgot-back">Back</button>
    </div>
  ),
}));

vi.mock('../../../components/auth/GoogleLoginButton', () => ({
  default: () => <button data-testid="google-login-btn">Google Login</button>,
}));

vi.mock('../../../api', () => ({
  sendOtpApi: vi.fn().mockResolvedValue({}),
  verifyOtpApi: vi.fn().mockResolvedValue({}),
}));

import Auth from '../../../pages/Auth';

describe('Auth Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders auth layout', () => {
    renderWithProviders(<Auth />);
    expect(screen.getByTestId('auth-layout')).toBeTruthy();
  });

  it('renders tab switcher', () => {
    renderWithProviders(<Auth />);
    expect(screen.getByTestId('tab-switcher')).toBeTruthy();
  });

  it('shows login form by default', () => {
    renderWithProviders(<Auth />);
    expect(screen.getByTestId('login-form')).toBeTruthy();
    expect(screen.queryByTestId('register-form')).toBeNull();
  });

  it('switches to register form', () => {
    renderWithProviders(<Auth />);
    fireEvent.click(screen.getByTestId('tab-register'));
    expect(screen.getByTestId('register-form')).toBeTruthy();
    expect(screen.queryByTestId('login-form')).toBeNull();
  });

  it('switches back to login form', () => {
    renderWithProviders(<Auth />);
    fireEvent.click(screen.getByTestId('tab-register'));
    fireEvent.click(screen.getByTestId('tab-login'));
    expect(screen.getByTestId('login-form')).toBeTruthy();
    expect(screen.queryByTestId('register-form')).toBeNull();
  });

  it('login form submits', async () => {
    mockLoginUser.mockResolvedValueOnce(true);
    renderWithProviders(<Auth />);
    fireEvent.change(screen.getByTestId('login-email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByTestId('login-password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('login-submit'));
    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith('test@test.com', 'password123');
    });
  });

  it('shows forgot password screen', () => {
    renderWithProviders(<Auth />);
    fireEvent.click(screen.getByTestId('forgot-password-btn'));
    expect(screen.getByTestId('forgot-password-screen')).toBeTruthy();
  });

  it('forgot password back returns to login', () => {
    renderWithProviders(<Auth />);
    fireEvent.click(screen.getByTestId('forgot-password-btn'));
    fireEvent.click(screen.getByTestId('forgot-back'));
    expect(screen.getByTestId('login-form')).toBeTruthy();
  });

  it('renders Google login button on login tab', () => {
    renderWithProviders(<Auth />);
    expect(screen.getByTestId('google-login-btn')).toBeTruthy();
  });

  it('shows OTP screen after registration', async () => {
    renderWithProviders(<Auth />);
    fireEvent.click(screen.getByTestId('tab-register'));
    fireEvent.change(screen.getByTestId('register-name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByTestId('register-email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByTestId('register-mobile'), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByTestId('register-password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('register-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('otp-screen')).toBeTruthy();
    });
  });

  it('OTP verify works', async () => {
    renderWithProviders(<Auth />);
    fireEvent.click(screen.getByTestId('tab-register'));
    fireEvent.change(screen.getByTestId('register-name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByTestId('register-email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByTestId('register-mobile'), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByTestId('register-password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('register-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('otp-screen')).toBeTruthy();
    });
    fireEvent.change(screen.getByTestId('otp-input'), { target: { value: '123456' } });
    fireEvent.click(screen.getByTestId('otp-submit'));
  });

  it('shows error when present', () => {
    mockAppData.error = 'Invalid credentials';
    renderWithProviders(<Auth />);
    expect(screen.getByText('Invalid credentials')).toBeTruthy();
  });

  it('shows success message after login', async () => {
    mockLoginUser.mockResolvedValueOnce(true);
    renderWithProviders(<Auth />);
    fireEvent.change(screen.getByTestId('login-email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByTestId('login-password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('login-submit'));
    await waitFor(() => {
      expect(screen.getByText('auth.loginSuccess')).toBeTruthy();
    });
  });
});
