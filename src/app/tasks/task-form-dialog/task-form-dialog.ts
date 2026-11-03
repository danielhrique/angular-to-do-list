import { Component, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { type NewTask, type Task, type TaskPriority } from '../task.model';

@Component({
  imports: [MatIconModule, ReactiveFormsModule],
  selector: 'app-task-form-dialog',
  styleUrl: './task-form-dialog.css',
  templateUrl: './task-form-dialog.html',
})
export class TaskFormDialog implements OnInit {
  private readonly formBuilder = inject(FormBuilder).nonNullable;

  readonly closeRequested = output<void>();
  readonly taskSubmitted = output<NewTask>();

  readonly taskToEdit = input<Task | null>(null);

  readonly taskForm = this.formBuilder.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    priority: ['low' as TaskPriority],
    date: [''],
  });

  ngOnInit(): void {
    const task = this.taskToEdit();

    if (task === null) {
      return;
    }

    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      priority: task.priority,
      date: task.date ?? '',
    });
  }

  requestClose(): void {
    this.closeRequested.emit();
  }

  submitTask(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const { date, ...taskFields } = this.taskForm.getRawValue();

    this.taskSubmitted.emit({
      ...taskFields,
      ...(date ? { date } : {}),
    });
  }
}