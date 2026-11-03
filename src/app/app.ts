import { Component, computed, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TaskFormDialog } from './tasks/task-form-dialog/task-form-dialog';
import { type NewTask, type Task } from './tasks/task.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeleteTaskDialog } from './tasks/delete-task-dialog/delete-task-dialog';

type TaskFilter = 'all' | 'pending' | 'completed';

@Component({
  imports: [RouterOutlet, TaskFormDialog],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})

export class App implements OnInit {
  protected readonly title = signal('Minha lista de tarefas');
  protected isTaskDialogOpen: boolean = false;
  protected readonly tasks = signal<Task[]>([]);
  protected readonly activeFilter = signal<TaskFilter>('all');
  private nextTaskId = 1;
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly taskToEdit = signal<Task | null>(null);
  protected readonly pendingTaskCount = computed(
    () => this.tasks().filter(task => !task.completed).length,
  );
  protected readonly completedTaskCount = computed(
    () => this.tasks().filter(task => task.completed).length,
  );
  protected readonly visibleTasks = computed(() => {
    const filter = this.activeFilter();

    return this.tasks().filter(task => {
      if (filter === 'pending') {
        return !task.completed;
      }

      if (filter === 'completed') {
        return task.completed;
      }

      return true;
    });
  });


  openTaskDialog(): void {
    this.taskToEdit.set(null);
    this.isTaskDialogOpen = true;
  }

  editTask(task: Task): void {
    this.taskToEdit.set(task);
    this.isTaskDialogOpen = true;
  }
  
  closeTaskDialog(): void {
    this.isTaskDialogOpen = false;
    this.taskToEdit.set(null);
  }


  ngOnInit(): void {
    this.loadTasks();
  }

  private loadTasks(): void {
    const savedTasks =  localStorage.getItem('tasks');

    if (savedTasks === null) {
      return;
    }

    try {
      const loadedTasks = JSON.parse(savedTasks) as Task[];
      this.tasks.set(loadedTasks);
      this.nextTaskId = loadedTasks.reduce((maxId, task) => Math.max(maxId, task.id), 0) + 1;
    } catch (error) {
      console.error('Failed to load tasks from localStorage', error);
    }

  }

  saveTask(taskFields: NewTask): void {
    const taskToEdit = this.taskToEdit();

    if (taskToEdit === null) {
      const newTask: Task = {
        id: this.nextTaskId++,
        completed: false,
        ...taskFields,
      };

      this.tasks.update(tasks => [...tasks, newTask]);
      this.persistTasks();
      this.closeTaskDialog();
      this.showSnackbar('Tarefa criada com sucesso.');
      return;
    }

    this.tasks.update(tasks =>
      tasks.map(task =>
        task.id === taskToEdit.id ? { ...task, ...taskFields } : task,
      ),
    );
    this.persistTasks();
    this.closeTaskDialog();
    this.showSnackbar('Tarefa editada com sucesso.');
  }

  toggleTaskCompleted(task: Task): void {
    const completed = !task.completed;

    this.tasks.update(tasks =>
      tasks.map(currentTask =>
        currentTask.id === task.id
          ? { ...currentTask, completed }
          : currentTask,
      ),
    );
    this.persistTasks();
    this.showSnackbar(
      completed ? 'Tarefa concluída com sucesso.' : 'Tarefa reaberta.',
    );
  }

  setFilter(filter: TaskFilter): void {
    this.activeFilter.set(filter);
  }


  deleteTask(task: Task) {
    const dialogRef = this.dialog.open(DeleteTaskDialog, {
      data: {taskTitle: task.title},
      ariaLabelledBy: 'delete-dialog-title',
      ariaDescribedBy: 'delete-dialog-description'
    })

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed !== true) {
        return;
      }
      this.tasks.update(tasks => tasks.filter(t => t.id !== task.id));
      this.persistTasks();
      this.showSnackbar('Tarefa excluída com sucesso.');
    });
  }

  private persistTasks(): void {
    localStorage.setItem('tasks', JSON.stringify(this.tasks()));
  }

  private showSnackbar(message: string): void {
    this.snackBar.open(message, undefined, {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }
}
