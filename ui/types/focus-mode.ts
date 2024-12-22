// 放在 ui/types 目录下 
export interface FocusMode {
  id: string;
  name: string;
  description?: string;
  apiEndpoint: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFocusModeDto {
  name: string;
  description?: string;
  apiEndpoint: string;
} 