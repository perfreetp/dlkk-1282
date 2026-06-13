import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  MessageSquare,
  MessageCircle,
  Image,
  History,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useUserStore } from '../../stores/userStore';

const navItems = [
  { path: '/', icon: Home, label: '场景首页' },
  { path: '/product', icon: FileText, label: '商品文案' },
  { path: '/service', icon: MessageSquare, label: '客服话术' },
  { path: '/sms', icon: MessageCircle, label: '活动短信' },
  { path: '/image', icon: Image, label: '图片处理' },
  { path: '/history', icon: History, label: '历史任务' },
  { path: '/account', icon: Settings, label: '账号中心' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useUserStore();

  return (
    <aside className="w-64 bg-gradient-to-b from-primary-600 to-primary-800 text-white flex flex-col">
      <div className="p-6 border-b border-primary-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">AI 工具箱</h1>
            <p className="text-xs text-primary-200">电商店铺运营神器</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path ||
            (path !== '/' && location.pathname.startsWith(path));

          return (
            <NavLink
              key={path}
              to={path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive
                  ? 'bg-white/20 shadow-lg backdrop-blur-sm'
                  : 'hover:bg-white/10'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-primary-500/30">
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="font-semibold text-sm">{user?.name || '用户'}</p>
              <p className="text-xs text-primary-200">
                {user?.role === 'supervisor' ? '主管' : '运营专员'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
