export interface CacheOptions {
  ttl?: number;
  prefix?: string;
}

export interface ICache {
  get(key: string, options?: any): Promise<any>;
  set(key: string, value: any, options?: any): Promise<void>;
} 