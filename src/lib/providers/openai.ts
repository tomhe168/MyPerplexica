import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { getOpenaiApiKey } from '../../config';
import logger from '../../utils/logger';

export const loadOpenAIChatModels = async () => {
  const openAIApiKey = getOpenaiApiKey();

  if (!openAIApiKey) return {};

  try {
    const chatModels = {
      'gpt-3.5-turbo': {
        displayName: 'GPT-3.5 Turbo',
        model: new ChatOpenAI({
          configuration: {
            baseURL: "https://api.deepseek.com",
          },
          openAIApiKey,
          modelName: 'deepseek-chat',
          temperature: 0.7,
        }),
      },
      'gpt-4': {
        displayName: 'GPT-4',
        model: new ChatOpenAI({
          configuration: {
            baseURL: "https://api.deepseek.com",
          },
          openAIApiKey,
          modelName: 'deepseek-chat',
          temperature: 0.7,
        }),
      },
      'gpt-4-turbo': {
        displayName: 'GPT-4 turbo',
        model: new ChatOpenAI({
          configuration: {
            baseURL: "https://api.deepseek.com",
          },
          openAIApiKey,
          modelName: 'deepseek-chat',
          temperature: 0.7,
        }),
      },
      'gpt-4o': {
        displayName: 'GPT-4 omni',
        model: new ChatOpenAI({
          configuration: {
            baseURL: "https://api.deepseek.com",
          },
          openAIApiKey,
          modelName: 'deepseek-chat',
          temperature: 0.7,
        }),
      },
      'gpt-4o-mini': {
        displayName: 'GPT-4 omni mini',
        model: new ChatOpenAI({
          configuration: {
            baseURL: "https://api.deepseek.com",
          },
          openAIApiKey,
          modelName: 'deepseek-chat',
          temperature: 0.7,
        }),
      },
    };

    return chatModels;
  } catch (err) {
    logger.error(`Error loading OpenAI models: ${err}`);
    return {};
  }
};

export const loadOpenAIEmbeddingsModels = async () => {
  const openAIApiKey = getOpenaiApiKey();

  if (!openAIApiKey) return {};

  try {
    const embeddingModels = {
      'text-embedding-3-small': {
        displayName: 'Text Embedding 3 Small',
        model: new OpenAIEmbeddings({
          openAIApiKey,
          modelName: 'deepseek-chat',
          configuration: {
            baseURL: "https://api.deepseek.com",
          },
        }),
      },
      'text-embedding-3-large': {
        displayName: 'Text Embedding 3 Large',
        model: new OpenAIEmbeddings({
          openAIApiKey,
          modelName: 'deepseek-chat',
          configuration: {
            baseURL: "https://api.deepseek.com",
          },
        }),
      },
    };

    return embeddingModels;
  } catch (err) {
    logger.error(`Error loading OpenAI embeddings model: ${err}`);
    return {};
  }
};
