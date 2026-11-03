import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { vi } from 'vitest';
import { DeleteTaskDialog } from './delete-task-dialog';

describe('DeleteTaskDialog', () => {
  let component: DeleteTaskDialog;
  let fixture: ComponentFixture<DeleteTaskDialog>;
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    dialogRef = { close: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [DeleteTaskDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { taskTitle: 'Comprar leite' } },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteTaskDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the task title in the confirmation message', () => {
    expect(fixture.nativeElement.textContent).toContain('Comprar leite');
  });

  it('closes with false when cancellation is selected', () => {
    const cancelButton = fixture.nativeElement.querySelectorAll('button')[0] as HTMLButtonElement;
    cancelButton.click();

    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('closes with true when deletion is confirmed', () => {
    const confirmButton = fixture.nativeElement.querySelectorAll('button')[1] as HTMLButtonElement;
    confirmButton.click();

    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });
});
