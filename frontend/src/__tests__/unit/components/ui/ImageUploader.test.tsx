import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageUploader from '../../../../components/ui/ImageUploader';

beforeEach(() => {
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
});

describe('ImageUploader', () => {
  it('shows upload area when no images', () => {
    render(<ImageUploader images={[]} onImagesChange={vi.fn()} />);
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText(/Images \(0\/5\)/)).toBeInTheDocument();
  });

  it('shows preview grid with images', () => {
    const { container } = render(<ImageUploader images={['https://example.com/img.jpg']} onImagesChange={vi.fn()} />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).toHaveAttribute('src', 'https://example.com/img.jpg');
  });

  it('calls onImagesChange when adding files', async () => {
    const onImagesChange = vi.fn();
    const { container } = render(<ImageUploader images={[]} onImagesChange={onImagesChange} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    await userEvent.upload(input!, file);
    expect(onImagesChange).toHaveBeenCalledWith(['blob:mock-url']);
  });

  it('calls onImagesChange when removing an image', async () => {
    const user = userEvent.setup();
    const onImagesChange = vi.fn();
    const { container } = render(<ImageUploader images={['https://example.com/img.jpg']} onImagesChange={onImagesChange} />);
    const removeBtn = container.querySelector('.group button') as HTMLButtonElement;
    await user.click(removeBtn);
    expect(onImagesChange).toHaveBeenCalledWith([]);
  });

  it('respects maxImages limit', () => {
    render(<ImageUploader images={['a', 'b', 'c', 'd', 'e']} onImagesChange={vi.fn()} maxImages={5} />);
    expect(screen.queryByText('Upload')).not.toBeInTheDocument();
  });
});
