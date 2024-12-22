// 放在 ui/app/settings/focus-modes 目录下 
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Table, Button, Modal, Form, Input, message, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { focusModesApi } from '@/lib/api/focus-modes';
import type { FocusMode } from '@/types/focus-mode';

const FocusModesPage = () => {
  const [modes, setModes] = useState<FocusMode[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMode, setEditingMode] = useState<FocusMode | null>(null);
  const [form] = Form.useForm();

  // 加载数据
  const loadModes = async () => {
    try {
      console.log('开始加载 Focus Modes 数据');
      setLoading(true);
      const modes = await focusModesApi.getAll();
      console.log('获取到的数据:', modes);
      setModes(modes);
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('组件加载，调用 loadModes');
    loadModes();
  }, []);

  // 表格列定义
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'API来源',
      dataIndex: 'apiEndpoint',
      key: 'apiEndpoint',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: FocusMode) => (
        <div className="space-x-2">
          <Button 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  // 处理函数
  const handleSubmit = async (values: any) => {
    console.log('提交表单，数据:', values);
    try {
      setLoading(true);
      if (editingMode) {
        console.log('更新模式:', editingMode.id, values);
        await focusModesApi.update(editingMode.id, values);
        console.log('更新成功');
        message.success('更新成功');
      } else {
        console.log('创建新模式:', values);
        await focusModesApi.create(values);
        console.log('创建成功');
        message.success('创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      await loadModes();
    } catch (error) {
      console.error('操作失败:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (mode: FocusMode) => {
    console.log('编辑模式:', mode);
    setEditingMode(mode);
    form.setFieldsValue(mode);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    console.log('删除模式:', id);
    try {
      await focusModesApi.delete(id);
      console.log('删除成功');
      message.success('删除成功');
      loadModes();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  const handleToggle = async (id: string) => {
    console.log('切换模式状态:', id);
    try {
      await focusModesApi.toggle(id);
      console.log('切换状态成功');
      loadModes();
    } catch (error) {
      console.error('切换状态失败:', error);
      message.error('切换状态失败');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Focus Mode 管理</h1>
        <Button 
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            console.log('点击新建按钮');
            setEditingMode(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          新建模式
        </Button>
      </div>

      <Table 
        columns={columns}
        dataSource={modes}
        loading={loading}
        rowKey="id"
        pagination={false}
      />

      <Modal
        title={editingMode ? '编辑模式' : '新建模式'}
        open={modalVisible}
        onCancel={() => {
          console.log('关闭模态框');
          setModalVisible(false);
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            console.log('表单完成，准备提交:', values);
            handleSubmit(values);
          }}
        >
          <Form.Item
            name="name"
            label="名称"
            rules={[
              { required: true, message: '请输入名称' },
              { max: 50, message: '名称不能超过50个字符' }
            ]}
          >
            <Input onChange={(e: ChangeEvent<HTMLInputElement>) => console.log('名称输入:', e.target.value)} />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea 
              rows={4} 
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => console.log('描述输入:', e.target.value)}
            />
          </Form.Item>

          <Form.Item
            name="apiEndpoint"
            label="API来源"
            rules={[
              { required: true, message: '请输入API来源' },
              { type: 'url', message: '请输入有效的URL' }
            ]}
          >
            <Input onChange={(e) => console.log('API来源输入:', e.target.value)} />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Button 
              className="mr-2" 
              onClick={() => {
                console.log('点击取消按钮');
                setModalVisible(false);
              }}
            >
              取消
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              onClick={() => console.log('点击确定按钮')}
            >
              确定
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FocusModesPage;