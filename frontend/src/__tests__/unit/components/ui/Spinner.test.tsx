import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Spinner } from '../../../../components/ui/Spinner';

describe('Spinner', () => {
  it('renders with sm size', () => {
    const { container } = render(<Spinner size="sm" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner?.className).toContain('w-5');
  });

  it('renders with md size', () => {
    const { container } = render(<Spinner size="md" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner?.className).toContain('w-8');
  });

  it('renders with lg size', () => {
    const { container } = render(<Spinner size="lg" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner?.className).toContain('w-12');
  });
});
