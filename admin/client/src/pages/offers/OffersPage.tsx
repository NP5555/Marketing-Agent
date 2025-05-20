import { useState, useEffect } from 'react';
import { 
  Typography, Box, Button, CircularProgress,
  Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, Tooltip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { supabase, Offer } from '../../utils/supabaseClient';

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch offers on component mount
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        // This would fetch the real offers from the API
        // For now, just using mock data
        setOffers([
          {
            id: '1',
            title: 'Summer Discount',
            description: 'Get 20% off on all products this summer',
            reward_amount: 20,
            expiry_date: '2023-09-30T00:00:00.000Z',
            is_active: true,
            created_at: '2023-06-01T00:00:00.000Z'
          },
          {
            id: '2',
            title: 'Referral Bonus',
            description: 'Get $10 for each friend you refer',
            reward_amount: 10,
            expiry_date: '2023-12-31T00:00:00.000Z',
            is_active: true,
            created_at: '2023-05-15T00:00:00.000Z'
          },
          {
            id: '3',
            title: 'Holiday Sale',
            description: 'Special discounts for the holiday season',
            reward_amount: 15,
            expiry_date: '2023-01-15T00:00:00.000Z',
            is_active: false,
            created_at: '2022-12-01T00:00:00.000Z'
          }
        ]);
      } catch (err) {
        setError('Failed to fetch offers');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const handleAddOffer = () => {
    // This would open a modal or navigate to an add offer page
    console.log('Add offer clicked');
  };

  const handleEditOffer = (id: string) => {
    // This would open a modal or navigate to an edit offer page
    console.log('Edit offer clicked', id);
  };

  const handleDeleteOffer = (id: string) => {
    // This would open a confirmation dialog
    console.log('Delete offer clicked', id);
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    // This would update the offer status
    console.log('Toggle status clicked', id, currentStatus);
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
          Promotional Offers
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddOffer}
        >
          Add Offer
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Reward Amount</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {offers.map((offer) => (
              <TableRow key={offer.id}>
                <TableCell>{offer.title}</TableCell>
                <TableCell>{offer.description}</TableCell>
                <TableCell align="right">${offer.reward_amount}</TableCell>
                <TableCell>
                  {new Date(offer.expiry_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={offer.is_active ? 'Active' : 'Inactive'}
                    color={offer.is_active ? 'success' : 'default'}
                    onClick={() => handleToggleStatus(offer.id, offer.is_active)}
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEditOffer(offer.id)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDeleteOffer(offer.id)}>
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