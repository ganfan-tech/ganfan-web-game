import { CheckCircleOutlined, SmileOutlined } from '@ant-design/icons';
import { Button, Card, Col, Divider, Input, Layout, Row, Timeline } from 'antd';
import { Typography } from 'antd';
import { request } from '../../services/conduit';
import { store } from '../../state/store';
import { useStore } from '../../state/storeHooks';
import { Task } from '../../types/task';
import { editCurrentTask, refreshCurrentTask, updateTask } from './task.slice';

const { TextArea } = Input;
const { Title } = Typography;

export function TaskDetail({
  onFollowToggle,
  onEditSettings,
}: {
  onFollowToggle?: () => void;
  onEditSettings?: () => void;
}) {
  const { tasks, currentTask } = useStore(({ taskSlice }) => taskSlice);
  if (currentTask == null) {
    return <Card />;
  }

  console.log(currentTask.logs);
  return (
    <Card
      title={
        <Input
          placeholder='输入标题'
          size='large'
          bordered={false}
          style={{
            fontSize: 24,
          }}
          value={currentTask.title}
          onChange={(e) => {
            store.dispatch(editCurrentTask({ title: e.currentTarget.value }));
          }}
          onPressEnter={async (e) => {
            console.log(e);
            e.currentTarget.blur();
            const title = e.currentTarget.value;
            if (title === '') return;
            // ev.preventDefault();
            // store.dispatch(startSubmitting());
            const result = await request.updateTask(currentTask.id, { title });
            store.dispatch(refreshCurrentTask(result.unwrap()));
          }}
        />
      }
      extra={<Button type='link' shape='circle' icon={<CheckCircleOutlined />} />}
    >
      <Title level={5} type='secondary'>
        描述
      </Title>
      <TextArea
        placeholder='未实现编辑描述功能'
        // bordered={false}
        autoSize={{ minRows: 2, maxRows: 6 }}
        value={currentTask.content || ''}
        onChange={(e) => {
          store.dispatch(editCurrentTask({ content: e.currentTarget.value }));
        }}
      />

      <div style={{ height: '20px' }}></div>
      <Title level={5} type='secondary'>
        操作日志
      </Title>

      <Timeline>
        {(currentTask.logs || []).map((item) => {
          return (
            <Timeline.Item key={item.id} color='green'>
              {item.created_time.toLocaleString()} {item.event}
            </Timeline.Item>
          );
        })}
        {/* <Timeline.Item color='green'>Create a services site 2015-09-01</Timeline.Item>
        <Timeline.Item color='green'>Create a services site 2015-09-01</Timeline.Item>
        <Timeline.Item color='red'>
          <p>Solve initial network problems 1</p>
          <p>Solve initial network problems 2</p>
          <p>Solve initial network problems 3 2015-09-01</p>
        </Timeline.Item>
        <Timeline.Item>
          <p>Technical testing 1</p>
          <p>Technical testing 2</p>
          <p>Technical testing 3 2015-09-01</p>
        </Timeline.Item>
        <Timeline.Item color='gray'>
          <p>Technical testing 1</p>
          <p>Technical testing 2</p>
          <p>Technical testing 3 2015-09-01</p>
        </Timeline.Item>
        <Timeline.Item color='gray'>
          <p>Technical testing 1</p>
          <p>Technical testing 2</p>
          <p>Technical testing 3 2015-09-01</p>
        </Timeline.Item>
        <Timeline.Item color='#00CCFF' dot={<SmileOutlined />}>
          <p>Custom color testing</p>
        </Timeline.Item> */}
        <Timeline.Item color='#00CCFF' dot={<SmileOutlined />}>
          <p>{currentTask.created_time.toLocaleString()} 创建任务</p>
        </Timeline.Item>
      </Timeline>
    </Card>
  );
}

function ToggleFollowButton({
  following,
  username,
  disabled,
  onClick,
}: {
  following: boolean;
  username: string;
  disabled: boolean;
  onClick?: () => void;
}) {
  return (
    <button className='btn btn-sm btn-outline-secondary action-btn' onClick={onClick} disabled={disabled}>
      <i className='ion-plus-round'></i>
      &nbsp;
      {following ? ' Unfollow' : ' Follow'} {username}
    </button>
  );
}

function EditProfileButton({ disabled, onClick }: { disabled: boolean; onClick?: () => void }) {
  return (
    <button className='btn btn-sm btn-outline-secondary action-btn' onClick={onClick} disabled={disabled}>
      <i className='ion-gear-a'></i>&nbsp; Edit Profile Settings
    </button>
  );
}
