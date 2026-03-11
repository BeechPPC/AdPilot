import React from 'react';
import { Box, Skeleton } from '@mui/material';

const SettingsSkeleton: React.FC = () => {
  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
      gap: 2,
      flex: 1,
      alignContent: 'start',
    }}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <Skeleton key={i} variant="rounded" height={140} sx={{ borderRadius: 2.5 }} />
      ))}
    </Box>
  );
};

export default SettingsSkeleton;
