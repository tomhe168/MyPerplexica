import { AxiosResponse } from 'axios';
import axiosInstance from '../axios';
import type { FocusMode, CreateFocusModeDto } from '@/types/focus-mode';

const BASE_URL = '/focus-modes';

interface FocusModesResponse {
  modes: FocusMode[];
}

export const focusModesApi = {
  // 获取所有模式
  getAll: () => 
    axiosInstance.get<FocusModesResponse>(BASE_URL)
    .then((response: AxiosResponse<FocusModesResponse>) => response.data.modes),
    
  // 创建模式
  create: (data: CreateFocusModeDto) => 
    axiosInstance.post<FocusMode>(BASE_URL, data),
    
  // 更新模式
  update: (id: string, data: Partial<CreateFocusModeDto>) => 
    axiosInstance.put<FocusMode>(`${BASE_URL}/${id}`, data),
    
  // 删除模式
  delete: (id: string) => 
    axiosInstance.delete(`${BASE_URL}/${id}`),
    
  // 切换模式状态
  toggle: (id: string) => 
    axiosInstance.patch(`${BASE_URL}/${id}/toggle`)
};