import express, { Request, Response } from 'express';
import cors from 'cors';
import { createCanvas, registerFont } from 'canvas'; // 添加 registerFont
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import logger from './logger';

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve();



app.use(cors());
app.use(express.json());
app.use('/images', express.static('images')); // 提供静态文件访问

// MCP 服务描述端点
app.get('/mcp-info', (req: Request, res: Response) => {
  res.json({
    name: 'text-to-image-service',
    version: '1.0.0',
    capabilities: ['text-to-image'],
    endpoints: {
      textToImage: '/text-to-image'
    },
    documentation: `http://localhost:${PORT}/docs`
  });
});

// 文字转图片端点
app.post('/text-to-image', async (req: Request, res: Response) => {
  try {
    const { text, style = 'default' } = req.body;

    if (!text) {
      return res.status(400).json({ error_code: 400, error_message: '文本内容不能为空' });
    }

    // 创建画布
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext('2d');

    // 设置背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 400);


    ctx.fillStyle = '#000000';

    // 文本换行处理
    const words = text.split(' ');
    let line = '';
    let y = 50;
    const lineHeight = 30;
    const maxWidth = 750;

    for (let word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth) {
        ctx.fillText(line, 25, y);
        line = word + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 25, y);

    // 生成唯一文件名
    const fileName = `image_${Date.now()}.png`;
    const filePath = path.join(__dirname, 'images', fileName);

    // 确保 images 目录存在
    await fs.mkdir(path.join(__dirname, 'images'), { recursive: true });

    // 保存图片
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(filePath, buffer);

    // 返回图片URL
    const imageUrl = `http://localhost:${PORT}/images/${fileName}`;
    res.json({
      imageUrl,
      metadata: {
        format: 'png',
        width: 800,
        height: 400,
        style,
        created_at: new Date().toISOString(),
        font: 'Noto Sans SC'
      }
    });
  } catch (error: any) {
    console.error('Error generating image:', error);
    res.status(500).json({
      error_code: 500,
      error_message: '图片生成失败',
      details: error.message
    });
  }
});

// 提供文档页面
app.get('/docs', (req: Request, res: Response) => {
  res.send('<h1>Text-to-Image API Documentation</h1><p>Example usage...</p>');
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
});
