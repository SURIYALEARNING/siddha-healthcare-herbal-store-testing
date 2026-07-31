import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagInput from '../../../../components/ui/TagInput';

describe('TagInput', () => {
  it('adds tag on Enter key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInput label="Tags" items={[]} onItemsChange={onChange} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'herbal{Enter}');
    expect(onChange).toHaveBeenCalledWith(['herbal']);
  });

  it('does not add empty tag on Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInput label="Tags" items={[]} onItemsChange={onChange} />);
    const input = screen.getByRole('textbox');
    await user.type(input, '   {Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not add duplicate tag', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInput label="Tags" items={['herbal']} onItemsChange={onChange} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'herbal{Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('removes tag on X button click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInput label="Tags" items={['herbal', 'organic']} onItemsChange={onChange} />);
    const removeButtons = screen.getAllByRole('button');
    const xButton = removeButtons.find(b => b.querySelector('svg'))!;
    await user.click(xButton);
    expect(onChange).toHaveBeenCalledWith(['organic']);
  });
});
