import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders, createMockAppData, mockUser } from '../../utils/test-utils';

const mockLogoutUser = vi.fn();
const mockNavigate = vi.fn();

let mockUserData: any = null;
let mockCartData: any[] = [];
let mockWishlistData: string[] = [];

vi.mock('../../../context/AppContext', () => ({
  useApp: () => ({
    ...createMockAppData(),
    user: mockUserData,
    cart: mockCartData,
    wishlist: mockWishlistData,
    logoutUser: mockLogoutUser,
  }),
  AppProvider: ({ children }: any) => children,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  };
});

vi.mock('../../../components/LanguageSwitcher', () => ({
  default: () => (
    <div data-testid="language-switcher">
      <button data-testid="lang-en">EN</button>
      <button data-testid="lang-ta">TA</button>
    </div>
  ),
}));

import Navbar from '../../../components/Navbar';

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserData = null;
    mockCartData = [];
    mockWishlistData = [];
  });

  it('renders logo', () => {
    renderWithProviders(<Navbar onConsultationClick={vi.fn()} />);
    expect(screen.getByText('S')).toBeTruthy();
    expect(screen.getByText('Siddha Veda')).toBeTruthy();
  });

  it('renders navigation links', () => {
    renderWithProviders(<Navbar onConsultationClick={vi.fn()} />);
    expect(screen.getByText('navigation.home')).toBeTruthy();
    expect(screen.getByText('navigation.blog')).toBeTruthy();
    expect(screen.getByText('navigation.about')).toBeTruthy();
    expect(screen.getByText('navigation.contact')).toBeTruthy();
  });

  it('navigation links have correct hrefs', () => {
    renderWithProviders(<Navbar onConsultationClick={vi.fn()} />);
    const homeLink = screen.getByText('navigation.home').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
    const blogLink = screen.getByText('navigation.blog').closest('a');
    expect(blogLink).toHaveAttribute('href', '/blogs');
    const aboutLink = screen.getByText('navigation.about').closest('a');
    expect(aboutLink).toHaveAttribute('href', '/about');
    const contactLink = screen.getByText('navigation.contact').closest('a');
    expect(contactLink).toHaveAttribute('href', '/contact');
  });

  it('renders language switcher', () => {
    renderWithProviders(<Navbar onConsultationClick={vi.fn()} />);
    expect(screen.getByTestId('language-switcher')).toBeTruthy();
  });

  it('renders wishlist icon', () => {
    renderWithProviders(<Navbar onConsultationClick={vi.fn()} />);
    const wishlistLink = screen.getByTitle('user.wishlist');
    expect(wishlistLink).toHaveAttribute('href', '/wishlist');
  });

  it('renders cart icon', () => {
    renderWithProviders(<Navbar onConsultationClick={vi.fn()} />);
    const cartLink = screen.getByTitle('cart.title');
    expect(cartLink).toHaveAttribute('href', '/cart');
  });

  it('shows cart item count', () => {
    mockCartData = [
      { productId: 'p1', name: 'Item 1', price: 100, discountPrice: 80, quantity: 2, image: '' },
      { productId: 'p2', name: 'Item 2', price: 200, discountPrice: 150, quantity: 1, image: '' },
    ];
    renderWithProviders(<Navbar onConsultationClick={vi.fn()} />);
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('shows wishlist indicator when items exist', () => {
    mockWishlistData = ['p1'];
    renderWithProviders(<Navbar onConsultationClick={vi.fn()} />);
    const wishlistLink = screen.getByTitle('user.wishlist');
    expect(wishlistLink.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('shows login button when user not logged in', () => {
    mockUserData = null;
    renderWithProviders(<Navbar onConsultationClick={vi.fn()} />);
    const loginLink = screen.getByText('auth.login').closest('a');
    expect(loginLink).toHaveAttribute('href', '/auth');
  });

  it('shows user avatar when logged in', () => {
    mockUserData = mockUser;
    renderWithProviders(<Navbar onConsultationClick={vi.fn()} />);
    expect(screen.getByText('Te')).toBeTruthy();
  });

  it('mobile menu toggle works', () => {
    renderWithProviders(<Navbar onConsultationClick={vi.fn()} />);
    const menuBtn = screen.getByLabelText('common.menu');
    fireEvent.click(menuBtn);
    expect(screen.getByText('appointment.bookDoctor')).toBeTruthy();
    expect(screen.getByText('appointment.trackOrder')).toBeTruthy();
  });

  it('mobile menu shows login link when not authenticated', () => {
    mockUserData = null;
    renderWithProviders(<Navbar onConsultationClick={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('common.menu'));
    expect(screen.getByText('auth.loginRegister')).toBeTruthy();
  });

  it('mobile menu shows account link when authenticated', () => {
    mockUserData = mockUser;
    renderWithProviders(<Navbar onConsultationClick={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('common.menu'));
    expect(screen.getByText('auth.myAccountDashboard')).toBeTruthy();
  });

  it('mobile sign out works', () => {
    mockUserData = mockUser;
    renderWithProviders(<Navbar onConsultationClick={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('common.menu'));
    fireEvent.click(screen.getByText('auth.signOut'));
    expect(mockLogoutUser).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('triggers consultation callback from mobile menu', () => {
    const consultMock = vi.fn();
    renderWithProviders(<Navbar onConsultationClick={consultMock} />);
    fireEvent.click(screen.getByLabelText('common.menu'));
    fireEvent.click(screen.getByText('appointment.bookDoctor'));
    expect(consultMock).toHaveBeenCalled();
  });
});
