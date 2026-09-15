import { Input as MuiInput, InputProps, InputAdornment, styled } from '@mui/material';
import { forwardRef } from 'react';

interface CustomInputProps extends InputProps {
  label?: string;
  error?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const StyledInput = styled(MuiInput)<CustomInputProps>(({ theme, error }) => ({
  '&:before': {
    borderBottom: error ? `2px solid ${theme.palette.error.main}` : `1px solid ${theme.palette.divider}`,
  },
  '&:after': {
    borderBottom: `2px solid ${theme.palette.primary.main}`,
  },
  '&:hover:not(.Mui-disabled):before': {
    borderBottom: `2px solid ${theme.palette.primary.main}`,
  },
  '&.Mui-focused:before': {
    borderBottom: `2px solid ${theme.palette.primary.main}`,
  },
  '&.Mui-error:before': {
    borderBottom: `2px solid ${theme.palette.error.main}`,
  },
}));

export const Input = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div style={{ width: '100%' }}>
        {label && (
          <label
            style={{
              display: 'block',
              marginBottom: 6,
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#333',
            }}
          >
            {label}
          </label>
        )}
        <StyledInput
          ref={ref}
          error={error}
          startAdornment={leftIcon ? <InputAdornment position="start">{leftIcon}</InputAdornment> : undefined}
          endAdornment={rightIcon ? <InputAdornment position="end">{rightIcon}</InputAdornment> : undefined}
          {...props}
        />
        {helperText && (
          <p
            style={{
              marginTop: 4,
              fontSize: '0.75rem',
              color: error ? '#d32f2f' : '#666',
            }}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;