import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Test from '../pages/Test';
import UseEffectDemo from '../pages/UseEffectDemo';
import NotFound from '../pages/NotFound';

const router = createBrowserRouter([
  // regex
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/test/:id',
    element: <Test />,
  },
  {
    path: '/useeffect-demo',
    element: <UseEffectDemo />,
  },

  {
    path: '/*',
    element: <NotFound />,
  }
]);

export default router;
