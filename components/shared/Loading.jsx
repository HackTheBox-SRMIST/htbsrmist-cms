import React from 'react';
import { Center, Spinner } from '@chakra-ui/react';

const LoadingSpinner = () => {
  return (
    <Center className="h-screen">
      <Spinner size="xl" />
    </Center>
  );
};

export default LoadingSpinner;