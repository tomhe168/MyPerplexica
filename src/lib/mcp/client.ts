import axios from 'axios';
import { MCPClient, MCPClientConfig, MCPImageResponse } from './types';
import logger from '../../utils/logger';

export class TextToImageClient implements MCPClient {
  private serverUrl: string;

  constructor(config: MCPClientConfig) {
    this.serverUrl = config.serverUrl;
  }

  async convertTextToImage(text: string): Promise<MCPImageResponse> {
    try {
      logger.info('Converting text to image via MCP', { text });
      
      const response = await axios.post<MCPImageResponse>(
        `${this.serverUrl}/text-to-image`,
        { text }
      );

      logger.info('Image generated successfully', { 
        imageUrl: response.data.imageUrl 
      });

      return response.data;
    } catch (error) {
      logger.error('MCP text-to-image conversion failed', error);
      throw error;
    }
  }
} 