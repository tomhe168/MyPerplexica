export interface MCPImageResponse {
  imageUrl: string;
  metadata: {
    format: string;
    width: number;
    height: number;
    style: string;
    created_at: string;
  }
}

export interface MCPClientConfig {
  serverUrl: string;
}

export interface MCPClient {
  convertTextToImage(text: string): Promise<MCPImageResponse>;
} 