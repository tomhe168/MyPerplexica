import express from 'express';
import logger from '../utils/logger';
import { redisCache } from '../lib/cache/redis';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { Embeddings } from '@langchain/core/embeddings';
import { ChatOpenAI } from '@langchain/openai';
import {
  getAvailableChatModelProviders,
  getAvailableEmbeddingModelProviders,
} from '../lib/providers';
import { searchHandlers } from '../websocket/messageHandler';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { MetaSearchAgentType } from '../search/metaSearchAgent';

const router = express.Router();
const CACHE_TTL = 300; // 5分钟缓存

interface chatModel {
  provider: string;
  model: string;
  customOpenAIBaseURL?: string;
  customOpenAIKey?: string;
}

interface embeddingModel {
  provider: string;
  model: string;
}

interface ChatRequestBody {
  optimizationMode: 'speed' | 'balanced';
  focusMode: string;
  chatModel?: chatModel;
  embeddingModel?: embeddingModel;
  query: string;
  history: Array<[string, string]>;
}

router.post('/', async (req, res) => {
  logger.debug('Received request to /api/search');
  try {
    // 在路由开始时添加日志
    logger.info({
      message: 'Received search request',
      body: req.body
    });

    const body: ChatRequestBody = req.body;

    if (!body.focusMode || !body.query) {
      logger.warn({
        message: 'Invalid request - missing focus mode or query',
        body: req.body
      });
      return res.status(400).json({ message: 'Missing focus mode or query' });
    }

    // 生成缓存选项对象
    const cacheOptions = {
      focusMode: body.focusMode,
      optimizationMode: body.optimizationMode
    };

    // 使用 RedisCache 类检查缓存
    const cachedResults = await redisCache.get(body.query, cacheOptions);
    if (cachedResults) {
      logger.info({
        message: 'Cache hit',
        query: body.query,
        focusMode: body.focusMode,
        optimizationMode: body.optimizationMode,
        source: 'redis'
      });
      return res.json(cachedResults);
    }

    logger.info({
      message: 'Cache miss, fetching from search logic',
      query: body.query,
      focusMode: body.focusMode,
      optimizationMode: body.optimizationMode,
      source: 'search_logic',
      cacheKey: `search:${body.focusMode}:${body.optimizationMode}:${body.query}`
    });

    body.history = body.history || [];
    body.optimizationMode = body.optimizationMode || 'balanced';

    const history: BaseMessage[] = body.history.map((msg) => {
      if (msg[0] === 'human') {
        return new HumanMessage({
          content: msg[1],
        });
      } else {
        return new AIMessage({
          content: msg[1],
        });
      }
    });

    const [chatModelProviders, embeddingModelProviders] = await Promise.all([
      getAvailableChatModelProviders(),
      getAvailableEmbeddingModelProviders(),
    ]);

    const chatModelProvider =
      body.chatModel?.provider || Object.keys(chatModelProviders)[0];
    const chatModel =
      body.chatModel?.model ||
      Object.keys(chatModelProviders[chatModelProvider])[0];

    const embeddingModelProvider =
      body.embeddingModel?.provider || Object.keys(embeddingModelProviders)[0];
    const embeddingModel =
      body.embeddingModel?.model ||
      Object.keys(embeddingModelProviders[embeddingModelProvider])[0];

    let llm: BaseChatModel | undefined;
    let embeddings: Embeddings | undefined;

    if (body.chatModel?.provider === 'custom_openai') {
      if (
        !body.chatModel?.customOpenAIBaseURL ||
        !body.chatModel?.customOpenAIKey
      ) {
        return res
          .status(400)
          .json({ message: 'Missing custom OpenAI base URL or key' });
      }

      llm = new ChatOpenAI({
        modelName: body.chatModel.model,
        openAIApiKey: body.chatModel.customOpenAIKey,
        temperature: 0.7,
        configuration: {
          baseURL: body.chatModel.customOpenAIBaseURL,
        },
      }) as unknown as BaseChatModel;
    } else if (
      chatModelProviders[chatModelProvider] &&
      chatModelProviders[chatModelProvider][chatModel]
    ) {
      llm = chatModelProviders[chatModelProvider][chatModel]
        .model as unknown as BaseChatModel | undefined;
    }

    if (
      embeddingModelProviders[embeddingModelProvider] &&
      embeddingModelProviders[embeddingModelProvider][embeddingModel]
    ) {
      embeddings = embeddingModelProviders[embeddingModelProvider][
        embeddingModel
      ].model as Embeddings | undefined;
    }

    if (!llm || !embeddings) {
      return res.status(400).json({ message: 'Invalid model selected' });
    }

    const searchHandler: MetaSearchAgentType = searchHandlers[body.focusMode];

    if (!searchHandler) {
      return res.status(400).json({ message: 'Invalid focus mode' });
    }

    const emitter = await searchHandler.searchAndAnswer(
      body.query,
      history,
      llm,
      embeddings,
      body.optimizationMode,
      [],
    );

    let message = '';
    let sources = [];

    emitter.on('data', (data) => {
      const parsedData = JSON.parse(data);
      if (parsedData.type === 'response') {
        message += parsedData.data;
      } else if (parsedData.type === 'sources') {
        sources = parsedData.data;
      }
    });

    emitter.on('end', async () => {
      const result = { message, sources };
      
      // 使用 RedisCache 类存储结果
      await redisCache.set(body.query, result, cacheOptions);
      
      logger.info({
        message: 'Search completed and cached',
        query: body.query,
        focusMode: body.focusMode,
        optimizationMode: body.optimizationMode
      });
      
      res.status(200).json(result);
    });

    emitter.on('error', (data) => {
      const parsedData = JSON.parse(data);
      res.status(500).json({ message: parsedData.data });
    });
  } catch (err: any) {
    const body = req.body as ChatRequestBody;
    logger.error({
      message: 'Error in search',
      error: err.message,
      query: body?.query,
      focusMode: body?.focusMode,
      optimizationMode: body?.optimizationMode,
      stack: err.stack
    });
    res.status(500).json({ message: 'An error has occurred.' });
  }
});

export default router;
