import '@testing-library/jest-dom/vitest';

Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(URL, 'revokeObjectURL', {
  value: vi.fn(),
  writable: true,
});
