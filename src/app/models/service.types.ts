export interface ServiceOutput {
  id: string;
  title: string;
  description: string;
  price: number;
  durationMinutes: number;
  imageBase64?: string;
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceDto {
  title: string;
  description: string;
  price: number;
  durationMinutes: number;
}

export interface UpdateServiceDto {
  title?: string;
  description?: string;
  price?: number;
  durationMinutes?: number;
}

