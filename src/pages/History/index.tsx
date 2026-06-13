import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  FileText,
  MessageSquare,
  MessageCircle,
  Image,
  Star,
  Copy,
  Trash2,
  Filter,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Tag } from '../../components/common/Tag';
import { useTaskStore } from '../../stores/taskStore';
import { formatRelativeTime } from '../../utils/formatters';
import { TaskType } from '../../types';

const typeIcons: Record<TaskType, any> = {
  title: FileText,
  selling_point: FileText,
  sms: MessageCircle,
  review_reply: MessageSquare,
  competitor_analysis: Image,
  image_analysis: Image,
};

const typeLabels: Record<TaskType, string> = {
  title: '标题生成',
  selling_point: '卖点改写',
  sms: '活动短信',
  review_reply: '差评回复',
  competitor_analysis: '竞品分析',
  image_analysis: '图片分析',
};

export const HistoryPage: React.FC = () => {
  const { tasks, loadTasks, deleteTask } = useTaskStore();

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCopyTask = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('确定要删除这条任务记录吗？')) {
      deleteTask(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">历史任务</h1>
          <p className="text-gray-600 mt-1">查看和管理所有生成记录</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" leftIcon={<Filter className="w-4 h-4" />}>
            筛选
          </Button>
        </div>
      </div>

      {tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => {
            const Icon = typeIcons[task.type] || FileText;
            return (
              <Card key={task.id} className="hover:shadow-lg transition-shadow">
                <CardBody className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {typeLabels[task.type]}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(task.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {task.status === 'completed' && (
                        <CheckCircle className="w-5 h-5 text-success-500" />
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">输入内容：</p>
                    <p className="text-gray-900 text-sm line-clamp-2">
                      {task.input}
                    </p>
                  </div>

                  {task.outputs.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-2">
                        生成 {task.outputs.length} 个版本
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {task.outputs[0]?.content}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {task.outputs.length > 0 && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          leftIcon={<Copy className="w-4 h-4" />}
                          onClick={() => handleCopyTask(task.outputs[0]?.content)}
                        >
                          复制
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Star className="w-4 h-4" />}
                        >
                          收藏
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-danger-500" />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-gray-300">
          <CardBody className="p-12 text-center">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无任务记录</h3>
            <p className="text-gray-600 mb-4">
              开始使用 AI 工具箱，生成的内容将自动保存在这里
            </p>
            <Link to="/product">
              <Button leftIcon={<FileText className="w-4 h-4" />}>
                开始使用
              </Button>
            </Link>
          </CardBody>
        </Card>
      )}

      {tasks.length > 0 && (
        <Card className="bg-gray-50">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">统计概览</h3>
                <p className="text-sm text-gray-600 mt-1">最近 7 天的任务数据</p>
              </div>
              <div className="flex gap-8">
                <div>
                  <p className="text-3xl font-bold text-primary-600">{tasks.length}</p>
                  <p className="text-sm text-gray-600">总任务数</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-success-600">
                    {tasks.filter((t) => t.status === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-600">已完成</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-600">
                    {tasks.filter((t) => t.outputs.some((o) => o.isMarked)).length}
                  </p>
                  <p className="text-sm text-gray-600">已采纳</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
