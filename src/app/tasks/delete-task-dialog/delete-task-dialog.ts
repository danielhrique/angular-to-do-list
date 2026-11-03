import { Component, inject } from '@angular/core';
import {
MAT_DIALOG_DATA,
MatDialogActions,
MatDialogClose,
MatDialogContent,
MatDialogTitle
} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';


interface DeleteTaskDialogData {
  taskTitle: string;
}


@Component({
  imports: [MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle, MatButton],
  selector: 'app-delete-task-dialog',
  styleUrl: './delete-task-dialog.css',
  templateUrl: './delete-task-dialog.html',
})
export class DeleteTaskDialog {
  readonly data = inject<DeleteTaskDialogData>(MAT_DIALOG_DATA);  
}
