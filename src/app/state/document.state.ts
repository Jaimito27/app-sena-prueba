import { Action, Selector, State, StateContext } from "@ngxs/store";
import { DocumentsStateModel } from "../shared/models/document-state.interface";
import { Injectable } from "@angular/core";
import { Document } from '../shared/models/document.interface';


const initialState: DocumentsStateModel = {
  documents: [],
  isLoading: false,
  error: null,
  selectedDocument: null,
  filterTenantId: null,
};

//definiendo las acciones
export class LoadDocuments {
  static readonly type = '[Documents] Load Documents';
  constructor(public tenandId: string | null = null) { } //es opicional para cargar por tenant
}

export class FetchDocumentsSuccess {
  static readonly type = '[Documents] Fetch Documents Success'
  constructor(public documents: Document[]) { }
}

export class FetchDocumentsFailure {
  static readonly type = '[Documents] Fetch Documents Failure'
  constructor(public error: string) { }
}

export class AddDocument {
  static readonly type = '[Documents] Add Document'
  constructor(public document: Document) { }
}

export class UpdateDocument {
  static readonly type = '[Document] Update Document'
  constructor(public document: Document) { }
}

export class DeleteDocument {
  static readonly type = '[Document] Delete Document'
  constructor(public documentId: number) { }
}

export class SelectDocument {
  static readonly type = '[Document] Select Document'
  constructor(public document: Document | null) { }
}

export class SetDocumentFilter {
  static readonly type = '[Document] Set Document Filter';
  constructor(public tenantId: string | null) { }
}

// definir el estado ngxs
@State<DocumentsStateModel>({
  name: 'documents',
  defaults: initialState,
})
@Injectable()
export class DocumentsState {

  //selectores para acceder con facilidad a partes del estados
  @Selector()
  static allDocuments(state: DocumentsStateModel): Document[] {
    return state.documents;
  }

  @Selector()
  static isLoading(state: DocumentsStateModel): boolean {
    return state.isLoading;
  }

  @Selector()
  static documentsError(state: DocumentsStateModel): string | null {
    return state.error;
  }

  @Selector()
  static selectedDocument(state: DocumentsStateModel): Document | null {
    return state.selectedDocument;
  }

  @Selector()
  static filteredDocuments(state: DocumentsStateModel): Document[] {
    if (!state.filterTenantId) {
      return state.documents; // si no hay filtro, los tare todos
    }

    //filtrar por tenantId
    return state.documents.filter(doc => doc.tenantId === state.filterTenantId)
  }

  //manejadores de acciones

  @Action(LoadDocuments)
  loadDocuments(ctx: StateContext<DocumentsStateModel>, action: LoadDocuments) {
    ctx.patchState({
      isLoading: true,
      error: null,
      filterTenantId: action.tenandId // Guardar el tenantId por el que se está cargando
    })// Aquí solo actualizamos el estado de carga y el filtro.

  }

  @Action(FetchDocumentsSuccess)
  fetchDocumentsSuccess(ctx: StateContext<DocumentsStateModel>, action: FetchDocumentsSuccess) {
    ctx.patchState({
      documents: action.documents,
      isLoading: false,
      error: null,
    });
  }

  @Action(FetchDocumentsFailure)
  fetchDocumentsFailure(ctx: StateContext<DocumentsStateModel>, action: FetchDocumentsFailure) {
    ctx.patchState({
      isLoading: false,
      error: action.error,
    });
  }

  @Action(AddDocument)
  addDocument(ctx: StateContext<DocumentsStateModel>, action: AddDocument) {
    const state = ctx.getState();
    const newId = state.documents.length > 0 ? Math.max(...state.documents.map(d => d.id)) + 1 : 1;
    const newDocument = { ...action.document, id: newId };

    ctx.patchState({
      documents: [...state.documents, newDocument],
      selectedDocument: null,
    });
  }

  @Action(UpdateDocument)
  updateDocument(ctx: StateContext<DocumentsStateModel>, action: UpdateDocument) {
    const state = ctx.getState();
    const updatedDocuments = state.documents.map(doc => doc.id === action.document.id ? { ...action.document } : doc);
    ctx.patchState({
      documents: updatedDocuments,
      selectedDocument: null,
    });
  }

  @Action(DeleteDocument)
  deleteDocument(ctx: StateContext<DocumentsStateModel>, action: DeleteDocument) {
    const state = ctx.getState();
    const filteredDocuments = state.documents.filter(doc => doc.id !== action.documentId);

    ctx.patchState({
      documents: filteredDocuments,
      selectedDocument: null,
    });
  }

  @Action(SelectDocument)
  selectDocument(ctx: StateContext<DocumentsStateModel>, action: SelectDocument) {
    ctx.patchState({
      selectedDocument: action.document
    });
  }

  @Action(SetDocumentFilter)
  setDocumentFilter(ctx: StateContext<DocumentsStateModel>, action: SetDocumentFilter) {
    ctx.patchState({
      filterTenantId: action.tenantId,
    })
  }

}
