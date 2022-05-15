import { store } from '../../state/store';
import { useStore, useStoreWithInitializer } from '../../state/storeHooks';
import { FeedFilters } from '../../types/article';
import { ArticlesViewer } from '../../components/ArticlesViewer/ArticlesViewer';
import { changePage, loadArticles, startLoadingArticles } from '../../components/ArticlesViewer/ArticlesViewer.slice';
import { ContainerPage } from '../../components/ContainerPage/ContainerPage';
import { changeTab, loadTags, startLoadingTags } from './Home.slice';
import { Button, Input, Layout, Menu, MenuProps, Tag } from 'antd';
import React from 'react';
import Icon, {
  UserOutlined,
  LaptopOutlined,
  NotificationOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import { ArticlePreview } from '../../components/ArticlePreview/ArticlePreview';
const { Header, Footer, Sider, Content } = Layout;
import { MultipleTasks, Task } from '../../types/task';
import { List, Avatar, Space } from 'antd';
import { MessageOutlined, LikeOutlined, StarOutlined, ClockCircleOutlined, CarryOutOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import { switchCurrentTask, refreshCurrentTask } from './task.slice';
import { request } from '../../services/conduit';
const { Title, Text } = Typography;

const statusMap = {
  init: { icon: StarOutlined, text: '未开始' },
  pause: { icon: PauseCircleOutlined, text: '已暂停' },
  doing: { icon: PlayCircleOutlined, text: '进行中' },
  done: { icon: CarryOutOutlined, text: '已完成' },
};

const IconText = ({ icon, text }: { icon: any; text: string }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

function showBtns() {
  return [
    //  <Button type='text' size='small'>开始</Button>,
    //  <Button type='text' size='small'>暂停</Button>,
    //  <Button type='text' size='small'>完成</Button>,
    <a>开始</a>,
    <a>暂停</a>,
    <a>完成</a>,
  ];
}

export function TaskListItem({ task }: { task: Task }) {
  const { currentTask } = useStore(({ taskSlice }) => taskSlice);

  const actions = [
    <IconText
      icon={statusMap[task.task_status]['icon']}
      text={statusMap[task.task_status]['text'] || task.task_status}
      key='list-vertical-star-o'
    />,
    <IconText icon={ClockCircleOutlined} text={task.used_time} key='list-vertical-like-o' />,
    // <IconText icon={StarOutlined} text='' key='list-vertical-message' />,
  ];
  if (task.task_status === 'init' || task.task_status === 'pause') {
    actions.push(
      <a
        type='text'
        // size='small'
        style={{
          color: 'rgba(0, 0, 0, 0.45)',
        }}
        onClick={async () => {
          const result = await request.operateTaskEvent(task.id, 'start');
          store.dispatch(refreshCurrentTask(result.unwrap()));
        }}
      >
        开始
      </a>
    );
  }
  if (task.task_status === 'doing') {
    actions.push(
      <a
        type='text'
        // size='small'
        style={{
          color: 'rgba(0, 0, 0, 0.45)',
        }}
        onClick={async () => {
          const result = await request.operateTaskEvent(task.id, 'pause');
          store.dispatch(refreshCurrentTask(result.unwrap()));
        }}
      >
        暂停
      </a>
    );
    actions.push(
      <a
        type='text'
        // size='small'
        style={{
          color: 'rgba(0, 0, 0, 0.45)',
        }}
        onClick={async () => {
          const result = await request.operateTaskEvent(task.id, 'complete');
          store.dispatch(refreshCurrentTask(result.unwrap()));
        }}
      >
        完成
      </a>
    );
  }
  // onClick={() => {
  //   console.log(index);
  //   store.dispatch(switchCurrentIndex(index))
  // }}
  return (
    <List.Item
      // actions={[<PlayCircleOutlined />, <PauseCircleOutlined />]}
      actions={actions}
      style={{
        padding: '10px 10px',
        backgroundColor: currentTask?.id === task.id ? 'RGBA(210, 210, 210, 0.50)' : undefined,
      }}
      // extra={
      //   <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      //     <PlayCircleOutlined
      //       style={{
      //         fontSize: '30px',
      //       }}
      //     />
      //   </div>
      // }
      onClick={async () => {
        console.log(task.id);
        store.dispatch(switchCurrentTask(task));
        const result = await request.getTaskDetail(task.id);
        store.dispatch(refreshCurrentTask(result.unwrap()));
      }}
      // onMouseEnter={(e) => {
      //   // store.dispatch()
      //   console.log('enter', task.id);
      // }}
      // onMouseLeave={() => {
      //   console.log('leave', task.id);
      // }}
    >
      <Title level={5}>{task.title}</Title>
      {task.content && <Text ellipsis={{ tooltip: task.content }}>{task.content}</Text>}
      {/* <List.Item.Meta
        title={task.title}
        // description={<Text ellipsis={{ tooltip: task.content }}>{task.content}</Text>}
      /> */}
      {/* <Tag>未开始</Tag> */}
    </List.Item>
  );
}
