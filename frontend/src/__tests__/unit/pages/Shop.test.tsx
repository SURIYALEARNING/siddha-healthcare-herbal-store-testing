import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders, createMockAppData, mockProduct } from '../../utils/test-utils';

const mockSetSearchTerm = vi.fn();
const mockSetCategoryFilter = vi.fn();
const mockSetSortBy = vi.fn();
const mockGoToPage = vi.fn();
const mockResetFilters = vi.fn();

const defaultFilters = {
  searchTerm: '',
  setSearchTerm: mockSetSearchTerm,
  categoryFilter: 'All',
  setCategoryFilter: mockSetCategoryFilter,
  sortBy: 'newest',
  setSortBy: mockSetSortBy,
  categories: ['All', 'Immunity Boosters', 'Digestive Care'],
  paginatedProducts: [mockProduct, { ...mockProduct, _id: 'prod2', name: { en: 'Second Product', ta: '' } }],
  sortedProducts: [mockProduct, { ...mockProduct, _id: 'prod2', name: { en: 'Second Product', ta: '' } }],
  currentPage: 1,
  totalPages: 1,
  goToPage: mockGoToPage,
  resetFilters: mockResetFilters,
};

let useFiltersReturn = { ...defaultFilters };

vi.mock('../../../hooks/useShopFilters', () => ({
  useShopFilters: () => useFiltersReturn,
}));

const mockAppData = createMockAppData({
  products: [mockProduct, { ...mockProduct, _id: 'prod2', name: { en: 'Second Product', ta: '' } }],
  addToCart: vi.fn(),
  toggleWishlist: vi.fn(),
  isInWishlist: vi.fn().mockReturnValue(false),
});

vi.mock('../../../context/AppContext', () => ({
  useApp: () => mockAppData,
  AppProvider: ({ children }: any) => children,
}));

vi.mock('../../../components/shop', () => ({
  ShopProductCard: ({ product, onAddToCart }: any) => (
    <div data-testid="shop-product-card">
      <span>{product.name?.en || product.name}</span>
      <button onClick={() => onAddToCart(product, 1)} data-testid="add-to-cart-btn">Add to Cart</button>
    </div>
  ),
  ShopDesktopFilters: ({ searchTerm, onSearchChange, categoryFilter, categories, onCategoryChange, sortBy, onSortChange }: any) => (
    <div data-testid="shop-desktop-filters">
      <input data-testid="desktop-search" value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search..." />
      <select data-testid="desktop-category" value={categoryFilter} onChange={(e) => onCategoryChange(e.target.value)}>
        {categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
      </select>
      <select data-testid="desktop-sort" value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
        <option value="newest">Newest</option>
        <option value="price-low">Price Low</option>
        <option value="price-high">Price High</option>
      </select>
    </div>
  ),
  ShopMobileFilters: ({ categoryFilter, categories, onCategoryChange, onClose }: any) => (
    <div data-testid="shop-mobile-filters">
      <select data-testid="mobile-category" value={categoryFilter} onChange={(e) => onCategoryChange(e.target.value)}>
        {categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
      </select>
      <button onClick={onClose} data-testid="close-mobile-filters">Close</button>
    </div>
  ),
}));

import Shop from '../../../pages/Shop';

describe('Shop Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useFiltersReturn = { ...defaultFilters };
    useFiltersReturn.paginatedProducts = [mockProduct, { ...mockProduct, _id: 'prod2', name: { en: 'Second Product', ta: '' } }];
    useFiltersReturn.sortedProducts = [mockProduct, { ...mockProduct, _id: 'prod2', name: { en: 'Second Product', ta: '' } }];
  });

  it('renders page title and subtitle', () => {
    renderWithProviders(<Shop />);
    expect(screen.getByText('shop.title')).toBeTruthy();
    expect(screen.getByText('shop.subtitle')).toBeTruthy();
  });

  it('renders desktop filters', () => {
    renderWithProviders(<Shop />);
    expect(screen.getByTestId('shop-desktop-filters')).toBeTruthy();
  });

  it('renders product cards', () => {
    renderWithProviders(<Shop />);
    const cards = screen.getAllByTestId('shop-product-card');
    expect(cards.length).toBe(2);
  });

  it('renders results count', () => {
    renderWithProviders(<Shop />);
    expect(screen.getByText('shop.displayingResults')).toBeTruthy();
  });

  it('search input works', () => {
    renderWithProviders(<Shop />);
    const searchInput = screen.getByTestId('desktop-search');
    fireEvent.change(searchInput, { target: { value: 'herbal' } });
    expect(mockSetSearchTerm).toHaveBeenCalledWith('herbal');
  });

  it('category filter changes', () => {
    renderWithProviders(<Shop />);
    const categorySelect = screen.getByTestId('desktop-category');
    fireEvent.change(categorySelect, { target: { value: 'Digestive Care' } });
    expect(mockSetCategoryFilter).toHaveBeenCalledWith('Digestive Care');
  });

  it('sort option changes', () => {
    renderWithProviders(<Shop />);
    const sortSelect = screen.getByTestId('desktop-sort');
    fireEvent.change(sortSelect, { target: { value: 'price-low' } });
    expect(mockSetSortBy).toHaveBeenCalledWith('price-low');
  });

  it('add to cart button works', () => {
    renderWithProviders(<Shop />);
    const addButtons = screen.getAllByTestId('add-to-cart-btn');
    fireEvent.click(addButtons[0]);
    expect(mockAppData.addToCart).toHaveBeenCalledWith(expect.any(Object), 1);
  });

  it('mobile filters toggle works', () => {
    renderWithProviders(<Shop />);
    const filterButton = screen.getByText('common.filters').closest('button');
    expect(filterButton).toBeTruthy();
    if (filterButton) {
      fireEvent.click(filterButton);
      expect(screen.getByTestId('shop-mobile-filters')).toBeTruthy();
      const closeBtn = screen.getByTestId('close-mobile-filters');
      fireEvent.click(closeBtn);
    }
  });

  it('empty state shows when no products match', () => {
    useFiltersReturn = { ...defaultFilters, paginatedProducts: [], sortedProducts: [], totalPages: 1 };
    renderWithProviders(<Shop />);
    expect(screen.getByText('shop.noResultsTitle')).toBeTruthy();
    expect(screen.getByText('shop.noResultsMessage')).toBeTruthy();
    const resetBtn = screen.getByText('shop.resetFilters');
    fireEvent.click(resetBtn);
    expect(mockResetFilters).toHaveBeenCalled();
  });

  it('pagination renders when totalPages > 1', () => {
    useFiltersReturn = { ...defaultFilters, paginatedProducts: [mockProduct], sortedProducts: [mockProduct], totalPages: 3, currentPage: 2 };
    renderWithProviders(<Shop />);
    expect(screen.getByText('common.prev')).toBeTruthy();
    expect(screen.getByText('common.next')).toBeTruthy();
    const pageBtn = screen.getByText('1');
    fireEvent.click(pageBtn);
    expect(mockGoToPage).toHaveBeenCalledWith(1);
  });
});
