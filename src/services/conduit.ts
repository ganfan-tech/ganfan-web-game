import { Err, Ok, Result } from '@hqoss/monads';
import axios from 'axios';
import { array, object, string } from 'decoders';
import settings from '../config/settings';
import { CreateTask } from '../pages/Task/components/CreateTask';
import {
  Article,
  articleDecoder,
  ArticleForEditor,
  ArticlesFilters,
  FeedFilters,
  MultipleArticles,
  multipleArticlesDecoder,
} from '../types/article';
import { Comment, commentDecoder } from '../types/comment';
import { GenericErrors, genericErrorsDecoder } from '../types/error';
import { objectToQueryString } from '../types/object';
import { Profile, profileDecoder } from '../types/profile';
import { MultipleTasks, multipleTasksDecoder, Task, taskDecoder, TasksFilters } from '../types/task';
import { User, userDecoder, UserForRegistration, UserSettings } from '../types/user';

// axios.defaults.baseURL = settings.baseApiUrl;

export async function getArticles(filters: ArticlesFilters = {}): Promise<MultipleArticles> {
  const finalFilters: ArticlesFilters = {
    limit: 10,
    offset: 0,
    ...filters,
  };
  return multipleArticlesDecoder.verify((await axios.get(`articles?${objectToQueryString(finalFilters)}`)).data);
}

async function getTasks(filters: TasksFilters = {}): Promise<MultipleTasks> {
  const finalFilters: TasksFilters = {
    page_size: 1000,
    page: 1,
    ...filters,
  };
  // http://do.ganfan.tech/api
  return multipleTasksDecoder.verify((await axios.get(`/api/do/task/?${objectToQueryString(finalFilters)}`)).data);
}

// async function getTaskDetai(filters: TasksFilters = {}): Promise<MultipleTasks> {
//   const finalFilters: TasksFilters = {
//     page_size: 1000,
//     page: 1,
//     ...filters,
//   };
//   // http://do.ganfan.tech/api
//   return multipleTasksDecoder.verify((await axios.get(`/api/do/task/?${objectToQueryString(finalFilters)}`)).data);
// }

async function createTask(title: string): Promise<Result<Task, GenericErrors>> {
  try {
    const { data } = await axios.post('/api/do/task/', { title });

    return Ok(taskDecoder.verify(data));
  } catch (err) {
    console.log(err);
    const data = err.response.data;

    return Err(object({ errors: genericErrorsDecoder }).verify(data).errors);
  }
}

async function updateTask(
  taskId: number,
  { title, content }: { title?: string; content?: string }
): Promise<Result<Task, GenericErrors>> {
  try {
    const { data } = await axios.put(`/api/do/task/${taskId}/`, { title, content });

    return Ok(taskDecoder.verify(data));
  } catch ({ data }) {
    return Err(object({ errors: genericErrorsDecoder }).verify(data).errors);
  }
}

async function getTaskDetail(taskId: number): Promise<Result<Task, GenericErrors>> {
  try {
    const { data } = await axios.get(`/api/do/task/${taskId}/`);

    return Ok(taskDecoder.verify(data));
  } catch ({ data }) {
    return Err(object({ errors: genericErrorsDecoder }).verify(data).errors);
  }
}

async function operateTaskEvent(taskId: number, event: string): Promise<Result<Task, GenericErrors>> {
  try {
    const { data } = await axios.patch(`/api/do/task/${taskId}/event/${event}/`);

    return Ok(taskDecoder.verify(data.data));
  } catch ({ data }) {
    return Err(object({ errors: genericErrorsDecoder }).verify(data).errors);
  }
}

export async function getTags(): Promise<{ tags: string[] }> {
  return object({ tags: array(string) }).verify((await axios.get('tags')).data);
}

export async function login(email: string, password: string): Promise<Result<User, GenericErrors>> {
  try {
    const { data } = await axios.post('users/login', { user: { email, password } });

    return Ok(object({ user: userDecoder }).verify(data).user);
  } catch (err) {
    const data = err.response.data;
    return Err(object({ errors: genericErrorsDecoder }).verify(data).errors);
  }
}

