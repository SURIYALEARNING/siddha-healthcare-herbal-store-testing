import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionTitle } from '../../../../components/ui/SectionTitle';

describe('SectionTitle', () => {
  it('renders title and subtitle', () => {
    render(<SectionTitle title="Products" subtitle="Browse our collection" />);
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Browse our collection')).toBeInTheDocument();
  });

  it('renders only title when no subtitle', () => {
    render(<SectionTitle title="Products" />);
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.queryByText('Browse our collection')).not.toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    render(<SectionTitle title="Products" action={<button>View All</button>} />);
    expect(screen.getByRole('button', { name: /view all/i })).toBeInTheDocument();
  });
});
