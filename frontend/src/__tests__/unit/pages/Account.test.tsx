import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders, createMockAppData, mockUser, mockOrder, mockProduct } from '../../utils/test-utils';

const mockUpdateUserProfile = vi.fn();
const mockLogoutUser = vi.fn();
const mockNavigate = vi.fn();

const defaultUser = { ...mockUser };
const defaultOrders = [mockOrder];
const defaultWishlist = ['prod1', 'prod2'];
const defaultProducts = [mockProduct, { ...mockProduct, _id: 'prod2', name: { en: 'Wishlist Item', ta: '' } }];

let mockUserData: any = defaultUser;
let mockOrdersData: any[] = defaultOrders;
let mockWishlistData: string[] = defaultWishlist;

const mockAppData = createMockAppData({
  user: defaultUser,
  orders: defaultOrders,
  wishlist: defaultWishlist,
  products: defaultProducts,
  updateUserProfile: mockUpdateUserProfile,
  logoutUser: mockLogoutUser,
});

vi.mock('../../../context/AppContext', () => ({
  useApp: () => ({ ...mockAppData, user: mockUserData, orders: mockOrdersData, wishlist: mockWishlistData }),
  AppProvider: ({ children }: any) => children,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../components/account/AccountHeader', () => ({
  default: ({ fullName, onSignOut }: any) => (
    <div data-testid="account-header">
      <span>{fullName}</span>
      <button onClick={onSignOut} data-testid="sign-out-btn">Sign Out</button>
    </div>
  ),
}));

vi.mock('../../../components/account/AccountSidebar', () => ({
  default: ({ activeTab, onTabChange, ordersCount, wishlistCount }: any) => (
    <div data-testid="account-sidebar">
      <button onClick={() => onTabChange('dashboard')} data-testid="tab-dashboard">Dashboard</button>
      <button onClick={() => onTabChange('orders')} data-testid="tab-orders">Orders ({ordersCount})</button>
      <button onClick={() => onTabChange('addresses')} data-testid="tab-addresses">Addresses</button>
      <button onClick={() => onTabChange('wishlist')} data-testid="tab-wishlist">Wishlist ({wishlistCount})</button>
    </div>
  ),
}));

vi.mock('../../../components/account/ProfileDashboard', () => ({
  default: ({ user, onSave }: any) => (
    <div data-testid="profile-dashboard">
      <span>{user.fullName}</span>
      <span>{user.email}</span>
    </div>
  ),
}));

vi.mock('../../../components/account/OrdersHistory', () => ({
  default: ({ orders }: any) => (
    <div data-testid="orders-history">
      <span>{orders.length} orders</span>
      {orders.map((o: any) => <span key={o.id}>{o.id}</span>)}
    </div>
  ),
}));

vi.mock('../../../components/account/SavedAddress', () => ({
  default: ({ user }: any) => (
    <div data-testid="saved-address">
      <span>{user.address?.address}</span>
    </div>
  ),
}));

vi.mock('../../../components/account/AccountWishlist', () => ({
  default: ({ products }: any) => (
    <div data-testid="account-wishlist">
      <span>{products.length} items</span>
      {products.map((p: any) => <span key={p._id}>{p.name?.en || p.name}</span>)}
    </div>
  ),
}));

import Account from '../../../pages/Account';

describe('Account Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserData = { ...defaultUser };
    mockOrdersData = [...defaultOrders];
    mockWishlistData = [...defaultWishlist];
  });

  it('renders account header with user name', () => {
    renderWithProviders(<Account />);
    expect(screen.getByTestId('account-header')).toBeTruthy();
    const nameElements = screen.getAllByText('Test User');
    expect(nameElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders sidebar', () => {
    renderWithProviders(<Account />);
    expect(screen.getByTestId('account-sidebar')).toBeTruthy();
  });

  it('shows dashboard tab by default', () => {
    renderWithProviders(<Account />);
    expect(screen.getByTestId('profile-dashboard')).toBeTruthy();
  });

  it('switches to orders tab', () => {
    renderWithProviders(<Account />);
    fireEvent.click(screen.getByTestId('tab-orders'));
    expect(screen.getByTestId('orders-history')).toBeTruthy();
    expect(screen.getByText('ord123')).toBeTruthy();
  });

  it('switches to addresses tab', () => {
    renderWithProviders(<Account />);
    fireEvent.click(screen.getByTestId('tab-addresses'));
    expect(screen.getByTestId('saved-address')).toBeTruthy();
    expect(screen.getByText('123 Street')).toBeTruthy();
  });

  it('switches to wishlist tab', () => {
    renderWithProviders(<Account />);
    fireEvent.click(screen.getByTestId('tab-wishlist'));
    expect(screen.getByTestId('account-wishlist')).toBeTruthy();
    expect(screen.getByText('Wishlist Item')).toBeTruthy();
  });

  it('sign out button calls logoutUser and navigates', () => {
    renderWithProviders(<Account />);
    fireEvent.click(screen.getByTestId('sign-out-btn'));
    expect(mockLogoutUser).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('redirects to auth when no user', () => {
    mockUserData = null;
    renderWithProviders(<Account />);
    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });

  it('returns null when no user (before redirect)', () => {
    mockUserData = null;
    const { container } = renderWithProviders(<Account />);
    expect(container.innerHTML).toBe('');
  });

  it('profile dashboard shows user email', () => {
    renderWithProviders(<Account />);
    expect(screen.getByText('test@test.com')).toBeTruthy();
  });
});
