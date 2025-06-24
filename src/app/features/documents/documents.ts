import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { DocumentService } from '../../core/services/document.service';
import { combineLatest, debounceTime, filter, map, Observable, startWith, Subject, takeUntil, tap } from 'rxjs';
import { Document } from '../../shared/models/document.interface';
import { DocumentsState, LoadDocuments, SelectDocument } from '../../state/document.state';
import { AuthState } from '../../state/auth.state';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  // variables para el formulario de edicion y creación
  isDocumentFormModalActive: boolean = false;
  isEditMode: boolean = false;
  currentDocumentForm: Document = this.resetDocumentForm();


  //variable para filtro y busqueda
  searchQuery: string = '';
  //se calculara a partir de este obsevable combinado
  filteredAndSearchedDocuments: Document[] = [];

  private allDocumentsForCurrentTenant: Document[] = []; //almacena todos los docs del tenant para aplicar la busqueda

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    //asignando los observables
    this.isLoading$ = this.store.select(DocumentsState.isLoading);
    this.documentsError$ = this.store.select(DocumentsState.documentsError);
    this.selectedDocument$ = this.store.select(DocumentsState.selectedDocument);

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
    combineLatest([
      this.store.select(DocumentsState.allDocuments), //obtiene todos los docs del estado
      this.store.select(DocumentsState.filterTenantId).pipe(
        startWith(this.store.selectSnapshot(DocumentsState.filterTenantId)), //asegrar que el valor inicial se propague
        filter(tenantId => tenantId !== undefined)//filtrar undefined si lo ubiera
      ),
      this.store.select(AuthState.userTenantId).pipe(
        filter(userTenantId => userTenantId !== null)
      )
    ]).pipe(
      debounceTime(50), //evita calculos excesivos
      takeUntil(this.destroy$),
      map(([allDocs, stateFilterTenantId, userTenantId]) => {
        //primero se filtra por el tenant que está establecido en el estado (deberia ser el del usuari)
        const tenantFilteredDocs = allDocs.filter(doc => doc.tenantId === userTenantId);
        this.allDocumentsForCurrentTenant = tenantFilteredDocs; //guarda la lista para busqueda local


        //luego aplicar la busqueda local
        const query = this.searchQuery.toLowerCase().trim();
        if (!query) {
          return tenantFilteredDocs;
        } else {
          return tenantFilteredDocs.filter(doc =>
            doc.name.toLowerCase().includes(query) ||
            doc.type.toLowerCase().includes(query) ||
            doc.tags.some(tag => tag.toLowerCase().includes(query))
          );
        }
      })
    ).subscribe(finalDocs => {
      this.filteredAndSearchedDocuments = finalDocs;
      console.log('Documents updated after filter/search:', this.filteredAndSearchedDocuments);
    });
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

  saveDocument(): void {
    if (this.isEditMode) {
      this.documentService.simulatedUpdateDocument(this.currentDocumentForm).subscribe({
        next: () => console.log('Documento actualizado satisfactoriamente'),
        error: (err) => console.error('Error en la actualización del documento', err)
      });
    } else {
      this.documentService.simulatedAddDocument(this.currentDocumentForm).subscribe({
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



  applySearchFilter(): void {
    // No hace falta implementar lógica aquí, el combineLatest ya se suscribe
    // a los cambios de `this.searchQuery` a través del stream que le añadimos.
    // Solo si el debounceTime es demasiado largo y necesitas una actualización instantánea,
    // podrías forzar una reevaluación, pero con debounceTime(300) y el stream de searchQuery
    // en combineLatest, debería ser suficiente.
  }
  // En src/app/features/documents/document-list/document-list.component.ts
  // (o documents.ts si no lo renombraste)
  updateTags(value: string): void { // Cambia de 'event: Event' a 'value: string'
    this.currentDocumentForm.tags = value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
  }

}
