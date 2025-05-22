import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused';
  spend: string;
  impressions: string;
  clicks: string;
  conversions: string;
  ctr: string;
  cpc: string;
}

const campaigns: Campaign[] = [
  {
    id: '1',
    name: 'Summer Sale 2024',
    status: 'active',
    spend: '$1,234',
    impressions: '45.2K',
    clicks: '2.1K',
    conversions: '156',
    ctr: '4.6%',
    cpc: '$0.59',
  },
  {
    id: '2',
    name: 'Product Launch',
    status: 'active',
    spend: '$987',
    impressions: '32.1K',
    clicks: '1.5K',
    conversions: '98',
    ctr: '4.7%',
    cpc: '$0.66',
  },
  {
    id: '3',
    name: 'Brand Awareness',
    status: 'paused',
    spend: '$756',
    impressions: '28.4K',
    clicks: '1.2K',
    conversions: '45',
    ctr: '4.2%',
    cpc: '$0.63',
  },
];

const CampaignsTable: React.FC = () => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Campaign</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Spend</TableCell>
            <TableCell align="right">Impressions</TableCell>
            <TableCell align="right">Clicks</TableCell>
            <TableCell align="right">Conversions</TableCell>
            <TableCell align="right">CTR</TableCell>
            <TableCell align="right">CPC</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell component="th" scope="row">
                {campaign.name}
              </TableCell>
              <TableCell>
                <Chip
                  label={campaign.status}
                  color={campaign.status === 'active' ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell align="right">{campaign.spend}</TableCell>
              <TableCell align="right">{campaign.impressions}</TableCell>
              <TableCell align="right">{campaign.clicks}</TableCell>
              <TableCell align="right">{campaign.conversions}</TableCell>
              <TableCell align="right">{campaign.ctr}</TableCell>
              <TableCell align="right">{campaign.cpc}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CampaignsTable; 