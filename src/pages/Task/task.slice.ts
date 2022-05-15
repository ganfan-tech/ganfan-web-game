import { None, Option, Some } from '@hqoss/monads';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, MultipleTasks, TaskLog } from '../../types/task';
import * as R from 'ramda';
import { string } from 'decoders';

// export interface TaskViewerTask {
//   task: Task;
//   isSubmitting: boolean;
// }

export interface TaskViewerState {
  tasks: Option<Task[]>;
  currentPage: number;
  count: number;
  currentTaskId: number;
  currentTask: Task | null;
  currentTaskLogs: TaskLog[];
  createTaskEditorTitle: string;
}

const initialState: TaskViewerState = {
  tasks: None,
  currentPage: 1,
  count: 0,
  currentTaskId: -1,
  currentTask: null,
  currentTaskLogs: [],
  createTaskEditorTitle: '',
};

const slice = createSlice({
  name: 'taskList',
  initialState,
  reducers: {
    startLoadingTasks: () => initialState,
    loadTasks: (state, { payload: { results, count } }: PayloadAction<MultipleTasks>) => {
      state.tasks = Some(results.map((task) => task));
      state.count = count;
    },
    createNewTask: (state, { payload: task }: PayloadAction<Task>) => {
      const tasks = state.tasks.unwrapOr([]);
      state.tasks = Some([task, ...tasks]);
      state.count = tasks.length + 1;
      state.currentTaskId = task.id;
      state.currentTask = { ...task };
      state.createTaskEditorTitle = '';
    },
    changeCreateTaskEditorTitle: (state, { payload: content }: PayloadAction<string>) => {
      state.createTaskEditorTitle = content;
    },
    startSubmittingFavorite: (state, { payload: index }: PayloadAction<number>) => {
      state.tasks = state.tasks.map(R.adjust(index, R.assoc('isSubmitting', true)));
    },
    endSubmittingFavorite: (state, { payload: { task, index } }: PayloadAction<{ index: number; task: Task }>) => {
      state.tasks = state.tasks.map(R.update<Task>(index, task));
    },
    changePage: (state, { payload: page }: PayloadAction<number>) => {
      state.currentPage = page;
      state.tasks = None;
    },
    switchCurrentTask: (state, { payload: task }: PayloadAction<Task>) => {
      state.currentTaskId = task.id;
      state.currentTask = { ...task };
      state.currentTaskLogs = [];
    },
    refreshCurrentTask: (state, { payload: task }: PayloadAction<Task>) => {
      console.log(1111, task);

      if (task.id === state.currentTask?.id) {
        state.currentTask = task;
      }
      const tasks = state.tasks.unwrapOr([]);
      const taskIndex = tasks.findIndex((item) => item.id === task.id);
      if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...task };
        state.tasks = Some([...tasks]);
      }
    },
    editCurrentTask: (state, { payload: { title, content } }: PayloadAction<{ title?: string; content?: string }>) => {
      if (!state.currentTask) return;

      state.currentTask.title = title === undefined ? state.currentTask.title : title;
      state.currentTask.content = content || state.currentTask?.content;
    },
    updateTask: (state, { payload: task }: PayloadAction<Task>) => {
      const tasks = state.tasks.unwrapOr([]);
      const taskIndex = tasks.findIndex((item) => item.id === task.id);
      if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...task };
        state.tasks = Some([...tasks]);
      }
    },
  },
});

export const {
  startLoadingTasks,
  loadTasks,
  startSubmittingFavorite,
  endSubmittingFavorite,
  changePage,
  switchCurrentTask,
  editCurrentTask,
  createNewTask,
  changeCreateTaskEditorTitle,
  updateTask,
  refreshCurrentTask,
} = slice.actions;

export default slice.reducer;
