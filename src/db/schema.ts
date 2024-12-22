import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey(),
  content: text('content').notNull(),
  chatId: text('chatId').notNull(),
  messageId: text('messageId').notNull(),
  role: text('type', { enum: ['assistant', 'user'] }),
  metadata: text('metadata', {
    mode: 'json',
  }),
});

interface File {
  name: string;
  fileId: string;
}

export const chats = sqliteTable('chats', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: text('createdAt').notNull(),
  focusMode: text('focusMode').notNull(),
  files: text('files', { mode: 'json' })
    .$type<File[]>()
    .default(sql`'[]'`),
});

export const focusModes = sqliteTable('focus_modes', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  apiEndpoint: text('api_endpoint').notNull(),
  createdAt: integer('created_at').default(Date.now()).notNull(), // 去掉箭头函数
  updatedAt: integer('updated_at').default(Date.now()).notNull(), // 去掉箭头函数
});