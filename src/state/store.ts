import { Action, configureStore } from '@reduxjs/toolkit';
import app from '../App/App.slice';
import home from '../pages/Task/Home.slice';
import taskSlice from '../pages/Task/task.slice';
import mineSweeper from '../pages/MineSweeper/MineSweeper.slice';
import settings from '../pages/Settings/Settings.slice';
import register from '../pages/Register/Register.slice';
import editor from '../components/ArticleEditor/ArticleEditor.slice';
import articleViewer from '../components/ArticlesViewer/ArticlesViewer.slice';
import profile from '../pages/ProfilePage/ProfilePage.slice';
import articlePage from '../pages/ArticlePage/ArticlePage.slice';

const middlewareConfiguration = { serializableCheck: false };

export const store = configureStore({
  reducer: { app, home, mineSweeper, settings, register, editor, articleViewer, profile, articlePage, taskSlice },
  devTools: {
    name: 'Conduit',
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(middlewareConfiguration),
});
export type State = ReturnType<typeof store.getState>;

export function dispatchOnCall(action: Action) {
  return () => store.dispatch(action);
}
