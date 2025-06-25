import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsForm } from './documents-form';

describe('DocumentsForm', () => {
  let component: DocumentsForm;
  let fixture: ComponentFixture<DocumentsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
