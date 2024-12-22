import { createClient, RedisClientType } from 'redis';
import { getRedisConfig } from '../../config';
import logger from '../../utils/logger';
import { CacheOptions, ICache } from './types';

export class RedisCache implements ICache {
  private client: RedisClientType;
  private prefix: string;
  private ttl: number;

  constructor(options?: CacheOptions) {
    const config = getRedisConfig();
    this.prefix = options?.prefix || 'search:';
    this.ttl = options?.ttl || config.ttl;

    this.client = createClient({
      url: config.url
    });

    this.client.on('error', err => logger.error('Redis Client Error:', err));
    this.client.on('connect', () => logger.info('Redis Client Connected'));

    this.connect();
  }

  private async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      logger.error('Redis connection error:', error);
      throw error;
    }
  }

  private generateKey(query: string, options?: any): string {
    const baseKey = `${this.prefix}${query}`;
    return options ? `${baseKey}:${JSON.stringify(options)}` : baseKey;
  }

  async get(query: string, options?: any) {
    try {
      const key = this.generateKey(query, options);
      const cached = await this.client.get(key);
      
      if (cached) {
        logger.info(`Cache hit for query: ${query}`);
        return JSON.parse(cached);
      }
      
      logger.info(`Cache miss for query: ${query}`);
      return null;
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  }

  async set(query: string, data: any, options?: any) {
    try {
      const key = this.generateKey(query, options);
      await this.client.setEx(key, this.ttl, JSON.stringify(data));
      logger.info(`Cached result for query: ${query}`);
    } catch (error) {
      logger.error('Redis set error:', error);
    }
  }
}

export const redisCache = new RedisCache(); 