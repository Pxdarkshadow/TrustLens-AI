import { Suspense } from 'react';
import { AppRoutes } from './routes';
import { Loader } from '@components/ui';

const App = () => {
  return (
    <Suspense fallback={<Loader message="Loading application..." fullScreen />}>
      <AppRoutes />
    </Suspense>
  );
};

export default App;