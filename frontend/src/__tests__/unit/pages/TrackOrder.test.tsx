import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, createMockAppData, mockOrder } from '../../utils/test-utils';

const mockTrackOrderApi = vi.hoisted(() => vi.fn());
const mockAppData = createMockAppData({ orders: [mockOrder] });

vi.mock('../../../context/AppContext', () => ({
  useApp: () => mockAppData,
  AppProvider: ({ children }: any) => children,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({ pathname: '/track-order', search: '', hash: '', state: { justPlacedId: 'ord123' } }),
  };
});

vi.mock('../../../api', () => ({
  trackOrderApi: mockTrackOrderApi,
}));

import TrackOrder from '../../../pages/TrackOrder';

describe('TrackOrder Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockAppData.orders = [mockOrder];
  });

  it('shows loading state initially', () => {
    mockAppData.orders = [];
    mockTrackOrderApi.mockReturnValueOnce(new Promise(() => {}));
    renderWithProviders(<TrackOrder />);
    expect(screen.getByText('Loading tracking information...')).toBeTruthy();
  });

  it('renders order tracking info', async () => {
    renderWithProviders(<TrackOrder />);
    await waitFor(() => {
      expect(screen.getByText('Track Order')).toBeTruthy();
    });
    expect(screen.getByText('#ord123')).toBeTruthy();
    expect(screen.getByText('Pending')).toBeTruthy();
  });

  it('renders back to account link', async () => {
    renderWithProviders(<TrackOrder />);
    await waitFor(() => {
      const backLink = screen.getByText('Back to Account').closest('a');
      expect(backLink).toHaveAttribute('href', '/account');
    });
  });

  it('renders payment status', async () => {
    renderWithProviders(<TrackOrder />);
    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeTruthy();
    });
  });

  it('renders timeline events', async () => {
    renderWithProviders(<TrackOrder />);
    await waitFor(() => {
      expect(screen.getByText('Timeline')).toBeTruthy();
    });
    const elements = screen.getAllByText('Order Placed');
    expect(elements.length).toBeGreaterThanOrEqual(2);
  });

  it('renders courier info section', async () => {
    renderWithProviders(<TrackOrder />);
    await waitFor(() => {
      expect(screen.getByText('Courier')).toBeTruthy();
    });
    expect(screen.getByText('Test Courier')).toBeTruthy();
    expect(screen.getByText('Tracking No.')).toBeTruthy();
    expect(screen.getByText('AWB123')).toBeTruthy();
  });

  it('renders shipping address', async () => {
    renderWithProviders(<TrackOrder />);
    await waitFor(() => {
      expect(screen.getByText('Shipping Address')).toBeTruthy();
    });
    expect(screen.getByText('123 Street, Coimbatore, Tamil Nadu - 641004')).toBeTruthy();
  });

  it('renders order total', async () => {
    renderWithProviders(<TrackOrder />);
    await waitFor(() => {
      expect(screen.getByText('₹798')).toBeTruthy();
    });
  });

  it('shows not found state when order not found', async () => {
    mockAppData.orders = [];
    mockTrackOrderApi.mockRejectedValueOnce(new Error('Not found'));
    renderWithProviders(<TrackOrder />);
    await waitFor(() => {
      expect(screen.getByText('Order not found. Please check the ID and try again.')).toBeTruthy();
    });
  });

  it('manual lookup form works in not found state', async () => {
    mockAppData.orders = [];
    mockTrackOrderApi.mockRejectedValueOnce(new Error('Not found'));
    renderWithProviders(<TrackOrder />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter Order ID')).toBeTruthy();
    });
    const input = screen.getByPlaceholderText('Enter Order ID');
    fireEvent.change(input, { target: { value: 'ORD456' } });
    fireEvent.click(screen.getByText('Track'));
    expect(mockTrackOrderApi).toHaveBeenCalledWith('ORD456');
  });

  it('renders status steps', async () => {
    renderWithProviders(<TrackOrder />);
    await waitFor(() => {
      expect(screen.getByText('Track Order')).toBeTruthy();
    });
    const steps = screen.getAllByText('Order Placed');
    expect(steps.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Payment Successful')).toBeTruthy();
  });
});
