import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from '../../../../components/ui/Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies hover effect class when hoverable prop is true', () => {
    render(<Card hover>Hoverable</Card>);
    const card = screen.getByText('Hoverable');
    expect(card.className).toContain('hover:shadow-md');
  });

  it('does not apply hover class when hoverable is false', () => {
    render(<Card>Not hoverable</Card>);
    const card = screen.getByText('Not hoverable');
    expect(card.className).not.toContain('hover:shadow-md');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Card onClick={onClick}>Clickable</Card>);
    await user.click(screen.getByText('Clickable'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
