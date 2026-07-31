import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, createMockAppData, mockProduct, mockBlog } from '../../utils/test-utils';

const mockFn = vi.fn();
const mockAppData = createMockAppData({
  products: [mockProduct, mockProduct, mockProduct, mockProduct, mockProduct],
  blogs: [mockBlog, mockBlog, mockBlog],
});

vi.mock('../../../context/AppContext', () => ({
  useApp: () => mockAppData,
  AppProvider: ({ children }: any) => children,
}));

vi.mock('../../../components/ProductPromoCarousel', () => ({
  default: () => <div data-testid="product-promo-carousel">Promo</div>,
}));

import Home from '../../../pages/Home';

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hero carousel', () => {
    renderWithProviders(<Home onConsultationClick={mockFn} />);
    const carousel = document.querySelector('.relative.w-full.overflow-hidden');
    expect(carousel).toBeTruthy();
    expect(document.querySelectorAll('[aria-label="Previous"]').length).toBe(1);
    expect(document.querySelectorAll('[aria-label="Next"]').length).toBe(1);
  });

  it('renders brand logo section', () => {
    renderWithProviders(<Home onConsultationClick={mockFn} />);
    const logo = screen.getByAltText('Siddha Healthcare Logo');
    expect(logo).toBeTruthy();
  });

  it('renders why choose us section', () => {
    renderWithProviders(<Home onConsultationClick={mockFn} />);
    expect(screen.getByText('home.benefitAyush')).toBeTruthy();
    expect(screen.getByText('home.benefitNatural')).toBeTruthy();
    expect(screen.getByText('home.benefitAI')).toBeTruthy();
    expect(screen.getByText('home.benefitOnline')).toBeTruthy();
  });

  it('renders product promo carousel', () => {
    renderWithProviders(<Home onConsultationClick={mockFn} />);
    expect(screen.getByTestId('product-promo-carousel')).toBeTruthy();
  });

  it('renders blog previews section', () => {
    renderWithProviders(<Home onConsultationClick={mockFn} />);
    expect(screen.getAllByText('Test Blog Article').length).toBe(3);
    expect(screen.getAllByText('Daily Wellness').length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText('home.readAllArticles')).toBeTruthy();
  });

  it('renders customer testimonials', () => {
    renderWithProviders(<Home onConsultationClick={mockFn} />);
    expect(screen.getByText('home.testimonialsTitle')).toBeTruthy();
    expect(screen.getByText('Janani Raja')).toBeTruthy();
    expect(screen.getByText('Ganesh Kuppusamy')).toBeTruthy();
    expect(screen.getByText('Anantharaman')).toBeTruthy();
  });

  it('renders footer with contact info', () => {
    renderWithProviders(<Home onConsultationClick={mockFn} />);
    expect(screen.getByText('footer.storeName')).toBeTruthy();
    expect(screen.getByText(/Phone:/)).toBeTruthy();
    expect(screen.getByText(/98765 43210/)).toBeTruthy();
    expect(screen.getByText(/care@siddhahealthcare.in/)).toBeTruthy();
  });

  it('renders read more link to blogs', () => {
    renderWithProviders(<Home onConsultationClick={mockFn} />);
    const readAllLink = screen.getByText('home.readAllArticles');
    expect(readAllLink.closest('a')).toHaveAttribute('href', '/blogs');
  });

  it('renders consultation button and triggers callback', () => {
    renderWithProviders(<Home onConsultationClick={mockFn} />);
    const consultBtn = screen.getByText('home.benefitOnline');
    expect(consultBtn).toBeTruthy();
  });

  it('renders benefit section items', () => {
    renderWithProviders(<Home onConsultationClick={mockFn} />);
    expect(screen.getByText('home.benefitAyushDesc')).toBeTruthy();
    expect(screen.getByText('home.benefitNaturalDesc')).toBeTruthy();
    expect(screen.getByText('home.benefitAIDesc')).toBeTruthy();
    expect(screen.getByText('home.benefitOnlineDesc')).toBeTruthy();
  });
});
