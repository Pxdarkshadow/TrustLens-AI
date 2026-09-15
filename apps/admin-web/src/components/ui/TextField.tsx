import { TextField as MuiTextField, TextFieldProps, InputAdornment, InputLabel, FormControl, styled } from '@mui/material';
import { forwardRef } from 'react';

interface CustomTextFieldProps extends Omit<TextFieldProps, 'variant' | 'size' | 'fullWidth' | 'InputProps' | 'inputProps' | 'label' | 'error' | 'helperText'> {
  label: string;
  error?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  fullWidth?: boolean;
}

const StyledFormControl = styled(FormControl)(() => ({
  width: '100%',
}));

export const TextField = forwardRef<HTMLInputElement, CustomTextFieldProps>(
  ({ label, error, helperText, leftIcon, rightIcon, variant = 'outlined', size = 'medium', fullWidth = true, ...props }, ref) => {
    return (
      <StyledFormControl fullWidth={fullWidth} error={error} variant={variant} size={size}>
        <InputLabel shrink={true}>{label}</InputLabel>
        <MuiTextField
          ref={ref}
          label={label}
          error={error}
          helperText={helperText}
          variant={variant}
          size={size}
          fullWidth={fullWidth}
          InputProps={{
            startAdornment: leftIcon ? (
              <InputAdornment position="start">{leftIcon}</InputAdornment>
            ) : undefined,
            endAdornment: rightIcon ? (
              <InputAdornment position="end">{rightIcon}</InputAdornment>
            ) : undefined,
          }}
          inputProps={{
            'aria-invalid': error,
          }}
          {...props}
        />
      </StyledFormControl>
    );
  }
);

TextField.displayName = 'TextField';

export default TextField;