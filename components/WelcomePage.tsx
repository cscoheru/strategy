'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { ArrowRight, Briefcase, Building2 } from 'lucide-react';

export default function WelcomePage() {
  const { companyInfo, setCompanyInfo, setShowWelcome } = useStore();
  const [name, setName] = useState(companyInfo.name || '');
  const [industry, setIndustry] = useState(companyInfo.industry || '');

  const handleStart = () => {
    if (!name.trim() || !industry.trim()) {
      alert('请填写完整信息');
      return;
    }
    setCompanyInfo({ name: name.trim(), industry: industry.trim() });
    setShowWelcome(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            企业战略解码工作台
          </h1>
          <p className="text-xl text-gray-600 dark:text-slate-400">
            Strategic Decoding Workbench
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-500 mt-4">
            专业的企业战略规划与执行工具，助您从业绩复盘到落地执行
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center">
            开始您的战略解码之旅
          </h2>

          <div className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                <Building2 className="w-4 h-4 text-primary-500" />
                公司名称
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入您的公司名称"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg
                           bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           transition-all duration-200"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                <Briefcase className="w-4 h-4 text-primary-500" />
                所属行业
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="请输入所属行业（如：互联网、制造业、金融等）"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg
                           bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           transition-all duration-200"
              />
            </div>

            {/* Start Button */}
            <button
              onClick={handleStart}
              className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg
                         flex items-center justify-center gap-2 transition-all duration-200
                         shadow-lg hover:shadow-xl"
            >
              开始使用
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Info */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
            <p className="text-xs text-gray-500 dark:text-slate-500 text-center">
              使用过程中如有问题，请点击右上角设置按钮进行配置
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">4</div>
            <div className="text-sm text-gray-600 dark:text-slate-400">战略解码步骤</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">AI+</div>
            <div className="text-sm text-gray-600 dark:text-slate-400">智能分析</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">1</div>
            <div className="text-sm text-gray-600 dark:text-slate-400">键导出报告</div>
          </div>
        </div>
      </div>
    </div>
  );
}
