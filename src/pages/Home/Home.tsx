import { Option } from '@hqoss/monads';
import { getArticles, getFeed, getTags, getTasks } from '../../services/conduit';
import { store } from '../../state/store';
import { useStore, useStoreWithInitializer } from '../../state/storeHooks';
import { FeedFilters } from '../../types/article';
import { ArticlesViewer } from '../../components/ArticlesViewer/ArticlesViewer';
import { changePage, loadArticles, startLoadingArticles } from '../../components/ArticlesViewer/ArticlesViewer.slice';
import { ContainerPage } from '../../components/ContainerPage/ContainerPage';
// import { changeTab, loadTags, startLoadingTags } from './Home.slice';
import { Button, Input, Layout, Menu, MenuProps, Tag } from 'antd';
import React, { Fragment } from 'react';
import Icon, { UserOutlined, LaptopOutlined, NotificationOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { ArticlePreview } from '../../components/ArticlePreview/ArticlePreview';
const { Header, Footer, Sider, Content } = Layout;
// import { loadTasks, startLoadingTasks, TaskViewerState } from './TaskList.slice';
import { MultipleTasks } from '../../types/task';
import { List, Avatar, Space } from 'antd';
import { MessageOutlined, LikeOutlined, StarOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

const { Title, Text } = Typography;
const items1: MenuProps['items'] = ['1', '2', '3'].map((key) => ({
  key,
  label: `nav ${key}`,
}));

import { TaskHome } from '../Task/TaskHome';
import { MineSweeperGame } from '../MineSweeper/MineSweeper';

const data = [
  {
    title:
      'Racing car sprays burning fuel into crowd. Racing car sprays burning fuel into crowd. Racing car sprays burning fuel into crowd',
    description: 'sprays burning fuel into crowd',
  },
  {
    title: 'Japanese princess to wed commoner.',
    description:
      'Japanese princess to wed commoner, Japanese princess to wed commoner, Japanese princess to wed commoner',
  },
  { title: 'Australian walks 100km after outback crash.', description: 'walks 100km after outback crash' },
  { title: 'Man charged over missing wedding girl.', description: 'charged over missing wedding girl' },
  { title: 'Man charged over missing wedding girl.', description: 'charged over missing wedding girl' },
  { title: 'Man charged over missing wedding girl.', description: 'charged over missing wedding girl' },
  { title: 'Man charged over missing wedding girl.', description: 'charged over missing wedding girl' },
  { title: 'Man charged over missing wedding girl.', description: 'charged over missing wedding girl' },
  { title: 'Man charged over missing wedding girl.', description: 'charged over missing wedding girl' },
];
const IconText = ({ icon, text }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);
const items2: MenuProps['items'] = [UserOutlined, LaptopOutlined, NotificationOutlined].map((icon, index) => {
  const key = String(index + 1);

  return {
    key: `sub${key}`,
    icon: React.createElement(icon),
    label: `subnav ${key}`,

    children: new Array(4).fill(null).map((_, j) => {
      const subKey = index * 4 + j + 1;
      return {
        key: subKey,
        label: `option${subKey}`,
      };
    }),
  };
});

export function Home() {
  return <MineSweeperGame />;
  const { tags, selectedTab } = useStoreWithInitializer(({ home }) => home, load);
  const { articles, articlesCount, currentPage } = useStore(({ articleViewer }) => articleViewer);
  const { tasks } = useStore(({ taskList }) => taskList);

  return (
    <Layout
      style={{
        height: '100vh',
      }}
    >
      <Header
        style={{
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: 'white',
            fontSize: '32px',
          }}
        >
          GanFan.DO
        </Text>
        <div style={{ marginLeft: '100px' }}>
          <CreateTask />
        </div>
      </Header>
      <Layout>
        <Sider
          width='30vw'
          theme='light'
          style={{
            color: 'red',
            overflow: 'auto',
          }}
        >
          <div>
            <TaskList tasks={tasks} />
          </div>
        </Sider>
        <Content style={{ overflow: 'auto' }}>
          <div>
            <TaskDetail task={data[0]} />
          </div>
        </Content>
      </Layout>
    </Layout>
  );

  return (
    <div className='home-page'>
      {renderBanner()}
      <ContainerPage>
        <div className='col-md-9'>
          <ArticlesViewer
            toggleClassName='feed-toggle'
            selectedTab={selectedTab}
            tabs={buildTabsNames(selectedTab)}
            onPageChange={onPageChange}
            onTabChange={onTabChange}
          />
        </div>

        <div className='col-md-3'>
          <HomeSidebar tags={tags} />
        </div>
      </ContainerPage>
    </div>
  );
}

// function TaskList({ tasks }: { tasks: TaskViewerState['tasks'] }) {
//   console.log(2222, tasks);
//   return tasks.match({
//     none: () => (
//       <div className='article-preview' key={1}>
//         Loading tasks...
//       </div>
//     ),
//     some: (tasks) => {
//       console.log(333, tasks);
//       return <Fragment>
//         {tasks.length === 0 && (
//           <div className='article-preview' key={1}>
//             No tasks are here... yet.
//           </div>
//         )}
//         {tasks.map(({ task, isSubmitting }, index) => (
//           <TaskListItem item={task} />

//           // <ArticlePreview
//           //   key={article.slug}
//           //   article={article}
//           //   isSubmitting={isSubmitting}
//           //   onFavoriteToggle={isSubmitting ? undefined : onFavoriteToggle(index, article)}
//           // />
//         ))}
//       </Fragment>
//     },
//   });
// }

async function load() {
  store.dispatch(startLoadingArticles());
  // store.dispatch(startLoadingTasks());
  // store.dispatch(startLoadingTags());

  // if (store.getState().app.user.isSome()) {
  //   store.dispatch(changeTab('Your Feed'));
  // }

  const multipleArticles = await getFeedOrGlobalArticles();
  console.log(multipleArticles);
  store.dispatch(loadArticles(multipleArticles));

  // const multipleTasks = await getTasks();
  // const multipleTasks: MultipleTasks = {
  //   tasks: [
  //     {
  //       slug: '1212',
  //       title: 'string',
  //       description: '',
  //       tagList: [],
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //     },
  //   ],
  //   count: 1,
  // };
  // store.dispatch(loadTasks(multipleTasks));

  // const tagsResult = await getTags();
  // store.dispatch(loadTags(tagsResult.tags));
}

function renderBanner() {
  return (
    <div className='banner'>
      <div className='container'>
        <h1 className='logo-font'>conduit</h1>
        <p>A place to share your knowledge.</p>
      </div>
    </div>
  );
}

function buildTabsNames(selectedTab: string) {
  const { user } = store.getState().app;

  return Array.from(new Set([...(user.isSome() ? ['Your Feed'] : []), 'Global Feed', selectedTab]));
}

async function onPageChange(index: number) {
  store.dispatch(changePage(index));

  const multipleArticles = await getFeedOrGlobalArticles({ offset: (index - 1) * 10 });
  store.dispatch(loadArticles(multipleArticles));
}

async function onTabChange(tab: string) {
  // store.dispatch(changeTab(tab));
  store.dispatch(startLoadingArticles());

  const multipleArticles = await getFeedOrGlobalArticles();
  store.dispatch(loadArticles(multipleArticles));
}

async function getFeedOrGlobalArticles(filters: FeedFilters = {}) {
  const { selectedTab } = store.getState().home;
  const finalFilters = {
    ...filters,
    tag: selectedTab.slice(2),
  };

  return await (selectedTab === 'Your Feed' ? getFeed : getArticles)(
    !selectedTab.startsWith('#') ? filters : finalFilters
  );
}

function HomeSidebar({ tags }: { tags: Option<string[]> }) {
  return (
    <div className='sidebar'>
      <p>Popular Tags</p>

      {tags.match({
        none: () => <span>Loading tags...</span>,
        some: (tags) => (
          <div className='tag-list'>
            {' '}
            {tags.map((tag) => (
              <a key={tag} href='#' className='tag-pill tag-default' onClick={() => onTabChange(`# ${tag}`)}>
                {tag}
              </a>
            ))}{' '}
          </div>
        ),
      })}
    </div>
  );
}
function onFavoriteToggle(index: any, article: any): (() => void) | undefined {
  throw new Error('Function not implemented.');
}
