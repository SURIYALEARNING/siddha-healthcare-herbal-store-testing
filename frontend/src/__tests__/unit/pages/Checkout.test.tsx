import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, createMockAppData, mockCartItem, mockUser } from '../../utils/test-utils';

const mockNavigate = vi.fn();
const mockSubmitOrder = vi.fn().mockResolvedValue({ id: 'order123' });

let mockCartData: any[] = [mockCartItem];
let mockUserData: any = null;

const mockAppData = createMockAppData({
  get cart() { return mockCartData; },
  set cart(v) { mockCartData = v; },
  user: null,
  activeCoupon: null,
  error: null,
  submitOrder: mockSubmitOrder,
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

vi.mock('../../../components/checkout/ShippingForm', () => ({
  default: ({ fullName, setFullName, mobileNumber, setMobileNumber, email, setEmail, address, setAddress, state, setState, district, setDistrict, pincode, setPincode, validationError, error, user }: any) => (
    <div data-testid="shipping-form">
      {!user && <p data-testid="guest-message">checkout.guestMessage</p>}
      <input data-testid="input-fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" />
      <input data-testid="input-mobile" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="Mobile" />
      <input data-testid="input-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input data-testid="input-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" />
      <input data-testid="input-district" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="District" />
      <input data-testid="input-pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Pincode" />
      <select data-testid="select-state" value={state} onChange={(e) => setState(e.target.value)}>
        <option value="Tamil Nadu">Tamil Nadu</option>
      </select>
      {validationError && <div data-testid="validation-error">{validationError}</div>}
      {error && <div data-testid="api-error">{error}</div>}
    </div>
  ),
}));

vi.mock('../../../components/checkout/PaymentSelector', () => ({
  default: ({ paymentMethod, setPaymentMethod }: any) => (
    <div data-testid="payment-selector">
      <button onClick={() => setPaymentMethod('UPI')} data-testid="pay-upi">UPI</button>
      <button onClick={() => setPaymentMethod('Cash on Delivery')} data-testid="pay-cod">COD</button>
      <span>Selected: {paymentMethod}</span>
    </div>
  ),
}));

vi.mock('../../../components/checkout/OrderSummary', () => ({
  default: ({ cart, subtotal, discountAmount, deliveryCharges, total, hasCoupon, orderSubmitting, paymentMethod }: any) => (
    <div data-testid="order-summary">
      <span>Submitting: {String(orderSubmitting)}</span>
      <span>Method: {paymentMethod}</span>
      <button type="submit" data-testid="place-order-btn">Place Order</button>
    </div>
  ),
}));

import Checkout from '../../../pages/Checkout';

describe('Checkout Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCartData = [mockCartItem];
    mockUserData = null;
    mockAppData.user = null;
    mockAppData.cart = [mockCartItem];
  });

  it('renders shipping form', () => {
    renderWithProviders(<Checkout />);
    expect(screen.getByTestId('shipping-form')).toBeTruthy();
    expect(screen.getByTestId('payment-selector')).toBeTruthy();
    expect(screen.getByTestId('order-summary')).toBeTruthy();
  });

  it('payment method can be changed', () => {
    renderWithProviders(<Checkout />);
    fireEvent.click(screen.getByTestId('pay-upi'));
    expect(screen.getByText('Selected: UPI')).toBeTruthy();
    fireEvent.click(screen.getByTestId('pay-cod'));
    expect(screen.getByText('Selected: Cash on Delivery')).toBeTruthy();
  });

  it('shows validation error on empty submit', async () => {
    renderWithProviders(<Checkout />);
    const submitBtn = screen.getByTestId('place-order-btn');
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.getByText('checkout.validation.fillFields')).toBeTruthy();
    });
  });

  it('submits order with COD', async () => {
    renderWithProviders(<Checkout />);
    fireEvent.change(screen.getByTestId('input-fullName'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByTestId('input-mobile'), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByTestId('input-address'), { target: { value: '123 Street' } });
    fireEvent.change(screen.getByTestId('input-district'), { target: { value: 'Coimbatore' } });
    fireEvent.change(screen.getByTestId('input-pincode'), { target: { value: '641004' } });
    fireEvent.click(screen.getByTestId('pay-cod'));
    fireEvent.click(screen.getByTestId('place-order-btn'));
    await waitFor(() => {
      expect(mockSubmitOrder).toHaveBeenCalled();
    });
  });

  it('shows loading state during submission', async () => {
    mockSubmitOrder.mockImplementationOnce(() => new Promise(() => {}));
    renderWithProviders(<Checkout />);
    fireEvent.change(screen.getByTestId('input-fullName'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByTestId('input-mobile'), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByTestId('input-address'), { target: { value: '123 Street' } });
    fireEvent.change(screen.getByTestId('input-district'), { target: { value: 'Coimbatore' } });
    fireEvent.change(screen.getByTestId('input-pincode'), { target: { value: '641004' } });
    fireEvent.click(screen.getByTestId('place-order-btn'));
    await waitFor(() => {
      expect(screen.getByText('Submitting: true')).toBeTruthy();
    });
  });

  it('navigates to cart when cart is empty', () => {
    mockCartData = [];
    mockAppData.cart = [];
    renderWithProviders(<Checkout />);
    expect(mockNavigate).toHaveBeenCalledWith('/cart');
  });

  it('renders guest message when not logged in', () => {
    mockUserData = null;
    renderWithProviders(<Checkout />);
    expect(screen.getByText('checkout.guestMessage')).toBeTruthy();
  });
});
