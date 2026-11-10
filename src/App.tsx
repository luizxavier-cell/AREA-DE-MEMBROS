import { Title } from '@solidjs/meta';
import { Loading } from 'solid-js';

import { PageLoader } from './components/page-loader';
import { platform } from './lib/config';
import { Router } from './router';
import './app.css';

export default function App() {
  return (
    <Router>
      {(props) => (
        <>
          <Title>{platform.name}</Title>
          <Loading fallback={<PageLoader />}>{props.children}</Loading>
        </>
      )}
    </Router>
  );
}
