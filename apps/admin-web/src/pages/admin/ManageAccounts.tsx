import { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, Button, Alert, IconButton, useTheme } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { usersApi } from '@services/users';
import { profilesApi } from '@services/profiles';
import { Loader } from '@components/ui';

interface UserWithProfile {
  id: string;
  username: string;
  role: string;
  name: string;
  description: string;
  website: string;
  location: string;
  imageUrl?: string;
  createdAt: string;
}

export const ManageAccountsPage = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [rows, setRows] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, profilesRes] = await Promise.all([
        usersApi.getAll(),
        profilesApi.getAll(),
      ]);

      // usersApi.getAll returns ApiResponse<PaginatedResponse<User>>
      // profilesApi.getAll returns ApiResponse<Profile[]>
      if (usersRes.success && usersRes.data?.items) {
        const users = usersRes.data.items;
        const profiles = profilesRes.success ? profilesRes.data || [] : [];

        // Merge user data with profile data
        const mergedData: UserWithProfile[] = users.map((user) => {
          const profile = profiles.find((p) => p.username === user.username);
          return {
            ...user,
            name: profile?.name || '',
            description: profile?.description || '',
            website: profile?.website || '',
            location: profile?.location || '',
            imageUrl: profile?.imageUrl,
          };
        });

        setRows(mergedData);
      }
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchUsers();
    }
  }, [authLoading]);

  const handleDelete = async () => {
    if (!userToDelete) return;

    setError(null);
    try {
      const response = await usersApi.delete(userToDelete);
      if (response.success) {
        fetchUsers();
      } else {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  if (authLoading) {
    return <Loader message="Loading..." fullScreen />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  const theme = useTheme();

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'username', headerName: 'Username', width: 150 },
    { field: 'name', headerName: 'Name', width: 180 },
    {
      field: 'role',
      headerName: 'Role',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'capitalize',
            backgroundColor: theme.palette[params.value as 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error']?.light || theme.palette.primary.light,
            color: theme.palette[params.value as 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error']?.main || theme.palette.primary.main,
            width: 'fit-content',
          }}
        >
          {params.value}
        </Box>
      ),
    },
    { field: 'location', headerName: 'Location', width: 180 },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 180,
      valueFormatter: (params: { value: string | number | Date }) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            aria-label="Edit"
            onClick={() => navigate(`/edit-account/${params.row.id}`)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Delete"
            color="error"
            onClick={() => {
              setUserToDelete(params.row.id);
              setDeleteDialogOpen(true);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontFamily='"Gambetta", serif' fontWeight={700} sx={{ mb: 1 }}>
            Manage Accounts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage all user accounts in the system
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => navigate('/add-account')}
        >
          Add Account
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Loader message="Loading accounts..." fullScreen />
      ) : (
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            paginationModel={{ page: 0, pageSize: 10 }}
            checkboxSelection
            disableRowSelectionOnClick
            autoHeight
            sx={{ minWidth: 750 }}
          />
        </Paper>
      )}

      {deleteDialogOpen && (
        <Box
          role="alertdialog"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
          onClick={() => { setDeleteDialogOpen(false); setUserToDelete(null); }}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
          }}
        >
          <Paper
            onClick={(e) => e.stopPropagation()}
            sx={{ p: 3, maxWidth: 400, width: '100%', mx: 2, borderRadius: 2 }}
          >
            <Typography id="delete-dialog-title" variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Delete Account
            </Typography>
            <Typography id="delete-dialog-description" variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Are you sure you want to delete this account? This action cannot be undone.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" onClick={() => { setDeleteDialogOpen(false); setUserToDelete(null); }}>
                Cancel
              </Button>
              <Button variant="contained" color="error" onClick={handleDelete}>
                Delete
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default ManageAccountsPage;