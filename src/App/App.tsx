import axios from 'axios';
import { Fragment } from 'react';
import { BrowserRouter, Redirect, Route, RouteProps, Switch } from 'react-router-dom';
import { getUser } from '../services/conduit';
import { store } from '../state/store';
import { useStoreWithInitializer } from '../state/storeHooks';
import { EditArticle } from '../pages/EditArticle/EditArticle';
import { Footer } from '../components/Footer/Footer';
import { Header } from '../components/Header/Header';
import { Home } from '../pages/Home/Home';
import { MineSweeperGame } from '../pages/MineSweeper/MineSweeper';

import { NewArticle } from '../pages/NewArticle/NewArticle';
import { Register } from '../pages/Register/Register';
import { Settings } from '../pages/Settings/Settings';
import { endLoad, loadUser } from './App.slice';
import { ProfilePage } from '../pages/ProfilePage/ProfilePage';
import { ArticlePage } from '../pages/ArticlePage/ArticlePage';

export function App() {
  const { loading, user } = useStoreWithInitializer(({ app }) => app, load);

  const userIsLogged = user.isSome();

  return (
    <BrowserRouter>
      {!loading && (
        <Fragment>
          {/* <Header /> */}
          <Switch>
            <GuestOnlyRoute exact path='/register' userIsLogged={userIsLogged}>
              <Register />
            </GuestOnlyRoute>
            <UserOnlyRoute exact path='/settings' userIsLogged={userIsLogged}>
              <Settings />
            </UserOnlyRoute>
            <UserOnlyRoute exact path='/editor' userIsLogged={userIsLogged}>
              <NewArticle />
            </UserOnlyRoute>
            <UserOnlyRoute exact path='/editor/:slug' userIsLogged={userIsLogged}>
              <EditArticle />
            </UserOnlyRoute>
            <Route path='/profile/:username'>
              <ProfilePage />
            </Route>
            <Route path='/mine-sweeper'>
              <MineSweeperGame />
            </Route>
            <Route exact path='/'>
              <Home />
            </Route>
            <Route path='*'>
              <Redirect to='/' />
            </Route>
          </Switch>
        </Fragment>
      )}
    </BrowserRouter>
  );
}

async function load() {
  const token = localStorage.getItem('token');
  if (!store.getState().app.loading || !token) {
    store.dispatch(endLoad());
    return;
  }
  axios.defaults.headers.Authorization = `Token ${token}`;

  try {
    store.dispatch(loadUser(await getUser()));
  } catch {
    store.dispatch(endLoad());
  }
}

/* istanbul ignore next */
function GuestOnlyRoute({
  children,
  userIsLogged,
  ...rest
}: { children: JSX.Element | JSX.Element[]; userIsLogged: boolean } & RouteProps) {
  return (
    <Route {...rest}>
      {children}
      {userIsLogged && <Redirect to='/' />}
    </Route>
  );
}

/* istanbul ignore next */
function UserOnlyRoute({
  children,
  userIsLogged,
  ...rest
}: { children: JSX.Element | JSX.Element[]; userIsLogged: boolean } & RouteProps) {
  return (
    <Route {...rest}>
      {children}
      {!userIsLogged && <Redirect to='/' />}
    </Route>
  );
}
