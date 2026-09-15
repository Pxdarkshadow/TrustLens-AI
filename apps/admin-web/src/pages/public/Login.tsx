import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Alert, CircularProgress,
  FormControlLabel, Checkbox, InputAdornment, IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Verified, QrCode2, AccountBalance, ChevronLeft } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@hooks/useAuth';
import { Loader } from '@components/ui';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const trustPoints = [
  { icon: <Verified sx={{ fontSize: 28 }} />, text: 'Chain-backed provenance for every product' },
  { icon: <QrCode2 sx={{ fontSize: 28 }} />, text: 'Scan a QR code to verify authenticity' },
  { icon: <AccountBalance sx={{ fontSize: 28 }} />, text: 'Accountable manufacturer → retailer chain' },
];

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error: authError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const handleLogin = async (data: LoginFormData) => {
    setLocalError(null);
    try {
      await login({ username: data.username, password: data.password });
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      setLocalError(apiError.response?.data?.message || 'Login failed. Try again.');
    }
  };

  useEffect(() => {
    if (errors.username || errors.password) setLocalError(null);
  }, [errors]);

  if (isLoading && !isSubmitting) {
    return <Loader message="Initializing..." fullScreen />;
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Brand panel — the verification herald */}
      <Box
        component="section"
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          width: { md: '46%', lg: '50%' },
          background: 'linear-gradient(160deg, #0e2e61 0%, #14408c 55%, #1c5a96 100%)',
          color: '#ffffff',
          p: { md: 7, lg: 9 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
          <Verified sx={{ fontSize: 34 }} />
          <Typography variant="h5" fontFamily='"Gambetta", Georgia, serif' fontWeight={700}>
            TrustLens AI
          </Typography>
        </Box>

        <Typography
          variant="h2"
          fontFamily='"Gambetta", Georgia, serif'
          fontWeight={700}
          sx={{ mb: 3, lineHeight: 1.15 }}
        >
          Verify what you hold.
        </Typography>

        <Typography variant="body1" color="#d8e4f2" sx={{ maxWidth: 520, mb: 4 }}>
          Track and authenticate products from the manufacturer to the shelf — and let your
          customers prove it with a scan.
        </Typography>

        <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {trustPoints.map((p) => (
            <Box key={p.text} component="li" sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ color: '#ffd98a' }}>{p.icon}</Box>
              <Typography variant="body1">{p.text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Form panel */}
      <Box
        component="section"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          py: 5,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 440, px: { xs: 3, sm: 4 } }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontFamily='"Gambetta", Georgia, serif' fontWeight={700} color="#0b1117" sx={{ mb: 1 }}>
              Sign in
            </Typography>
            <Typography variant="body1" color="#25303c">
              Access the verification portal with your role account.
            </Typography>
          </Box>

          {(localError || authError) && (
            <Alert severity="error" sx={{ mb: 3 }} role="alert">
              {localError || authError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(handleLogin)} noValidate>
            <TextField
              {...register('username')}
              fullWidth label="Username" type="text" autoFocus margin="normal"
              variant="outlined" error={!!errors.username} helperText={errors.username?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><span aria-hidden style={{ color: '#44586b', fontWeight: 700 }}>@</span></InputAdornment>
                ),
              }}
            />
            <TextField
              {...register('password')}
              fullWidth label="Password" type={showPassword ? 'text' : 'password'} margin="normal"
              variant="outlined" error={!!errors.password} helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)} edge="end"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControlLabel
              control={<Checkbox {...register('rememberMe')} color="primary" />}
              label={<Typography variant="body2">Remember me</Typography>}
              sx={{ mb: 1, display: 'block' }}
            />

            <Button
              type="submit" fullWidth variant="contained" size="large"
              disabled={isSubmitting || isLoading}
              sx={{ mb: 1, py: 1.4 }}
            >
              {isSubmitting ? (<><CircularProgress size={20} color="inherit" sx={{ mr: 1 }} /> Signing in…</>) : ('Sign in')}
            </Button>
          </form>

          <Typography variant="body2" color="#25303c" sx={{ mt: 3 }}>
            Demo accounts — password equals username:{' '}
            <Box component="span" sx={{ fontWeight: 600 }}>admin, manu, supp, retailer</Box>
          </Typography>

          <Button variant="text" startIcon={<ChevronLeft />} onClick={() => navigate('/')} sx={{ mt: 2 }}>
            Back to home
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;