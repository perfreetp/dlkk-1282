import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  MessageSquare,
  MessageCircle,
  Image,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { useTaskStore } from '../../stores/taskStore';
import { useStatsStore } from '../../stores/statsStore';
import { useUserStore } from '../../stores/userStore';
import { formatRelativeTime } from '../../utils/formatters';

const features = [
  {
    path: '/product',
    icon: FileText,
    title: '商品文案',
    description: '生成标题、改写卖点、检测敏感词',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    path: '/service',
    icon: MessageSquare,
    title: '客服话术',
    description: '生成差评回复、管理常用话术',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    path: '/sms',
    icon: MessageCircle,
    title: '活动短信',
    description: '生成活动短信、字符统计',
    gradient: 'from-orange-500 to-red-600',
  },
  {
    path: '/image',
    icon: Image,
    title: '图片处理',
    description: '竞品分析、卖点提取',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    path: '/history',
    icon: TrendingUp,
    title: '历史任务',
    description: '查看任务记录、收藏模板',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    path: '/account',
    icon: AlertTriangle,
    title: '账号中心',
    description: '品牌语气、团队管理',
    gradient: 'from-yellow-500 to-orange-600',
  },
];

export const Home: React.FC = () => {
  const { tasks, loadTasks } = useTaskStore();
  const { totalCount, successCount, topFunctions, loadWeeklyStats } = useStatsStore();
  const { user, initializeUser } = useUserStore();

  useEffect(() => {
    initializeUser();
    loadTasks();
    loadWeeklyStats();
  }, []);

  const recentTasks = tasks.slice(0, 5);
  const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-pulse-slow"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-3xl font-bold">欢迎回来，{user?.name || '运营专员'}</h1>
          </div>
          <p className="text-primary-100 text-lg">
            今天有 {tasks.length} 条任务等待处理，加油！
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">快速入口</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {features.map(({ path, icon: Icon, title, description, gradient }) => (
              <Link key={path} to={path}>
                <Card hover className="h-full">
                  <CardBody className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-600">{description}</p>
                    <div className="mt-4 flex items-center text-primary-600 text-sm font-medium">
                      立即使用 <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardBody className="p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                本周统计
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">总使用次数</p>
                  <p className="text-3xl font-bold text-primary-600">{totalCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">任务成功率</p>
                  <p className="text-3xl font-bold text-success-600">{successRate}%</p>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-2">功能使用排行</p>
                  <div className="space-y-2">
                    {topFunctions.slice(0, 3).map((func, index) => (
                      <div key={func.name} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          {index + 1}. {func.name}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {func.count}次
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-600" />
                最新任务
              </h3>
              {recentTasks.length > 0 ? (
                <div className="space-y-3">
                  {recentTasks.map((task) => (
                    <Link
                      key={task.id}
                      to={task.type === 'title' || task.type === 'selling_point' ? '/product' : '/history'}
                      className="block p-3 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {task.type === 'title' && '标题生成'}
                            {task.type === 'selling_point' && '卖点改写'}
                            {task.type === 'sms' && '活动短信'}
                            {task.type === 'review_reply' && '差评回复'}
                            {task.type === 'competitor_analysis' && '竞品分析'}
                            {task.type === 'image_analysis' && '图片分析'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {task.input.slice(0, 30)}
                            {task.input.length > 30 && '...'}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatRelativeTime(task.createdAt)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">暂无任务记录</p>
                  <Link
                    to="/product"
                    className="text-primary-600 text-sm font-medium mt-2 inline-block"
                  >
                    开始你的第一个任务 →
                  </Link>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-success-500 to-emerald-600 text-white">
        <CardBody className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">💡 使用提示</h3>
              <p className="text-success-100">
                收藏常用模板，下次使用更便捷！在历史任务页面可以查看和管理所有生成记录。
              </p>
            </div>
            <Link
              to="/history"
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors"
            >
              查看历史
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
