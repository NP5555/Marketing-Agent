import { useState, useEffect } from 'react';
import { 
  Typography, Box, Button, CircularProgress,
  Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Tooltip, Stack
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon
} from '@mui/icons-material';
import { supabase, ReferralLink } from '../../utils/supabaseClient';

export default function LinksPage() {
  const [links, setLinks] = useState<ReferralLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch links on component mount
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        // This would fetch the real links from the API
        // For now, just using mock data
        setLinks([
          {
            code: 'abc12345',
            creator_id: '123',
            click_count: 45,
            created_at: '2023-06-01T00:00:00.000Z'
          },
          {
            code: 'xyz67890',
            creator_id: '123',
            click_count: 120,
            created_at: '2023-05-15T00:00:00.000Z'
          },
          {
            code: 'qrs45678',
            creator_id: '456',
            click_count: 85,
            created_at: '2023-07-10T00:00:00.000Z'
          }
        ]);
      } catch (err) {
        setError('Failed to fetch referral links');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  const handleAddLink = () => {
    // This would open a modal to create a new link
    console.log('Add link clicked');
  };

  const handleDeleteLink = (code: string) => {
    // This would open a confirmation dialog
    console.log('Delete link clicked', code);
  };

  const handleExportLinks = () => {
    // This would export links to CSV
    console.log('Export links clicked');
  };

  const handleImportLinks = () => {
    // This would open a file upload dialog
    console.log('Import links clicked');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ pt: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Referral Links
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            startIcon={<ExportIcon />}
            onClick={handleExportLinks}
          >
            Export CSV
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<ImportIcon />}
            onClick={handleImportLinks}
          >
            Import CSV
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddLink}
          >
            Create Link
          </Button>
        </Stack>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Full URL</TableCell>
              <TableCell align="right">Clicks</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {links.map((link) => (
              <TableRow key={link.code}>
                <TableCell>{link.code}</TableCell>
                <TableCell>
                  <Box component="span" sx={{ fontFamily: 'monospace' }}>
                    {`https://example.com/r/${link.code}`}
                  </Box>
                </TableCell>
                <TableCell align="right">{link.click_count}</TableCell>
                <TableCell>
                  {new Date(link.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDeleteLink(link.code)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 