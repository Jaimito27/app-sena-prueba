import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Document } from '../../shared/models/document.interface';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { AddDocument, DeleteDocument, FetchDocumentsFailure, FetchDocumentsSuccess, UpdateDocument } from '../../state/document.state';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private store = inject(Store)
  private mockDocuments: Document[] = [
    { id: 1, name: 'Contrato A', type: 'pdf', size: 120000, uploadDate: '2023-01-15', userId: 1, tenantId: 'tenant1', tags: ['contrato', 'legal'] },
    { id: 2, name: 'Factura B', type: 'xlsx', size: 50000, uploadDate: '2023-01-20', userId: 1, tenantId: 'tenant1', tags: ['factura', 'finanzas', 'enero'] },
    { id: 3, name: 'Propuesta C', type: 'docx', size: 250000, uploadDate: '2023-02-01', userId: 2, tenantId: 'tenant2', tags: ['propuesta', 'proyecto'] },
    { id: 4, name: 'Imagen D', type: 'jpg', size: 80000, uploadDate: '2023-02-10', userId: 3, tenantId: 'tenant1', tags: ['imagen', 'marketing'] },
    { id: 5, name: 'Informe E', type: 'pdf', size: 300000, uploadDate: '2023-03-05', userId: 4, tenantId: 'tenant2', tags: ['informe', 'trimestral', 'analisis'] },
    { id: 6, name: 'Presupuesto F', type: 'xlsx', size: 75000, uploadDate: '2023-03-12', userId: 1, tenantId: 'tenant1', tags: ['presupuesto', 'finanzas'] },
    { id: 7, name: 'Presentacion G', type: 'pptx', size: 400000, uploadDate: '2023-04-01', userId: 5, tenantId: 'tenant2', tags: ['presentacion', 'ventas'] },
    { id: 8, name: 'Acuerdo H', type: 'pdf', size: 180000, uploadDate: '2023-04-20', userId: 2, tenantId: 'tenant2', tags: ['acuerdo', 'legal'] },
    { id: 9, name: 'Manual I', type: 'pdf', size: 90000, uploadDate: '2023-05-01', userId: 1, tenantId: 'tenant1', tags: ['manual', 'guia'] },
    { id: 10, name: 'Factura X', type: 'xlsx', size: 45000, uploadDate: '2023-05-10', userId: 4, tenantId: 'tenant2', tags: ['factura', 'mayo'] },
  ];

  constructor() { }

  //simulando la obtención de documentos filtrados por tenantId
  getDocumentsByTenant(tenantId: string): Observable<Document[]> {
    console.log('Simulando listado de documentos por tenantId');
    return of(this.mockDocuments).pipe(
      //simulación de un pequeño retraso de red
      tap(() => console.log('Simulando')),
      //filtrando los documentos por tenant para imprimirlos en el html
      map(documents => documents.filter(doc => doc.tenantId === tenantId)),
      tap(filteredDocs => {
        console.log(`DocumentService: Found ${filteredDocs.length} documents for tenantId: ${tenantId}`);
        this.store.dispatch(new FetchDocumentsSuccess(filteredDocs)); //despacha exito
      }),
      catchError(error => {
        const errorMessage = 'Error al cargar los documentos: ' + (error.message || 'Error desconocido');
        console.error('Error durante le ejecución del metodo: ', error)
        this.store.dispatch(new FetchDocumentsFailure(errorMessage)); //despacha un fallo
        return throwError(() => new Error(errorMessage));
      })
    );
  }


  //simulación de una subida de documentos - despachando la acción de ngxs
  simulatedAddDocument(document: Document): Observable<Document> {
    console.log('Simulando añadir documento');
    this.store.dispatch(new AddDocument(document));
    return of({
      ...document, id: this.generateNewDocumentId()
    }).pipe(//devuelve una copia con id simulado
      tap(newDoc => console.log('Simulación de creación exitosa', newDoc))
    )
  }

  private generateNewDocumentId(): number {
    if (this.mockDocuments.length === 0) {
      return 1;
    }
    const maxId = Math.max(...this.mockDocuments.map(d => d.id));
    return maxId + 1;
  }

  simulatedUpdateDocument(document: Document): Observable<Document> {
    console.log('Simulando actualización del documento');
    this.store.dispatch(new UpdateDocument(document));
    return of(document).pipe(
      tap(() => console.log('Simulación de actualización exitosa', document))
    );
  }

  //somulando la eliminación
  simulatedDeleteDocument(documentId: number): Observable<void> {
    console.log('Simulación de eliminación de documentos por Id');
    this.store.dispatch(new DeleteDocument(documentId));
    return of(undefined).pipe(
      tap(() => console.log('Simulado de borrado exitoso: ', documentId))
    )
  }

}
