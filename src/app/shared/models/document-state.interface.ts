import { Document } from "./document.interface";

export interface DocumentsStateModel {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  selectedDocument: Document | null; //para ver detalles o editar
  filterTenantId: string | null; //para filtrar documentos por en tenant en el estado
}
