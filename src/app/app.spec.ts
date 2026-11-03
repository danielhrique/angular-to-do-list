import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { App } from './app';
import { DeleteTaskDialog } from './tasks/delete-task-dialog/delete-task-dialog';
import { type NewTask, type Task } from './tasks/task.model';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let component: App;
  let dialogResults: Subject<boolean | undefined>[];
  let dialog: { open: ReturnType<typeof vi.fn> };
  let snackBar: { open: ReturnType<typeof vi.fn> };
  let createApp: () => void;

  beforeEach(async () => {
    localStorage.clear();
    dialogResults = [];
    dialog = {
      open: vi.fn(() => {
        const result = new Subject<boolean | undefined>();
        dialogResults.push(result);
        return { afterClosed: () => result.asObservable() };
      }),
    };
    snackBar = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).compileComponents();

    createApp = () => {
      fixture = TestBed.createComponent(App);
      component = fixture.componentInstance;
      fixture.detectChanges();
    };
  });

  it('creates a task, persists it, and shows a success notification', () => {
    createApp();

    component.saveTask(makeTaskFields('Planejar a semana'));
    fixture.detectChanges();

    expect(readSavedTasks()).toEqual([
      expect.objectContaining({
        id: 1,
        title: 'Planejar a semana',
        completed: false,
      }),
    ]);
    expect(fixture.nativeElement.textContent).toContain('Planejar a semana');
    expect(snackBar.open).toHaveBeenCalledWith(
      'Tarefa criada com sucesso.',
      undefined,
      expect.objectContaining({ duration: 3000 }),
    );
  });

  it('loads persisted tasks and continues with the next id', () => {
    localStorage.setItem(
      'tasks',
      JSON.stringify([makeTask(7, 'Tarefa salva', false)]),
    );
    createApp();

    component.saveTask(makeTaskFields('Nova tarefa'));

    expect(readSavedTasks().map(task => task.id)).toEqual([7, 8]);
    expect(fixture.nativeElement.textContent).toContain('Tarefa salva');
  });

  it('updates a task without duplicating it or changing its id and completion state', () => {
    createApp();
    component.saveTask(makeTaskFields('Título original'));
    const originalTask = readSavedTasks()[0];
    component.toggleTaskCompleted(originalTask);
    const completedTask = readSavedTasks()[0];

    component.editTask(completedTask);
    component.saveTask(makeTaskFields('Título atualizado'));

    expect(readSavedTasks()).toEqual([
      expect.objectContaining({
        id: completedTask.id,
        title: 'Título atualizado',
        completed: true,
      }),
    ]);
    expect(snackBar.open).toHaveBeenCalledWith(
      'Tarefa editada com sucesso.',
      undefined,
      expect.any(Object),
    );
  });

  it('toggles completion, persists it, and notifies for both state changes', () => {
    createApp();
    component.saveTask(makeTaskFields('Ler documentação'));
    const task = readSavedTasks()[0];

    component.toggleTaskCompleted(task);
    expect(readSavedTasks()[0].completed).toBe(true);
    expect(snackBar.open).toHaveBeenLastCalledWith(
      'Tarefa concluída com sucesso.',
      undefined,
      expect.any(Object),
    );

    component.toggleTaskCompleted(readSavedTasks()[0]);
    expect(readSavedTasks()[0].completed).toBe(false);
    expect(snackBar.open).toHaveBeenLastCalledWith(
      'Tarefa reaberta.',
      undefined,
      expect.any(Object),
    );
  });

  it('filters pending and completed tasks and shows the matching empty state', () => {
    createApp();
    component.saveTask(makeTaskFields('Tarefa pendente'));
    component.saveTask(makeTaskFields('Tarefa concluída'));
    component.toggleTaskCompleted(readSavedTasks()[1]);

    component.setFilter('pending');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Tarefa pendente');
    expect(fixture.nativeElement.textContent).not.toContain('Tarefa concluída');

    component.setFilter('completed');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Tarefa concluída');
    expect(fixture.nativeElement.textContent).not.toContain('Tarefa pendente');

    component.toggleTaskCompleted(readSavedTasks()[1]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nenhuma tarefa neste filtro.');
  });

  it('deletes only when the confirmation dialog returns true', () => {
    createApp();
    component.saveTask(makeTaskFields('Tarefa removível'));
    const task = readSavedTasks()[0];

    component.deleteTask(task);
    expect(dialog.open).toHaveBeenCalledWith(
      DeleteTaskDialog,
      expect.objectContaining({ data: { taskTitle: task.title } }),
    );
    dialogResults[0].next(false);
    dialogResults[0].complete();

    expect(readSavedTasks()).toHaveLength(1);
    expect(snackBar.open).not.toHaveBeenCalledWith(
      'Tarefa excluída com sucesso.',
      undefined,
      expect.any(Object),
    );

    component.deleteTask(task);
    dialogResults[1].next(true);
    dialogResults[1].complete();

    expect(readSavedTasks()).toHaveLength(0);
    expect(snackBar.open).toHaveBeenLastCalledWith(
      'Tarefa excluída com sucesso.',
      undefined,
      expect.any(Object),
    );
  });

  it('does not throw when persisted JSON is invalid', () => {
    localStorage.setItem('tasks', '{invalid');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(createApp).not.toThrow();
    expect(fixture.nativeElement.textContent).toContain('Nenhuma tarefa por aqui ainda.');
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

function makeTaskFields(title: string): NewTask {
  return {
    title,
    description: `Descrição de ${title}`,
    priority: 'medium',
  };
}

function makeTask(id: number, title: string, completed: boolean): Task {
  return {
    ...makeTaskFields(title),
    id,
    completed,
  };
}

function readSavedTasks(): Task[] {
  return JSON.parse(localStorage.getItem('tasks') ?? '[]') as Task[];
}
