import { Title } from '@solidjs/meta';
import { Loading, type ParentProps } from 'solid-js';

import { PageLoader } from './components/page-loader';
import { platform } from './lib/config';
import { Router } from './router';
import './app.css';

/** What wraps every route: default title and the first-load boundary. */
export function AppLayout(props: ParentProps) {
  return (
    <>
      <Title>{platform.name}</Title>
      <Loading fallback={<PageLoader />}>{props.children}</Loading>
    </>
  );
}

export default function App() {
  return <Router>{(props) => <AppLayout>{props.children}</AppLayout>}</Router>;
}