export async function getUser(): Promise<User> {
  const { data } = await axios.get('user');
  return object({ user: userDecoder }).verify(data).user;
}

export async function favoriteArticle(slug: string): Promise<Article> {
  return object({ article: articleDecoder }).verify((await axios.post(`articles/${slug}/favorite`)).data).article;
}

export async function unfavoriteArticle(slug: string): Promise<Article> {
  return object({ article: articleDecoder }).verify((await axios.delete(`articles/${slug}/favorite`)).data).article;
}

export async function updateSettings(user: UserSettings): Promise<Result<User, GenericErrors>> {
  try {
    const { data } = await axios.put('user', user);

    return Ok(object({ user: userDecoder }).verify(data).user);
  } catch ({ data }) {
    return Err(object({ errors: genericErrorsDecoder }).verify(data).errors);
  }
}

export async function signUp(user: UserForRegistration): Promise<Result<User, GenericErrors>> {
  try {
    const { data } = await axios.post('users', { user });

    return Ok(object({ user: userDecoder }).verify(data).user);
  } catch ({ response: { data } }) {
    return Err(object({ errors: genericErrorsDecoder }).verify(data).errors);
  }
}

export async function createArticle(article: ArticleForEditor): Promise<Result<Article, GenericErrors>> {
  try {
    const { data } = await axios.post('articles', { article });

    return Ok(object({ article: articleDecoder }).verify(data).article);
  } catch ({ response: { data } }) {
    return Err(object({ errors: genericErrorsDecoder }).verify(data).errors);
  }
}

export async function getArticle(slug: string): Promise<Article> {
  const { data } = await axios.get(`articles/${slug}`);
  return object({ article: articleDecoder }).verify(data).article;
}

export async function updateArticle(slug: string, article: ArticleForEditor): Promise<Result<Article, GenericErrors>> {
  try {
    const { data } = await axios.put(`articles/${slug}`, { article });

    return Ok(object({ article: articleDecoder }).verify(data).article);
  } catch ({ response: { data } }) {
    return Err(object({ errors: genericErrorsDecoder }).verify(data).errors);
  }
}

export async function getProfile(username: string): Promise<Profile> {
  const { data } = await axios.get(`profiles/${username}`);
  return object({ profile: profileDecoder }).verify(data).profile;
}

export async function followUser(username: string): Promise<Profile> {
  const { data } = await axios.post(`profiles/${username}/follow`);
  return object({ profile: profileDecoder }).verify(data).profile;
}

export async function unfollowUser(username: string): Promise<Profile> {
  const { data } = await axios.delete(`profiles/${username}/follow`);
  return object({ profile: profileDecoder }).verify(data).profile;
}

export async function getFeed(filters: FeedFilters = {}): Promise<MultipleArticles> {
  const finalFilters: ArticlesFilters = {
    limit: 10,
    offset: 0,
    ...filters,
  };
  return multipleArticlesDecoder.verify((await axios.get(`articles/feed?${objectToQueryString(finalFilters)}`)).data);
}

export async function getArticleComments(slug: string): Promise<Comment[]> {
  const { data } = await axios.get(`articles/${slug}/comments`);
  return object({ comments: array(commentDecoder) }).verify(data).comments;
}

export async function deleteComment(slug: string, commentId: number): Promise<void> {
  await axios.delete(`articles/${slug}/comments/${commentId}`);
}

export async function createComment(slug: string, body: string): Promise<Comment> {
  const { data } = await axios.post(`articles/${slug}/comments`, { comment: { body } });
  return object({ comment: commentDecoder }).verify(data).comment;
}

export async function deleteArticle(slug: string): Promise<void> {
  await axios.delete(`articles/${slug}`);
}

export const request = {
  createTask,
  updateTask,
  getTasks,
  getTaskDetail,
  operateTaskEvent,
};
