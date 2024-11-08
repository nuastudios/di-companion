import React, { useEffect } from 'react';
import { Button, CircularProgress, Typography, Box } from '@mui/material';
import useNextPattern from '@/hooks/useNextPattern';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import PatternCard from '@/components/PatternCard';
import Header from '@/sections/Header';

const Explore: React.FC = () => {
  const { getNextPattern, pattern, loading, error } = useNextPattern();

  useEffect(() => {
    getNextPattern();
  }, [getNextPattern]);

  if (loading || !pattern) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          p: 4,
        }}
      >
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          Error loading patterns
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Box>
    );
  }

  const handleNext = () => {};

  return (
    <>
      <Header title="Explore" />
      <FullSizeCenteredFlexBox>
        <PatternCard pattern={pattern} onNext={handleNext} />
      </FullSizeCenteredFlexBox>
    </>
  );
};

export default Explore;
