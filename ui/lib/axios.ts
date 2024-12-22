// 创建文件 lib/axios.ts
import axios from 'axios';

// 定制化 Axios 实例
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api',
  timeout: 10000, // 超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
