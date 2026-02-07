import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import GlobalSearch from './GlobalSearch.jsx';

describe('GlobalSearch', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows results after typing and navigates on click', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GlobalSearch />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText('Telusuri...');
    await user.type(input, 'beasiswa');

    expect(await screen.findByText('Artikel tentang beasiswa', {}, { timeout: 3000 })).toBeInTheDocument();

    await user.click(screen.getByText('Artikel tentang beasiswa'));
    expect(mockNavigate).toHaveBeenCalledWith('/artikel');
  });

  it('filters results by category', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GlobalSearch />
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText('Telusuri...');
    await user.click(input);

    await user.click(screen.getByRole('button', { name: 'Aktivitas' }));
    await user.type(input, 'rapat');

    expect(await screen.findByText('Event rapat', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.queryByText('Artikel tentang rapat')).not.toBeInTheDocument();
  });
});
