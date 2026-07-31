import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, createMockAppData, mockCartItem } from '../../utils/test-utils';

const mockUpdateCartQuantity = vi.fn();
const mockRemoveFromCart = vi.fn();
const mockApplyCouponCode = vi.fn();
const mockRemoveCoupon = vi.fn();
const mockNavigate = vi.fn();

const mockAppData = createMockAppData({
  cart: [mockCartItem, { ...mockCartItem, productId: 'prod2', name: 'Second Item', quantity: 1 }],
  updateCartQuantity: mockUpdateCartQuantity,
  removeFromCart: mockRemoveFromCart,
  applyCouponCode: mockApplyCouponCode,
  removeCoupon: mockRemoveCoupon,
  activeCoupon: null,
});

vi.mock('../../../context/AppContext', () => ({
  useApp: () => mockAppData,
  AppProvider: ({ children }: any) => children,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import Cart from '../../../pages/Cart';

describe('Cart Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders cart items', () => {
    renderWithProviders(<Cart />);
    expect(screen.getByText('Test Product')).toBeTruthy();
    expect(screen.getByText('Second Item')).toBeTruthy();
    expect(screen.getByText('cart.shoppingBag')).toBeTruthy();
    expect(screen.getByText('cart.reviewSelection')).toBeTruthy();
  });

  it('renders quantity controls', () => {
    renderWithProviders(<Cart />);
    const decrementBtns = screen.getAllByText('-');
    const incrementBtns = screen.getAllByText('+');
    expect(decrementBtns.length).toBeGreaterThanOrEqual(2);
    expect(incrementBtns.length).toBeGreaterThanOrEqual(2);
  });

  it('quantity decrement works', () => {
    renderWithProviders(<Cart />);
    const decrementBtns = screen.getAllByText('-');
    fireEvent.click(decrementBtns[0]);
    expect(mockUpdateCartQuantity).toHaveBeenCalledWith('prod1', 1);
  });

  it('quantity increment works', () => {
    renderWithProviders(<Cart />);
    const incrementBtns = screen.getAllByText('+');
    fireEvent.click(incrementBtns[0]);
    expect(mockUpdateCartQuantity).toHaveBeenCalledWith('prod1', 3);
  });

  it('remove item button works', () => {
    renderWithProviders(<Cart />);
    const removeBtns = screen.getAllByTitle('cart.removeProduct');
    fireEvent.click(removeBtns[0]);
    expect(mockRemoveFromCart).toHaveBeenCalledWith('prod1');
  });

  it('renders cart summary with totals', () => {
    renderWithProviders(<Cart />);
    expect(screen.getByText('cart.cartCostSummary')).toBeTruthy();
    expect(screen.getByText('cart.itemsCostSubtotal')).toBeTruthy();
    expect(screen.getByText('cart.shippingDeliveryFee')).toBeTruthy();
    expect(screen.getByText('cart.orderTotalCost')).toBeTruthy();
  });

  it('renders coupon section', () => {
    renderWithProviders(<Cart />);
    expect(screen.getByText('cart.applyCoupon')).toBeTruthy();
    expect(screen.getByPlaceholderText('cart.couponPlaceholder')).toBeTruthy();
    expect(screen.getByText('cart.apply')).toBeTruthy();
  });

  it('coupon submission works', async () => {
    mockApplyCouponCode.mockResolvedValueOnce(true);
    renderWithProviders(<Cart />);
    const couponInput = screen.getByPlaceholderText('cart.couponPlaceholder');
    fireEvent.change(couponInput, { target: { value: 'SAVE20' } });
    fireEvent.click(screen.getByText('cart.apply'));
    await waitFor(() => {
      expect(mockApplyCouponCode).toHaveBeenCalledWith('SAVE20');
    });
  });

  it('shows coupon error when invalid', async () => {
    mockApplyCouponCode.mockResolvedValueOnce(false);
    renderWithProviders(<Cart />);
    const couponInput = screen.getByPlaceholderText('cart.couponPlaceholder');
    fireEvent.change(couponInput, { target: { value: 'INVALID' } });
    fireEvent.click(screen.getByText('cart.apply'));
    await waitFor(() => {
      expect(screen.getByText('cart.invalidCoupon')).toBeTruthy();
    });
  });

  it('shows active coupon when applied', () => {
    mockAppData.activeCoupon = { code: 'SAVE20', percent: 20 };
    renderWithProviders(<Cart />);
    expect(screen.getByText('cart.couponApplied')).toBeTruthy();
    expect(screen.getByText('cart.removeCoupon')).toBeTruthy();
  });

  it('remove coupon button works', () => {
    mockAppData.activeCoupon = { code: 'SAVE20', percent: 20 };
    renderWithProviders(<Cart />);
    fireEvent.click(screen.getByText('cart.removeCoupon'));
    expect(mockRemoveCoupon).toHaveBeenCalled();
  });

  it('checkout button navigates to checkout', () => {
    renderWithProviders(<Cart />);
    const checkoutBtn = screen.getByText('cart.checkout');
    fireEvent.click(checkoutBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/checkout');
  });

  it('renders back to shopping link', () => {
    renderWithProviders(<Cart />);
    const backLink = screen.getByText('cart.backToShopping').closest('a');
    expect(backLink).toHaveAttribute('href', '/shop');
  });

  it('renders SSL badge', () => {
    renderWithProviders(<Cart />);
    expect(screen.getByText('cart.sslProtectedCheckout')).toBeTruthy();
  });

  it('shows free delivery message', () => {
    renderWithProviders(<Cart />);
    expect(screen.getByText('cart.freeDeliveryOnOrders')).toBeTruthy();
  });

  it('shows empty cart message when no items', () => {
    mockAppData.cart = [];
    renderWithProviders(<Cart />);
    expect(screen.getByText('cart.emptyTitle')).toBeTruthy();
    expect(screen.getByText('cart.emptyMessage')).toBeTruthy();
    const shopLink = screen.getByText('cart.explorePharmacy').closest('a');
    expect(shopLink).toHaveAttribute('href', '/shop');
  });
});
