import { Card as MuiCard, CardProps, CardContent, CardActions, CardMedia, styled } from '@mui/material';
import { ReactNode } from 'react';

interface CustomCardProps extends Omit<CardProps, 'variant'> {
  variant?: 'default' | 'outlined' | 'elevated';
  hoverable?: boolean;
}

const StyledCard = styled(MuiCard)<CustomCardProps>(({ theme, variant = 'default', hoverable }) => {
  const variants: Record<string, any> = {
    default: {
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: 'none',
    },
    outlined: {
      boxShadow: 'none',
      border: `1px solid ${theme.palette.divider}`,
    },
    elevated: {
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      border: 'none',
    },
  };

  return {
    ...variants[variant],
    borderRadius: theme.shape.borderRadius * 1.5,
    transition: hoverable ? 'all 0.2s ease-in-out' : 'none',
    '&:hover': hoverable
      ? {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        }
      : {},
  };
});

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  avatar?: ReactNode;
}

export const CardHeader = ({ title, subtitle, action, avatar }: CardHeaderProps) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '24px 24px 16px',
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {avatar && (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#e3eefc',
            }}
          >
            {avatar}
          </div>
        )}
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, fontFamily: '"Gambetta", serif' }}>
            {title}
          </h3>
          {subtitle && (
            <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#666' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export const Card = ({ variant, hoverable, children, ...props }: CustomCardProps) => {
  return <StyledCard variant={variant as any} hoverable={hoverable} {...props}>{children}</StyledCard>;
};

export { CardContent, CardActions, CardMedia };

export default Card;