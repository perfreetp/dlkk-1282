import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Settings,
  User,
  Star,
  Palette,
  BarChart3,
  Users,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
} from 'lucide-react';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Tag } from '../../components/common/Tag';
import { useUserStore } from '../../stores/userStore';
import { useStatsStore } from '../../stores/statsStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const menuItems = [
  { path: '/account', icon: User, label: '个人设置', description: '修改个人信息' },
  { path: '/account/brand', icon: Palette, label: '品牌语气', description: '管理品牌调性规则' },
  { path: '/account/templates', icon: Star, label: '模板收藏', description: '收藏常用模板' },
  { path: '/account/stats', icon: BarChart3, label: '使用统计', description: '查看使用数据' },
  { path: '/account/team', icon: Users, label: '团队管理', description: '管理团队成员' },
];

export const Account: React.FC = () => {
  const location = useLocation();
  const { user, brandTones, templates, loadUserData, initializeUser } = useUserStore();
  const { totalCount, successCount, weeklyStats, loadWeeklyStats, topFunctions } = useStatsStore();

  useEffect(() => {
    initializeUser();
    loadUserData();
    loadWeeklyStats();
  }, []);

  const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;

  const chartData = weeklyStats.map((stat) => ({
    date: stat.date.slice(5),
    count: stat.count,
    success: stat.successCount,
  }));

  const activeTab = location.pathname;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">账号中心</h1>
        <p className="text-gray-600 mt-1">管理个人信息、品牌规则和数据统计</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardBody className="p-4">
              <nav className="space-y-1">
                {menuItems.map(({ path, icon: Icon, label, description }) => {
                  const isActive = activeTab === path;
                  return (
                    <Link
                      key={path}
                      to={path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div className="flex-1">
                        <div className="font-medium">{label}</div>
                        <div className="text-xs text-gray-500">{description}</div>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  );
                })}
              </nav>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {activeTab === '/account' && (
            <>
              <Card>
                <CardBody className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">个人设置</h2>
                  <div className="space-y-6 max-w-2xl">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <Button variant="secondary" size="sm">
                          更换头像
                        </Button>
                      </div>
                    </div>

                    <Input
                      label="用户名"
                      placeholder="输入用户名"
                      defaultValue={user?.name || ''}
                    />

                    <Input
                      label="邮箱"
                      type="email"
                      placeholder="输入邮箱"
                      defaultValue={user?.email || ''}
                    />

                    <Input
                      label="角色"
                      value={user?.role === 'supervisor' ? '运营主管' : '运营专员'}
                      disabled
                    />

                    <div className="flex gap-3 pt-4">
                      <Button>保存修改</Button>
                      <Button variant="ghost">取消</Button>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">安全设置</h2>
                  <div className="space-y-6 max-w-2xl">
                    <Input
                      label="当前密码"
                      type="password"
                      placeholder="输入当前密码"
                    />
                    <Input
                      label="新密码"
                      type="password"
                      placeholder="输入新密码"
                    />
                    <Input
                      label="确认新密码"
                      type="password"
                      placeholder="再次输入新密码"
                    />
                    <Button>修改密码</Button>
                  </div>
                </CardBody>
              </Card>
            </>
          )}

          {activeTab === '/account/brand' && (
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">品牌语气库</h2>
                  <Button leftIcon={<Plus className="w-4 h-4" />}>
                    添加规则
                  </Button>
                </div>

                {brandTones.length > 0 ? (
                  <div className="space-y-4">
                    {brandTones.map((tone) => (
                      <div
                        key={tone.id}
                        className="p-4 bg-gray-50 rounded-xl flex items-start justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {tone.name}
                            </h3>
                            <Tag variant="primary">{tone.style}</Tag>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {tone.description}
                          </p>
                          <div className="flex gap-2">
                            {tone.forbiddenWords.slice(0, 3).map((word, idx) => (
                              <Tag key={idx} variant="danger" size="sm">
                                {word}
                              </Tag>
                            ))}
                            {tone.forbiddenWords.length > 3 && (
                              <Tag variant="default" size="sm">
                                +{tone.forbiddenWords.length - 3}
                              </Tag>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-gray-400" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Palette className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">暂无品牌语气规则</p>
                    <p className="text-sm text-gray-400 mt-1">
                      创建品牌语气规则，让 AI 生成更符合品牌调性的内容
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {activeTab === '/account/templates' && (
            <Card>
              <CardBody className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">模板收藏</h2>

                {templates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {template.name}
                          </h3>
                          <Tag variant="primary" size="sm">
                            {template.type}
                          </Tag>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {template.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            使用 {template.usageCount} 次
                          </span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-gray-400" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">暂无收藏模板</p>
                    <p className="text-sm text-gray-400 mt-1">
                      在生成结果中点击"收藏"按钮，保存常用模板
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {activeTab === '/account/stats' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                  <CardBody className="p-6">
                    <p className="text-primary-100 mb-2">本周使用</p>
                    <p className="text-4xl font-bold">{totalCount}</p>
                    <p className="text-primary-200 text-sm mt-2">次</p>
                  </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-success-500 to-emerald-600 text-white">
                  <CardBody className="p-6">
                    <p className="text-success-100 mb-2">任务成功率</p>
                    <p className="text-4xl font-bold">{successRate}%</p>
                    <p className="text-success-200 text-sm mt-2">成功率</p>
                  </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                  <CardBody className="p-6">
                    <p className="text-orange-100 mb-2">成功次数</p>
                    <p className="text-4xl font-bold">{successCount}</p>
                    <p className="text-orange-200 text-sm mt-2">次</p>
                  </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                  <CardBody className="p-6">
                    <p className="text-purple-100 mb-2">收藏模板</p>
                    <p className="text-4xl font-bold">{templates.length}</p>
                    <p className="text-purple-200 text-sm mt-2">个</p>
                  </CardBody>
                </Card>
              </div>

              <Card>
                <CardBody className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    使用趋势
                  </h3>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#4F46E5" name="使用次数" />
                        <Bar dataKey="success" fill="#10B981" name="成功次数" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      暂无数据
                    </div>
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    功能使用排行
                  </h3>
                  <div className="space-y-3">
                    {topFunctions.map((func, index) => (
                      <div
                        key={func.name}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center font-bold">
                            {index + 1}
                          </span>
                          <span className="font-medium text-gray-900">
                            {func.name}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {func.count} 次
                        </span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </>
          )}

          {activeTab === '/account/team' && (
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">团队管理</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {user?.role === 'supervisor'
                        ? '作为主管，你可以管理团队成员'
                        : '联系主管添加你到团队'}
                    </p>
                  </div>
                  {user?.role === 'supervisor' && (
                    <Button leftIcon={<Plus className="w-4 h-4" />}>
                      添加成员
                    </Button>
                  )}
                </div>

                {user?.role === 'supervisor' ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600">
                          {user.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <Tag variant="primary">主管</Tag>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">你还没有加入团队</p>
                    <p className="text-sm text-gray-400 mt-1">
                      请联系你的主管获取团队邀请
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
