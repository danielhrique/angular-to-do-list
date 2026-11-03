export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: TaskPriority;
  date?: string;
  completed: boolean;
}

export type NewTask = Omit<Task, 'id' | 'completed'>;