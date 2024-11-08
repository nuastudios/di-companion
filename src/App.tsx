import { Fragment } from 'react';
import { BrowserRouter } from 'react-router-dom';

import CssBaseline from '@mui/material/CssBaseline';

import { withErrorHandler } from '@/error-handling';
import AppErrorBoundaryFallback from '@/error-handling/fallbacks/App';
import Pages from '@/routes/Pages';
import Notifications from '@/sections/Notifications';
import SW from '@/sections/SW';
import Menu from '@/sections/Menu';

function App() {
  return (
    <Fragment>
      <CssBaseline />
      <Notifications />
      <SW />
      <BrowserRouter>
        <Pages />
        <Menu />
      </BrowserRouter>
    </Fragment>
  );
}

export default withErrorHandler(App, AppErrorBoundaryFallback);
