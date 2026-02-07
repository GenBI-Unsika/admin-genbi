import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ConfirmDialog from './ConfirmDialog.jsx';

describe('ConfirmDialog', () => {
  beforeEach(() => {
    document.body.className = '';
  });

  afterEach(() => {
    cleanup();
    document.body.className = '';
  });

  it('renders when open and triggers callbacks', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(<ConfirmDialog isOpen title="Hapus data" description="Tindakan ini tidak dapat dibatalkan" confirmText="Hapus" cancelText="Batal" tone="danger" onConfirm={onConfirm} onCancel={onCancel} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Hapus data')).toBeInTheDocument();
    expect(screen.getByText('Tindakan ini tidak dapat dibatalkan')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Hapus' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('closes on escape and backdrop click', () => {
    const onCancel = vi.fn();

    const { rerender } = render(<ConfirmDialog isOpen={false} onCancel={onCancel} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(<ConfirmDialog isOpen onCancel={onCancel} />);
    const dialog = screen.getByRole('dialog');

    expect(document.body.classList.contains('overflow-hidden')).toBe(true);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);

    // backdrop click uses onMouseDown on the container
    fireEvent.mouseDown(dialog, { target: dialog, currentTarget: dialog });
    expect(onCancel).toHaveBeenCalledTimes(2);
  });
});
