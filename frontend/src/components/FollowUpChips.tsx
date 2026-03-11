import React from 'react';
import { Box, Chip, Fade } from '@mui/material';

interface FollowUpChipsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

const FollowUpChips: React.FC<FollowUpChipsProps> = ({ questions, onSelect }) => {
  if (questions.length === 0) return null;

  return (
    <Fade in timeout={400}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, ml: 1 }}>
        {questions.map((q, i) => (
          <Chip
            key={i}
            label={q}
            onClick={() => onSelect(q)}
            variant="outlined"
            sx={{ cursor: 'pointer', py: 2, px: 0.5, fontSize: '0.8rem' }}
          />
        ))}
      </Box>
    </Fade>
  );
};

export default FollowUpChips;
