import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SupportCarousel from '../../../components/SupportCarousel';
import type { SupportCarouselItem } from '../../../components/SupportCarousel';

const icon = <span>leaf-icon</span>;

const items: SupportCarouselItem[] = [
  { id: '1', title: 'Vision', description: 'Our vision is to be a leader in natural health.', icon },
  { id: '2', title: 'Mission', description: 'To deliver authentic herbal products.', icon },
  { id: '3', title: 'Goal', description: 'Holistic health for everyone.', icon },
];

describe('SupportCarousel', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders every item with title, description and icon', () => {
    render(<SupportCarousel items={items} />);
    expect(screen.getAllByText('Vision').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Mission').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Goal').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Our vision is to be a leader in natural health.').length).toBeGreaterThan(0);
    expect(screen.getAllByText('leaf-icon').length).toBeGreaterThan(0);
  });

  it('duplicates items internally for the marquee', () => {
    render(<SupportCarousel items={items} />);
    expect(screen.getAllByText('Vision')).toHaveLength(2);
    expect(screen.getAllByText('Mission')).toHaveLength(2);
    expect(screen.getAllByText('Goal')).toHaveLength(2);
  });

  it('applies default card sizes and speed', () => {
    const { container } = render(<SupportCarousel items={items} />);
    const carousel = container.querySelector('[data-testid="support-carousel"]') as HTMLElement;
    expect(carousel.style.getPropertyValue('--sc-card-width')).toBe('520px');
    expect(carousel.style.getPropertyValue('--sc-card-height')).toBe('190px');

    const track = screen.getByTestId('support-carousel-track') as HTMLElement;
    expect(track.style.getPropertyValue('--speed')).toBe('35s');
    expect(track.style.animationPlayState).toBe('running');
  });

  it('uses custom card size and speed props', () => {
    const { container } = render(<SupportCarousel items={items} cardWidth={420} cardHeight={180} speed={50} />);
    const carousel = container.querySelector('[data-testid="support-carousel"]') as HTMLElement;
    expect(carousel.style.getPropertyValue('--sc-card-width')).toBe('420px');
    expect(carousel.style.getPropertyValue('--sc-card-height')).toBe('180px');

    const track = screen.getByTestId('support-carousel-track') as HTMLElement;
    expect(track.style.getPropertyValue('--speed')).toBe('50s');
  });

  it('pauses animation on hover when pauseOnHover is enabled', () => {
    render(<SupportCarousel items={items} pauseOnHover />);
    const carousel = screen.getByTestId('support-carousel');
    const track = screen.getByTestId('support-carousel-track') as HTMLElement;

    fireEvent.mouseEnter(carousel);
    expect(track.style.animationPlayState).toBe('paused');

    fireEvent.mouseLeave(carousel);
    expect(track.style.animationPlayState).toBe('running');
  });

  it('does not pause on hover when pauseOnHover is disabled', () => {
    render(<SupportCarousel items={items} />);
    const carousel = screen.getByTestId('support-carousel');
    const track = screen.getByTestId('support-carousel-track') as HTMLElement;

    fireEvent.mouseEnter(carousel);
    expect(track.style.animationPlayState).toBe('running');
  });

  it('forwards className to the wrapper', () => {
    render(<SupportCarousel items={items} className="custom-class" />);
    expect(screen.getByTestId('support-carousel')).toHaveClass('custom-class');
  });

  it('renders a static layout without animation for prefers-reduced-motion', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = render(<SupportCarousel items={items} />);
    expect(container.querySelector('[data-testid="support-carousel-track"]')).toBeNull();
    expect(screen.getAllByText('Vision')).toHaveLength(1);
    expect(screen.getAllByText('Mission')).toHaveLength(1);
    expect(screen.getAllByText('Goal')).toHaveLength(1);
  });
});
