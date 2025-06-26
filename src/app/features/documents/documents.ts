import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { DocumentService } from '../../core/services/document.service';
import { BehaviorSubject, combineLatest, debounceTime, filter, map, Observable, startWith, Subject, takeUntil, tap } from 'rxjs';
import { Document } from '../../shared/models/document.interface';
import { DocumentsState, LoadDocuments, SelectDocument } from '../../state/document.state';
import { AuthState } from '../../state/auth.state';
import { DocumentsForm } from './documents-form/documents-form';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, DocumentsForm],
  templateUrl: './documents.html',
  styleUrl: './documents.scss'
})
export class Documents implements OnInit, OnDestroy {
  private store = inject(Store);
  private documentService = inject(DocumentService);

  documents$!: Observable<Document[]>;
  isLoading$!: Observable<boolean>;
  documentsError$!: Observable<string | null>;
  selectedDocument$!: Observable<Document | null>;
  searchQuery$ = new  BehaviorSubject<string>('');
  // variables para el formulario de edicion y creación
  isDocumentFormModalActive: boolean = false;
  isEditMode: boolean = false;
  currentDocumentForm: Document = this.resetDocumentForm();
 filteredAndSearchedDocuments$!: Observable<Document[]>;
  isAuthenticated$!: Observable<boolean>;
  isAdmin$!: Observable<boolean>;



  //variable para filtro y busqueda
  searchQuery: string = '';
  //se calculara a partir de este obsevable combinado


  private allDocumentsForCurrentTenant: Document[] = []; //almacena todos los docs del tenant para aplicar la busqueda

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    //asignando los observables
    this.isLoading$ = this.store.select(DocumentsState.isLoading);
    this.documentsError$ = this.store.select(DocumentsState.documentsError);
    this.selectedDocument$ = this.store.select(DocumentsState.selectedDocument);

    this.isAuthenticated$ = this.store.select(AuthState.isAuthenticated);
    this.isAdmin$ = this.store.select(AuthState.isAdmin)

    // Para `documents$`, necesitamos observar los documentos filtrados del estado y luego aplicar el propio filtro de búsqueda.

    this.store.select(AuthState.userTenantId).pipe(
      filter(tenantId => tenantId !== null),
      tap(tenantId => {
        console.log(`Cargando documentos por tenantId ${tenantId}`);
        this.store.dispatch(new LoadDocuments(tenantId!));
        this.documentService.getDocumentsByTenant(tenantId!).subscribe()
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    //combinar el stream de documentos del estados con el stream de la busqueda
      this.filteredAndSearchedDocuments$ = combineLatest([
      this.store.select(DocumentsState.allDocuments),
      this.store.select(AuthState.userTenantId),
      this.searchQuery$.asObservable()
    ]).pipe(
      map(([allDocs, userTenantId, searchQuery]) => {
        // Filtra por tenantId primero
        const tenantFilteredDocs = allDocs.filter(doc => doc.tenantId === userTenantId);
        // Aplica el filtro de búsqueda
        const query = searchQuery.toLowerCase().trim();
        if (!query) return tenantFilteredDocs;
        return tenantFilteredDocs.filter(doc =>
          doc.name.toLowerCase().includes(query) ||
          doc.type.toLowerCase().includes(query) ||
          (doc.tags || []).some(tag => tag.toLowerCase().includes(query))
        );
      })
    );
  }

  //metodos para el formulario del CRUD
  private resetDocumentForm(): Document {
    return {
      id: 0, // Se generará al añadir
      name: '',
      type: '',
      size: 0,
      uploadDate: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
      userId: this.store.selectSnapshot(AuthState.currentUser)?.id || 0, // ID del usuario actual
      tenantId: this.store.selectSnapshot(AuthState.userTenantId) || '', // Tenant ID del usuario actual
      tags: [],
    }
  }

  openAddDocumentModal(): void {
    this.isEditMode = false;
    this.currentDocumentForm = this.resetDocumentForm();
    this.isDocumentFormModalActive = true;
  }

  onEditDocument(document: Document): void {
    this.isEditMode = true;
    this.currentDocumentForm = { ...document } //clonar documento
    //asefurarse de que tags es un array de string (si viene null o undefines)
    if (!this.currentDocumentForm.tags) {
      this.currentDocumentForm.tags = [];
    }
    this.isDocumentFormModalActive = true;
  }

  closeDocumentFormModal(): void {
    this.isDocumentFormModalActive = false;
    this.currentDocumentForm = this.resetDocumentForm(); //limipiar formnulario al cerrar
  }

  onSaveDocument(document: Document): void {
    if (this.isEditMode) {
      this.documentService.simulatedUpdateDocument(document).subscribe({
        next: () => console.log('Documento actualizado satisfactoriamente'),
        error: (err) => console.error('Error en la actualización del documento', err)
      });
    } else {
      this.documentService.simulatedAddDocument(document).subscribe({
        next: () => console.log('Documento creado exitosamente'),
        error: (err) => console.error('Error al crear documento', err)
      });
    }
    this.closeDocumentFormModal();
  }

  onDeleteDocument(documentId: number): void {
    if (confirm('Estas seguro de que quieres eliminar este documento')) {
      this.documentService.simulatedDeleteDocument(documentId).subscribe({
        next: () => console.log('Documento eliminado exitosamente'),
        error: (err) => console.error('Error al eliminar el documento ', err)
      })
    }
  }

  viewDetails(document: Document): void {
    this.store.dispatch(new SelectDocument(document));
  }

  closeDetailsModal(): void {
    this.store.dispatch(new SelectDocument(null));
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete()
  }


  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.searchQuery$.next(value);
  }
  // En src/app/features/documents/document-list/document-list.component.ts
  // (o documents.ts si no lo renombraste)
  updateTags(value: string): void { // Cambia de 'event: Event' a 'value: string'
    this.currentDocumentForm.tags = value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
  }

  canEditOrDelete(document: Document): boolean {
    const isAdmin = this.store.selectSnapshot(AuthState.isAdmin); // síncrono
    const currentTenantId = this.store.selectSnapshot(AuthState.userTenantId); // síncrono
    return isAdmin || document.tenantId === currentTenantId;
  }

}
