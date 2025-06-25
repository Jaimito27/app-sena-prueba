import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../shared/models/user.interface';

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss'
})
export class UserForm implements OnChanges {
  @Input() user: User | null = null;
  @Input() isEditMode = false;
  @Output() save = new EventEmitter<User>();
  @Output() cancel = new EventEmitter<void>();
  private fb = inject(FormBuilder)
  userForm!: FormGroup;

  tenantOptions = [
    { value: 'tenant1', label: 'Tenant 1' },
    { value: 'tenant2', label: 'Tenant 2' },
    { value: 'tenant3', label: 'Tenant 3' },
  ];

  roleOptions = [
    { value: 'user', label: 'user' },
    { value: 'admin', label: 'admin' }
  ];

  constructor() {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      roles: [[], Validators.required],
      tenantId: [null, Validators.required],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.userForm.patchValue({
        username: this.user.username,
        email: this.user.email,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        roles: this.user.roles || [],
        tenantId: this.user.tenantId,
      });
    } else if (changes['user'] && !this.user) {
      this.userForm.reset()
    }
  }

  onSubmit() {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      const result: User = {
        ...this.user,
        ...formValue,
      };
      this.save.emit(result);
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.cancel.emit()
  }
}
