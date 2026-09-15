import { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, Button, Alert, Grid, TextField, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import { VisibilityOff, Add as AddIcon, CloudUpload as UploadIcon, QrCode as QrCodeIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { productsApi } from '@services/products';
import { profilesApi } from '@services/profiles';
import { Loader } from '@components/ui';
import dayjs from 'dayjs';

const addProductSchema = z.object({
  serialNumber: z.string().min(1, 'Serial number is required'),
  name: z.string().min(1, 'Product name is required'),
  brand: z.string().min(1, 'Brand is required'),
  description: z.string().optional(),
  manufactureDate: z.string().min(1, 'Manufacture date is required'),
  manufacturerName: z.string().min(1, 'Manufacturer name is required'),
  manufacturerLocation: z.string().min(1, 'Manufacturer location is required'),
  image: z.instanceof(File).optional(),
}).refine(
  (data) => !data.image || data.image.size <= 5 * 1024 * 1024,
  { message: 'Image must be less than 5MB', path: ['image'] }
);

type AddProductFormData = z.infer<typeof addProductSchema>;

export const AddProductPage = () => {
  const navigate = useNavigate();
  const { user, isManufacturer, isLoading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<AddProductFormData>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      manufactureDate: dayjs().format('YYYY-MM-DD'),
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setValue('image', file, { shouldValidate: true });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (!authLoading && isManufacturer() && user) {
      const fetchProfile = async () => {
        try {
          const response = await profilesApi.getByUsername(user.username);
          if (response.success && response.data) {
            const profile = response.data;
            setValue('manufacturerName', profile.name);
            setValue('manufacturerLocation', profile.location);
          }
        } catch (err) {
          console.error('Failed to load profile:', err);
        }
      };
      fetchProfile();
    }
  }, [authLoading, user, isManufacturer, setValue]);

  const handleSubmitForm = async (data: AddProductFormData) => {
    setError(null);
    setSuccess(null);

    try {
      const response: any = await productsApi.create({
        ...data,
        description: data.description || '',
      });

      if (response.success && response.data) {
        // Generate QR code
        const qrResponse: any = await productsApi.generateQR(data.serialNumber);
        if (qrResponse.success && qrResponse.data) {
          setQrCodeData(qrResponse.data.qrCodeImageUrl);
        }
        setSuccess('Product created successfully! QR code generated below.');
      } else {
        throw new Error(response.message || 'Failed to create product');
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Failed to create product. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/manufacturer');
  };

  const handleDownloadQR = async () => {
    if (!qrCodeData) return;
    try {
      const response = await fetch(qrCodeData);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-${watch('serialNumber')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download QR:', err);
    }
  };

  if (authLoading) {
    return <Loader message="Loading..." fullScreen />;
  }

  if (!isManufacturer()) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontFamily='"Gambetta", serif' fontWeight={700} sx={{ mb: 1 }}>
            Add New Product
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Register a new product and generate its QR code
          </Typography>
        </Box>
        <Button variant="text" onClick={handleBack}>
          Back to Dashboard
        </Button>
      </Box>

      {(error || success) && (
        <Alert severity={success ? 'success' : 'error'} sx={{ mb: 3 }} onClose={() => { setError(null); setSuccess(null); }}>
          {success || error}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
            <form onSubmit={handleSubmit(handleSubmitForm)} noValidate>
              <Typography variant="h6" sx={{ mb: 3 }}>Product Information</Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    {...register('serialNumber')}
                    fullWidth
                    label="Serial Number"
                    margin="normal"
                    variant="outlined"
                    error={!!errors.serialNumber}
                    helperText={errors.serialNumber?.message}
                    disabled={isSubmitting}
                    placeholder="e.g., PRD-2024-001"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    {...register('name')}
                    fullWidth
                    label="Product Name"
                    margin="normal"
                    variant="outlined"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={isSubmitting}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    {...register('brand')}
                    fullWidth
                    label="Brand"
                    margin="normal"
                    variant="outlined"
                    error={!!errors.brand}
                    helperText={errors.brand?.message}
                    disabled={isSubmitting}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    {...register('manufactureDate')}
                    fullWidth
                    label="Manufacture Date"
                    type="date"
                    margin="normal"
                    variant="outlined"
                    error={!!errors.manufactureDate}
                    helperText={errors.manufactureDate?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">📅</InputAdornment>
                      ),
                    }}
                    disabled={isSubmitting}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    {...register('manufacturerName')}
                    fullWidth
                    label="Manufacturer Name"
                    margin="normal"
                    variant="outlined"
                    error={!!errors.manufacturerName}
                    helperText={errors.manufacturerName?.message}
                    disabled={isSubmitting}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    {...register('manufacturerLocation')}
                    fullWidth
                    label="Manufacturer Location"
                    margin="normal"
                    variant="outlined"
                    error={!!errors.manufacturerLocation}
                    helperText={errors.manufacturerLocation?.message}
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
                    placeholder="Product description, features, specifications..."
                    disabled={isSubmitting}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>Product Image</Typography>
                  <Box
                    component="label"
                    sx={{
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 4,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                      disabled={isSubmitting}
                    />
                    {imagePreview ? (
                      <Box sx={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                        <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 1 }} />
                        <IconButton
                          size="small"
                          onClick={() => { setValue('image', undefined); setImagePreview(null); }}
                          sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'error.main', color: 'white' }}
                          aria-label="Remove image"
                        >
                          <VisibilityOff fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <>
                        <UploadIcon fontSize="large" color="disabled" sx={{ mb: 1 }} />
                        <Typography variant="body1" color="text.secondary">
                          Click or drag to upload product image (max 5MB)
                        </Typography>
                      </>
                    )}
                  </Box>
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
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                >
                  {isSubmitting ? 'Registering...' : 'Register Product'}
                </Button>
              </Box>
            </form>
          </Paper>

          {qrCodeData && (
            <Paper elevation={2} sx={{ p: 4, borderRadius: 2, mt: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 3 }}>QR Code Generated</Typography>
              <Box
                sx={{
                  display: 'inline-block',
                  p: 2,
                  backgroundColor: 'white',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <img src={qrCodeData} alt="QR Code" style={{ width: 200, height: 200 }} />
              </Box>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button variant="contained" startIcon={<QrCodeIcon />} onClick={handleDownloadQR}>
                  Download QR Code
                </Button>
                <Button variant="outlined" onClick={() => navigate('/my-products')}>
                  View Products
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: 'fit-content', sticky: 'top', top: 100 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Tips</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#e3f2fd', color: '#1976d2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AddIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>Unique Serial Number</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use a unique identifier like PRD-2024-001. This cannot be changed later.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#e8f5e9', color: '#388e3c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <QrCodeIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>QR Code Generation</Typography>
                  <Typography variant="body2" color="text.secondary">
                    A QR code will be automatically generated after registration for product verification.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#fff3e0', color: '#f57c00', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <UploadIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>Product Image</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload a clear product image (max 5MB). This helps consumers identify the product.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AddProductPage;