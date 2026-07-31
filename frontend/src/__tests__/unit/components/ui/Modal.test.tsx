import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../../../../components/ui/Modal';

describe('Modal', () => {
  it('does not render when isOpen is false', () => {
    render(<Modal isOpen={false} onClose={vi.fn()}>Content</Modal>);
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(<Modal isOpen onClose={vi.fn()}>Content</Modal>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with title and children', () => {
    render(<Modal isOpen onClose={vi.fn()} title="My Title">Modal body</Modal>);
    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('Modal body')).toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(<Modal isOpen onClose={onClose}>Content</Modal>);
    const backdrop = container.firstChild?.firstChild as HTMLElement;
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders with sm size', () => {
    const { container } = render(<Modal isOpen onClose={vi.fn()} size="sm">Content</Modal>);
    const dialog = container.querySelector('.max-w-md');
    expect(dialog).toBeInTheDocument();
  });

  it('renders with md size', () => {
    const { container } = render(<Modal isOpen onClose={vi.fn()} size="md">Content</Modal>);
    const dialog = container.querySelector('.max-w-lg');
    expect(dialog).toBeInTheDocument();
  });

  it('renders with lg size', () => {
    const { container } = render(<Modal isOpen onClose={vi.fn()} size="lg">Content</Modal>);
    const dialog = container.querySelector('.max-w-2xl');
    expect(dialog).toBeInTheDocument();
  });

  it('renders with xl size', () => {
    const { container } = render(<Modal isOpen onClose={vi.fn()} size="xl">Content</Modal>);
    const dialog = container.querySelector('.max-w-4xl');
    expect(dialog).toBeInTheDocument();
  });
});
