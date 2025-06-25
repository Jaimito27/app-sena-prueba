import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Document } from '../../../shared/models/document.interface';

@Component({
  selector: 'app-documents-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './documents-form.html',
  styleUrl: './documents-form.scss'
})
export class DocumentsForm implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() document: Document | null = null;
  @Input() isEditMode = false;
  @Output() save = new EventEmitter<Document>();
  @Output() cancel = new EventEmitter<void>();

  documentForm!: FormGroup;

  constructor() {
    this.documentForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      size: [0, [Validators.required, Validators.min(1)]],
      uploadDate: ['', Validators.required],
      tags: [[]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['document'] && this.document) {
      this.documentForm.reset({
        ...this.document,
        tags: Array.isArray(this.document.tags) ? this.document.tags : []
      });
    } else if (changes['document'] && !this.document) {
      this.documentForm.reset();
    }
  }

  onSubmit() {
    if (this.documentForm.valid) {
      const result: Document = {
        ...this.document,
        ...this.documentForm.value,
        tags: (typeof this.documentForm.value.tags === 'string')
          ? this.documentForm.value.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
          : this.documentForm.value.tags || [],
      };
      this.save.emit(result)
    } else {
      this.documentForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  updateTags(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.documentForm.get('tags')?.setValue(value.split(',').map(tag => tag.trim()).filter(Boolean));


  }


  getTagsAsString(): string {
    const tags = this.documentForm.get('tags')?.value;
    return Array.isArray(tags) ? tags.join(', ') : '';
  }




}
