import React from 'react';
import { Box, Skeleton } from '@mui/material';

const ChatSkeleton: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', px: 2 }}>
        <Box sx={{ maxWidth: 680, width: '100%', textAlign: 'center' }}>
          <Skeleton variant="text" width={180} height={32} sx={{ mx: 'auto', mb: 0.5 }} />
          <Skeleton variant="text" width={260} height={40} sx={{ mx: 'auto', mb: 1 }} />
          <Skeleton variant="text" width={300} height={24} sx={{ mx: 'auto', mb: 4 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, maxWidth: 480, mx: 'auto', mb: 4 }}>
            {[0, 1, 2, 3].map(i => (
              <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
          <Skeleton variant="rounded" height={80} sx={{ borderRadius: 3 }} />
        </Box>
      </Box>
    </Box>
  );
};

export default ChatSkeleton;
