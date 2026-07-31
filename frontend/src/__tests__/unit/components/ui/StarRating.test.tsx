import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { StarRating } from '../../../../components/ui/StarRating';

describe('StarRating', () => {
  it('renders correct number of stars based on rating (3/5)', () => {
    const { container } = render(<StarRating rating={3} />);
    const stars = container.querySelectorAll('span:not([class]) span');
    const filledStars = container.querySelectorAll('.text-amber-400');
    const emptyStars = container.querySelectorAll('.text-gray-300');
    expect(filledStars.length).toBe(3);
    expect(emptyStars.length).toBe(2);
  });

  it('renders all empty when rating is 0', () => {
    const { container } = render(<StarRating rating={0} />);
    const filledStars = container.querySelectorAll('.text-amber-400');
    const emptyStars = container.querySelectorAll('.text-gray-300');
    expect(filledStars.length).toBe(0);
    expect(emptyStars.length).toBe(5);
  });

  it('renders all full when rating is 5', () => {
    const { container } = render(<StarRating rating={5} />);
    const filledStars = container.querySelectorAll('.text-amber-400');
    const emptyStars = container.querySelectorAll('.text-gray-300');
    expect(filledStars.length).toBe(5);
    expect(emptyStars.length).toBe(0);
  });
});
