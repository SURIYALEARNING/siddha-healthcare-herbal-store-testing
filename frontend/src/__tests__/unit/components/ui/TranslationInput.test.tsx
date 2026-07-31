import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TranslationInput from '../../../../components/ui/TranslationInput';

describe('TranslationInput', () => {
  it('shows English and Tamil inputs', () => {
    render(
      <TranslationInput
        label="Product Name"
        enValue=""
        taValue=""
        onEnChange={vi.fn()}
        onTaChange={vi.fn()}
      />,
    );
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('தமிழ்')).toBeInTheDocument();
  });

  it('calls onEnChange when English input changes', async () => {
    const user = userEvent.setup();
    const onEnChange = vi.fn();
    render(
      <TranslationInput
        label="Name"
        enValue=""
        taValue=""
        onEnChange={onEnChange}
        onTaChange={vi.fn()}
      />,
    );
    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'Hello');
    expect(onEnChange).toHaveBeenCalled();
  });

  it('calls onTaChange when Tamil input changes', async () => {
    const user = userEvent.setup();
    const onTaChange = vi.fn();
    render(
      <TranslationInput
        label="Name"
        enValue=""
        taValue=""
        onEnChange={vi.fn()}
        onTaChange={onTaChange}
      />,
    );
    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[1], 'வணக்கம்');
    expect(onTaChange).toHaveBeenCalled();
  });

  it('renders textarea when type is textarea', () => {
    render(
      <TranslationInput
        label="Description"
        enValue=""
        taValue=""
        onEnChange={vi.fn()}
        onTaChange={vi.fn()}
        type="textarea"
      />,
    );
    const textareas = screen.getAllByRole('textbox');
    expect(textareas.length).toBe(2);
  });
});
