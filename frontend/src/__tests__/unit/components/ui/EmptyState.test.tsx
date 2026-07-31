import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../../../../components/ui/EmptyState';

describe('EmptyState', () => {
  it('renders icon, title, and description', () => {
    render(<EmptyState icon="🔍" title="No results" description="Try a different search" />);
    expect(screen.getByText('🔍')).toBeInTheDocument();
    expect(screen.getByText('No results')).toBeInTheDocument();
    expect(screen.getByText('Try a different search')).toBeInTheDocument();
  });

  it('renders title with default icon when no icon provided', () => {
    render(<EmptyState title="Empty" />);
    expect(screen.getByText('📭')).toBeInTheDocument();
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    render(<EmptyState title="Empty" action={<button>Add Item</button>} />);
    expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
  });
});
