import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AgencyStatusBadge from './AgencyStatusBadge.jsx';

describe('AgencyStatusBadge', () => {
  it('shows a high contrast active label in the agency header', () => {
    render(<AgencyStatusBadge active onDark />);
    expect(screen.getByRole('status', { name: 'Agencia activa' })).toHaveTextContent('Activa');
    expect(screen.getByRole('status')).toHaveClass('bg-white', 'text-[#1B5E20]');
  });

  it('identifies an inactive agency with a warning tone', () => {
    render(<AgencyStatusBadge active={false} />);
    expect(screen.getByRole('status', { name: 'Agencia inactiva' })).toHaveTextContent('Inactiva');
    expect(screen.getByRole('status')).toHaveClass('bg-amber-50', 'text-amber-900');
  });
});
