import { Button as MuiButton, ButtonProps, styled } from '@mui/material';
import { forwardRef } from 'react';

interface CustomButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'text';
  fullWidth?: boolean;
  loading?: boolean;
}

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== 'variant' && prop !== 'loading',
})<CustomButtonProps>(({ theme, variant = 'primary', loading }) => {
  const variants: Record<string, any> = {
    primary: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
      '&:disabled': {
        backgroundColor: theme.palette.action.disabledBackground,
        color: theme.palette.action.disabled,
      },
    },
    secondary: {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.secondary.dark,
      },
      '&:disabled': {
        backgroundColor: theme.palette.action.disabledBackground,
        color: theme.palette.action.disabled,
      },
    },
    danger: {
      backgroundColor: theme.palette.error.main,
      color: theme.palette.error.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.error.dark,
      },
      '&:disabled': {
        backgroundColor: theme.palette.action.disabledBackground,
        color: theme.palette.action.disabled,
      },
    },
    outline: {
      border: `2px solid ${theme.palette.primary.main}`,
      color: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.light,
        border: `2px solid ${theme.palette.primary.dark}`,
      },
      '&:disabled': {
        border: `2px solid ${theme.palette.action.disabled}`,
        color: theme.palette.action.disabled,
      },
    },
    text: {
      color: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.light,
      },
      '&:disabled': {
        color: theme.palette.action.disabled,
      },
    },
  };

  return {
    ...variants[variant],
    textTransform: 'none',
    fontWeight: 600,
    borderRadius: theme.shape.borderRadius,
    padding: '10px 24px',
    fontSize: '1rem',
    opacity: loading ? 0.7 : 1,
    pointerEvents: loading ? 'none' : 'auto',
    transition: 'all 0.2s ease-in-out',
  };
});

export const Button = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ variant = 'primary', loading, children, disabled, startIcon, endIcon, ...props }, ref) => {
    const muiVariant = variant === 'text' ? 'text' : variant === 'outline' ? 'outlined' : 'contained';
    return (
      <StyledButton
        ref={ref}
        variant={muiVariant as any}
        disabled={disabled || loading}
        startIcon={loading ? null : startIcon}
        endIcon={loading ? null : endIcon}
        {...props}
      >
        {loading ? (
          <>
            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: 8 }}>⏳</span>
            Loading...
          </>
        ) : (
          children
        )}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;