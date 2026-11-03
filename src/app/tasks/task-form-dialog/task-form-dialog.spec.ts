import { ComponentFixture, TestBed } from '@angular/core/testing';
import { type NewTask, type Task } from '../task.model';
import { TaskFormDialog } from './task-form-dialog';

describe('TaskFormDialog', () => {
  let component: TaskFormDialog;
  let fixture: ComponentFixture<TaskFormDialog>;
  let submittedTask: NewTask | undefined;

  beforeEach(async () => {
    submittedTask = undefined;
    await TestBed.configureTestingModule({
      imports: [TaskFormDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormDialog);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('prefills the form when editing a task', () => {
    const task: Task = {
      id: 4,
      title: 'Revisar Angular',
      description: 'Estudar inputs e outputs',
      priority: 'high',
      date: '2026-11-03',
      completed: false,
    };

    fixture.componentRef.setInput('taskToEdit', task);
    fixture.detectChanges();

    expect(component.taskForm.getRawValue()).toEqual({
      title: task.title,
      description: task.description,
      priority: task.priority,
      date: task.date,
    });
    expect(fixture.nativeElement.textContent).toContain('Salvar alterações');
  });

  it('emits valid form fields without id or completed state', () => {
    component.taskSubmitted.subscribe(task => {
      submittedTask = task;
    });
    component.taskForm.setValue({
      title: 'Criar testes',
      description: 'Cobrir o fluxo principal',
      priority: 'medium',
      date: '',
    });

    component.submitTask();

    expect(submittedTask).toEqual({
      title: 'Criar testes',
      description: 'Cobrir o fluxo principal',
      priority: 'medium',
    });
  });

  it('does not emit invalid form data and marks required fields touched', () => {
    component.taskSubmitted.subscribe(task => {
      submittedTask = task;
    });

    component.submitTask();

    expect(submittedTask).toBeUndefined();
    expect(component.taskForm.controls.title.touched).toBe(true);
    expect(component.taskForm.controls.description.touched).toBe(true);
  });
});
