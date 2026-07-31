import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, createMockAppData, mockProduct } from '../../utils/test-utils';

const mockFetchProductById = vi.fn();
const mockCheckPincode = vi.fn();
const mockCheckMyAddress = vi.fn();

const mockAddToCart = vi.fn();
const mockToggleWishlist = vi.fn();
const mockIsInWishlist = vi.fn().mockReturnValue(false);

let mockUserData: any = null;
const mockAppProducts = [mockProduct, { ...mockProduct, _id: 'prod2', name: { en: 'Related Product', ta: '' }, category: { _id: 'cat1', name: { en: 'Immunity Boosters', ta: '' } } }];

const mockAppData = createMockAppData({
  user: null,
  products: mockAppProducts,
  addToCart: mockAddToCart,
  toggleWishlist: mockToggleWishlist,
  isInWishlist: mockIsInWishlist,
});

vi.mock('../../../context/AppContext', () => ({
  useApp: () => mockAppData,
  AppProvider: ({ children }: any) => children,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'prod1' }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../../../api/products', () => ({
  fetchProductByIdApi: (...args: any[]) => mockFetchProductById(...args),
}));

vi.mock('../../../api/shipping', () => ({
  checkPincodeApi: (...args: any[]) => mockCheckPincode(...args),
  checkMyAddressApi: (...args: any[]) => mockCheckMyAddress(...args),
}));

vi.mock('../../../components/product/ImageGallery', () => ({
  default: ({ images, name }: any) => <div data-testid="image-gallery">{name}</div>,
}));

vi.mock('../../../components/product/ProductInfo', () => ({
  default: ({ name, price, discountPrice, description, inWishlist, onToggleWishlist }: any) => (
    <div data-testid="product-info">
      <h1>{name}</h1>
      <span data-testid="product-price">{discountPrice}</span>
      <p>{description}</p>
      <button onClick={onToggleWishlist} data-testid="toggle-wishlist-btn">{inWishlist ? 'Remove' : 'Add'} Wishlist</button>
    </div>
  ),
}));

vi.mock('../../../components/product/ProductActions', () => ({
  default: ({ onAddToCart, onBuyNow, stock }: any) => (
    <div data-testid="product-actions">
      <button onClick={() => onAddToCart(1)} data-testid="add-to-cart-btn">Add to Cart</button>
      <button onClick={() => onBuyNow(1)} data-testid="buy-now-btn">Buy Now</button>
      <span>Stock: {stock}</span>
    </div>
  ),
}));

vi.mock('../../../components/product/ProductTabs', () => ({
  default: ({ ingredients, benefits }: any) => (
    <div data-testid="product-tabs">
      <span>Ingredients: {ingredients.join(', ')}</span>
      <span>Benefits: {benefits.join(', ')}</span>
    </div>
  ),
}));

vi.mock('../../../components/product/ReviewSection', () => ({
  default: ({ productId }: any) => <div data-testid="review-section">Reviews for {productId}</div>,
}));

vi.mock('../../../components/product/RelatedProducts', () => ({
  default: ({ products }: any) => (
    <div data-testid="related-products">
      {products.map((p: any) => <span key={p._id}>{p.name?.en || p.name}</span>)}
    </div>
  ),
}));

vi.mock('../../../components/ui/Spinner', () => ({
  Spinner: ({ size }: any) => <div data-testid="spinner" className={size}>Loading...</div>,
}));

import ProductDetails from '../../../pages/ProductDetails';

describe('ProductDetails Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserData = null;
    mockAppData.user = null;
    mockAppData.products = mockAppProducts;
    mockFetchProductById.mockResolvedValue(mockProduct);
    mockIsInWishlist.mockReturnValue(false);
  });

  it('shows loading state initially', async () => {
    mockFetchProductById.mockImplementationOnce(() => new Promise(() => {}));
    renderWithProviders(<ProductDetails />);
    expect(screen.getByTestId('spinner')).toBeTruthy();
  });

  it('renders product info after loading', async () => {
    renderWithProviders(<ProductDetails />);
    await waitFor(() => {
      expect(screen.getByTestId('product-info')).toBeTruthy();
    });
    expect(screen.getByTestId('image-gallery')).toBeTruthy();
    expect(screen.getByTestId('product-actions')).toBeTruthy();
  });

  it('renders product tabs section', async () => {
    renderWithProviders(<ProductDetails />);
    await waitFor(() => {
      expect(screen.getByTestId('product-tabs')).toBeTruthy();
    });
    expect(screen.getByText(/Ingredients:/)).toBeTruthy();
    expect(screen.getByText(/Benefits:/)).toBeTruthy();
  });

  it('renders review section', async () => {
    renderWithProviders(<ProductDetails />);
    await waitFor(() => {
      expect(screen.getByTestId('review-section')).toBeTruthy();
    });
    expect(screen.getByText('Reviews for prod1')).toBeTruthy();
  });

  it('renders related products', async () => {
    renderWithProviders(<ProductDetails />);
    await waitFor(() => {
      expect(screen.getByTestId('related-products')).toBeTruthy();
    });
    expect(screen.getByText('Related Product')).toBeTruthy();
  });

  it('add to cart button calls addToCart', async () => {
    renderWithProviders(<ProductDetails />);
    await waitFor(() => {
      expect(screen.getByTestId('add-to-cart-btn')).toBeTruthy();
    });
    fireEvent.click(screen.getByTestId('add-to-cart-btn'));
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct, 1);
  });

  it('buy now button calls addToCart and navigates', async () => {
    renderWithProviders(<ProductDetails />);
    await waitFor(() => {
      expect(screen.getByTestId('buy-now-btn')).toBeTruthy();
    });
    fireEvent.click(screen.getByTestId('buy-now-btn'));
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct, 1);
  });

  it('toggle wishlist works', async () => {
    renderWithProviders(<ProductDetails />);
    await waitFor(() => {
      expect(screen.getByTestId('toggle-wishlist-btn')).toBeTruthy();
    });
    fireEvent.click(screen.getByTestId('toggle-wishlist-btn'));
    expect(mockToggleWishlist).toHaveBeenCalledWith('prod1');
  });

  it('shows back to shop link', async () => {
    renderWithProviders(<ProductDetails />);
    await waitFor(() => {
      expect(screen.getByText('Remedies Gallery')).toBeTruthy();
    });
    const backLink = screen.getByText('Remedies Gallery').closest('a');
    expect(backLink).toHaveAttribute('href', '/shop');
  });

  it('shows delivery pincode input when user has no address', async () => {
    renderWithProviders(<ProductDetails />);
    await waitFor(() => {
      expect(screen.getByText('Delivery To')).toBeTruthy();
    });
    expect(screen.getByPlaceholderText('Enter Pincode')).toBeTruthy();
    const checkBtn = screen.getByText('check');
    expect(checkBtn).toBeTruthy();
  });

  it('shows not found state when product not found', async () => {
    mockAppData.products = [];
    mockFetchProductById.mockRejectedValueOnce(new Error('Not found'));
    renderWithProviders(<ProductDetails />);
    await waitFor(() => {
      expect(screen.getByText('productDetails.loading')).toBeTruthy();
    });
  });
});
