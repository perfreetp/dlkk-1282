import React, { useState } from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';

export const TopBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索功能、历史任务..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-6">
          <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors relative group">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full"></span>
            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <h3 className="font-semibold mb-2">新消息</h3>
              <p className="text-sm text-gray-600">暂无新通知</p>
            </div>
          </button>

          <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors group">
            <HelpCircle className="w-5 h-5 text-gray-600" />
            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <h3 className="font-semibold mb-2">帮助中心</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>快捷键：Ctrl+K</p>
                <p>查看使用教程</p>
                <p>联系技术支持</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
