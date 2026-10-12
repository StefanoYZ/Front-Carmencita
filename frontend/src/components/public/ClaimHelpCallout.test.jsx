import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ClaimHelpCallout from './ClaimHelpCallout.jsx';

describe('ClaimHelpCallout', () => {
  it('destaca el canal de reclamos y dirige al formulario público', () => {
    render(<MemoryRouter><ClaimHelpCallout /></MemoryRouter>);
    const link = screen.getByRole('link', { name: /Registrar un reclamo/ });
    expect(link).toHaveAttribute('href', '/reclamos');
    expect(screen.getByText(/daño, retraso, pérdida/i)).toBeInTheDocument();
  });
});
