import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorMessage } from '../../../../components/ui/ErrorMessage';

describe('ErrorMessage', () => {
  it('renders error message', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('does not render when message is null', () => {
    render(<ErrorMessage message={null} />);
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('calls onDismiss when close button is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<ErrorMessage message="Error" onDismiss={onDismiss} />);
    const closeBtn = screen.getByRole('button');
    await user.click(closeBtn);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
