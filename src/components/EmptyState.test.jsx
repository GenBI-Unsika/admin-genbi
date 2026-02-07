import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from './EmptyState.jsx';

describe('EmptyState', () => {
  it('renders title, description and action', () => {
    render(<EmptyState icon="search" title="Tidak ada data" description="Coba ubah filter pencarian" action={<button type="button">Refresh</button>} />);

    expect(screen.getByText('Tidak ada data')).toBeInTheDocument();
    expect(screen.getByText('Coba ubah filter pencarian')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });
});
