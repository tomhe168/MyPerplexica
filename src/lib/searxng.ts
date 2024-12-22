import axios from 'axios';
import { getSearxngApiEndpoint } from '../config';
import { redisCache } from './cache';

interface SearxngSearchOptions {
  categories?: string[];
  engines?: string[];
  language?: string;
  pageno?: number;
}

export const searchSearxng = async (
  query: string,
  opts?: SearxngSearchOptions,
) => {
  // 尝试从缓存获取
  const cached = await redisCache.get(query, opts);
  if (cached) {
    return cached;
  }

  const searxngURL = getSearxngApiEndpoint();
  const url = new URL(`${searxngURL}/search?format=json`);
  url.searchParams.append('q', query);

  if (opts) {
    Object.keys(opts).forEach((key) => {
      if (Array.isArray(opts[key])) {
        url.searchParams.append(key, opts[key].join(','));
        return;
      }
      url.searchParams.append(key, opts[key]);
    });
  }

  const res = await axios.get(url.toString());
  const results = {
    results: res.data.results,
    suggestions: res.data.suggestions
  };

  // 存入缓存
  await redisCache.set(query, results, opts);

  return results;
};
