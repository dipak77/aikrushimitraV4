import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

describe('Button Component', () => {
  it('renders children correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click Me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders loading spinner when isLoading is true', () => {
    render(<Button isLoading>Click Me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
  });
});

describe('Card Component', () => {
  it('renders children and classes correctly', () => {
    render(<Card className="test-card">Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toHaveClass('test-card');
  });
});

describe('Badge Component', () => {
  it('renders text content correctly', () => {
    render(<Badge variant="success">Kharif</Badge>);
    expect(screen.getByText('Kharif')).toBeInTheDocument();
    expect(screen.getByText('Kharif')).toHaveClass('text-emerald-400');
  });
});
