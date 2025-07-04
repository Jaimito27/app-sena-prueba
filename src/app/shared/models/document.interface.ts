export interface Document {
  id: number;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  userId: number;
  tenantId: string;
  tags: string[]
}
