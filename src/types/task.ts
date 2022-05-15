import { array, boolean, Decoder, iso8601, number, object, null_, string, either, optional } from 'decoders';
import { Profile, profileDecoder } from './profile';

export interface Task {
  id: number;
  title: string;
  content: string | null;
  task_status: string;
  used_time: string;
  // tagList: string[];
  created_time: Date;
  updated_time: Date;
  logs?: TaskLog[];
}

export interface TaskLog {
  id: number;
  task_id: number;
  event: string;
  created_time: Date;
  updated_time: Date;
}

export const taskDecoder: Decoder<Task> = object({
  id: number,
  title: string,
  content: either(null_, string),
  task_status: string,
  used_time: string,
  // tagList: array(string),
  created_time: iso8601,
  updated_time: iso8601,
  logs: optional(
    array(
      object({
        id: number,
        task_id: number,
        event: string,
        created_time: iso8601,
        updated_time: iso8601,
      })
    )
  ),

  // favorited: boolean,
  // favoritesCount: number,
  // author: profileDecoder,
});

export interface MultipleTasks {
  results: Task[];
  count: number;
}

export const multipleTasksDecoder: Decoder<MultipleTasks> = object({
  results: array(taskDecoder),
  count: number,
});

// export interface TaskForEditor {
//   title: string;
//   description: string;
//   body: string;
//   // tagList: string[];
// }

export interface TasksFilters {
  // tag?: string;
  // author?: string;
  // favorited?: string;
  page_size?: number;
  page?: number;
}

// export interface FeedFilters {
//   limit?: number;
//   offset?: number;
// }
