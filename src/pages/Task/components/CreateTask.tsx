import { request } from '../../../services/conduit';
import { store } from '../../../state/store';
import { useStore, useStoreWithInitializer } from '../../../state/storeHooks';
import { FeedFilters } from '../../../types/article';
import { ArticlesViewer } from '../../../components/ArticlesViewer/ArticlesViewer';
import {
  changePage,
  loadArticles,
  startLoadingArticles,
} from '../../../components/ArticlesViewer/ArticlesViewer.slice';
import { ContainerPage } from '../../../components/ContainerPage/ContainerPage';
import { changeTab, loadTags, startLoadingTags } from '../Home.slice';
import { Button, Input, InputRef, Layout, Menu, MenuProps, Tag } from 'antd';
import React from 'react';
import Icon, { UserOutlined, LaptopOutlined, NotificationOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { ArticlePreview } from '../../../components/ArticlePreview/ArticlePreview';
const { Header, Footer, Sider, Content } = Layout;
import { MultipleTasks } from '../../../types/task';
import { List, Avatar, Space } from 'antd';
import { MessageOutlined, LikeOutlined, StarOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import taskSlice, { createNewTask, changeCreateTaskEditorTitle } from '../task.slice';

export function CreateTask() {
  const { createTaskEditorTitle } = useStore(({ taskSlice }) => taskSlice);

  return (
    <Input.Group compact>
      <Input
        value={createTaskEditorTitle}
        style={{ width: '200px' }}
        placeholder='新建任务'
        onChange={(e) => {
          store.dispatch(changeCreateTaskEditorTitle(e.currentTarget.value));
        }}
        onPressEnter={async (e) => {
          console.log(e);
          e.currentTarget.blur();
          const title = e.currentTarget.value;
          if (title === '') return;
          e.currentTarget.value = '';
          // ev.preventDefault();
          // store.dispatch(startSubmitting());
          const result = await request.createTask(title);
          store.dispatch(createNewTask(result.unwrap()));

          // result.match({
          //   err: (errors) => store.dispatch(updateErrors(errors)),
          //   ok: ({ slug }) => {
          //     location.hash = `/article/${slug}`;
          //   },
          // });
        }}
      />
      {/* <Button type='primary' onClick={() => {}}>
        创建
      </Button> */}
    </Input.Group>
  );
}
