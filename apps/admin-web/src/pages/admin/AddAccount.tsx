import { useState } from 'react';
import { Box, Container, Paper, Typography, Button, Alert, TextField, FormControl, InputLabel, Select, MenuItem, Grid, FormHelperText, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@hooks/useAuth';
import { useNavigate, Navigate } from 'react-router-dom';
import { usersApi } from '@services/users';
import { profilesApi } from '@services/profiles';
import { Loader } from '@components/ui';

const addAccountSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['admin', 'manufacturer', 'supplier', 'retailer']),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  location: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type AddAccountFormData = z.infer<typeof addAccountSchema>;

export const AddAccountPage = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddAccountFormData>({
    resolver: zodResolver(addAccountSchema),
  });

  const handleSubmitForm = async (data: AddAccountFormData) => {
    setError(null);
    setSuccess(null);

    try {
      // Create user account
      const userResponse: any = await usersApi.create({
        username: data.username,
        password: data.password,
        role: data.role,
      });

      if (!userResponse.data?.success) {
        throw new Error(userResponse.data?.message || 'Failed to create user');
      }

      // Create profile
      const profileResponse: any = await profilesApi.create({
        username: data.username,
        name: data.name,
        description: data.description || '',
        website: data.website || '',
        location: data.location || '',
        role: data.role,
        image: undefined,
      });

      if (!profileResponse.data?.success) {
        // If profile creation fails, we should ideally rollback user creation
        // For now, just warn
        console.warn('Profile creation failed:', profileResponse.data?.message);
      }

      setSuccess('Account created successfully!');
      reset();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Failed to create account. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/admin');
  };

  if (authLoading) {
    return <Loader message="Loading..." fullScreen />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontFamily='"Gambetta", serif' fontWeight={700} sx={{ mb: 1 }}>
            Add New Account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create a new user account with role and profile information
          </Typography>
        </Box>
        <Button variant="text" startIcon={<PersonAdd />} onClick={handleBack}>
          Back to Dashboard
        </Button>
      </Box>

      {(error || success) && (
        <Alert severity={success ? 'success' : 'error'} sx={{ mb: 3 }} onClose={() => { setError(null); setSuccess(null); }}>
          {success || error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        <form onSubmit={handleSubmit(handleSubmitForm)} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('username')}
                fullWidth
                label="Username"
                margin="normal"
                variant="outlined"
                error={!!errors.username}
                helperText={errors.username?.message}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.role} margin="normal" variant="outlined">
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  {...register('role')}
                  labelId="role-label"
                  label="Role"
                  error={!!errors.role}
                >
                  <MenuItem value="manufacturer">Manufacturer</MenuItem>
                  <MenuItem value="supplier">Supplier</MenuItem>
                  <MenuItem value="retailer">Retailer</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
                {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                {...register('password')}
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                margin="normal"
                variant="outlined"
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                {...register('confirmPassword')}
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                margin="normal"
                variant="outlined"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        aria-label="Toggle password visibility"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, pt: 1 }}>Profile Information</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                {...register('name')}
                fullWidth
                label="Full Name"
                margin="normal"
                variant="outlined"
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                {...register('website')}
                fullWidth
                label="Website (optional)"
                type="url"
                placeholder="https://example.com"
                margin="normal"
                variant="outlined"
                error={!!errors.website}
                helperText={errors.website?.message}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                {...register('location')}
                fullWidth
                label="Location (optional)"
                placeholder="City, Country"
                margin="normal"
                variant="outlined"
                disabled={isSubmitting}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                {...register('description')}
                fullWidth
                label="Description (optional)"
                multiline
                rows={3}
                margin="normal"
                variant="outlined"
                placeholder="Brief description of the account..."
                disabled={isSubmitting}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={handleBack} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <PersonAdd />}
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default AddAccountPage;