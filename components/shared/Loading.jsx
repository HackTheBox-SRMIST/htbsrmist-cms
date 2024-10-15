import React from 'react';
import { Center, Spinner } from '@chakra-ui/react';

const LoadingSpinner = () => {
  return (
    <Center className="h-screen bg-light-background-darker dark:bg-dark-background-darker dark:text-dark-accent text-light-color">
      <Spinner size="xl" />
    </Center>
  );
};

export default LoadingSpinner;