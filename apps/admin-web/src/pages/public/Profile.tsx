import { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, Button, Alert, Grid, TextField, Avatar, IconButton, CircularProgress } from '@mui/material';
import { Edit as EditIcon, CameraAlt as CameraIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { profilesApi } from '@services/profiles';
import type { UpdateProfileRequest } from '../../types/profile';
import { Loader } from '@components/ui';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  location: z.string().optional(),
  image: z.instanceof(File).optional(),
}).refine(
  (data) => !data.image || data.image.size <= 5 * 1024 * 1024,
  { message: 'Image must be less than 5MB', path: ['image'] }
);

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    name: string;
    description: string;
    website: string;
    location: string;
    imageUrl?: string;
    role: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!authLoading && user) {
      const fetchProfile = async () => {
        try {
          const response = await profilesApi.getByUsername(user.username);
          if (response.success && response.data) {
            const profileData = response.data;
            setProfile(profileData);
            setImagePreview(profileData.imageUrl || null);
            reset({
              name: profileData.name,
              description: profileData.description,
              website: profileData.website,
              location: profileData.location,
            });
          }
        } catch (err) {
          console.error('Failed to load profile:', err);
        }
      };
      fetchProfile();
    }
  }, [authLoading, user, reset]);

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

  const handleSubmitForm = async (data: ProfileFormData) => {
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      if (data.website) formData.append('website', data.website);
      if (data.location) formData.append('location', data.location);
      if (data.image) formData.append('image', data.image);

      // updateMe posts to /profiles/me; FormData payload is passed as-is to axios
      const response = await profilesApi.updateMe(formData as unknown as UpdateProfileRequest);

      if (response.data && response.data.success && response.data.data) {
        setProfile(response.data.data);
        setImagePreview(response.data.data.imageUrl || null);
        setSuccess('Profile updated successfully!');
        setEditMode(false);
      } else {
        throw new Error(response.data?.message || 'Failed to update profile');
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    if (profile) {
      reset({
        name: profile.name,
        description: profile.description,
        website: profile.website,
        location: profile.location,
      });
      setImagePreview(profile.imageUrl || null);
    }
    setEditMode(false);
    setError(null);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (authLoading) {
    return <Loader message="Loading profile..." fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontFamily='"Gambetta", serif' fontWeight={700} sx={{ mb: 1 }}>
            Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account information
          </Typography>
        </Box>
        <Button variant="text" onClick={handleBack}>
          Back
        </Button>
      </Box>

      {(error || success) && (
        <Alert severity={success ? 'success' : 'error'} sx={{ mb: 3 }} onClose={() => { setError(null); setSuccess(null); }}>
          {success || error}
        </Alert>
      )}

      {!editMode && profile && (
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={imagePreview || undefined}
                  alt={user.username}
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: '3rem',
                    fontWeight: 700,
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    mb: 2,
                  }}
                >
                  {profile.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid white',
                  }}
                >
                  <CameraIcon fontSize="small" />
                </Box>
              </Box>
              <Typography variant="h5" sx={{ mb: 0.5 }}>
                {profile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textTransform: 'capitalize' }}>
                {profile.role}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                @{user.username}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Profile Information</Typography>
                <Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditMode(true)}>
                  Edit Profile
                </Button>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Full Name</Typography>
                  <Typography variant="body1">{profile.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Role</Typography>
                  <Typography variant="body1" textTransform="capitalize">{profile.role}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Username</Typography>
                  <Typography variant="body1">@{user.username}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Website</Typography>
                  <Typography variant="body1">
                    {profile.website ? (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ color: '#3f51b5' }}>
                        {profile.website}
                      </a>
                    ) : (
                      <span style={{ color: '#999' }}>-</span>
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Location</Typography>
                  <Typography variant="body1">{profile.location || <span style={{ color: '#999' }}>-</span>}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{profile.description || <span style={{ color: '#999' }}>-</span>}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {editMode && (
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Edit Profile</Typography>
            <Button variant="text" onClick={handleCancel}>Cancel</Button>
          </Box>

          <form onSubmit={handleSubmit(handleSubmitForm)} noValidate>
            <Grid container spacing={3}>
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
                  placeholder="Tell us about yourself or your business..."
                  disabled={isSubmitting}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>Profile Image</Typography>
                <Box
                  component="label"
                  sx={{
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 3,
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
                      <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 1 }} />
                      <IconButton
                        size="small"
                        onClick={() => { setValue('image', undefined); setImagePreview(profile?.imageUrl || null); }}
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'error.main', color: 'white' }}
                        aria-label="Remove image"
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <>
                      <CameraIcon fontSize="large" color="disabled" sx={{ mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">
                        Click or drag to upload image (max 5MB)
                      </Typography>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </form>
        </Paper>
      )}
    </Container>
  );
};

export default ProfilePage;