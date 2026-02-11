'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Step3Data, Target } from '@/types/strategy';
import { generateTargets } from '@/lib/ai-api';
import { Sparkles, Save, ArrowLeft, ArrowRight, Edit2, Check, Plus, Trash2 } from 'lucide-react';

export default function Step3Target() {
  const { data, setData, modelConfig, setStep } = useStore();
  const [targets, setTargets] = useState<Target[]>(data.step3?.targets || []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (data.step3?.targets) {
      setTargets(data.step3.targets);
    }
  }, [data.step3]);

  const handleGenerate = async () => {
    if (!modelConfig.apiKey) {
      alert('请先在设置中配置 AI API Key');
      return;
    }
    if (!data.step1?.summary || !data.step2?.strategicPoints) {
      alert('请先完成前两个步骤');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateTargets(modelConfig, data.step1.summary, data.step2.strategicPoints);
      if (result.length > 0) {
        setTargets(result);
      }
    } catch (error: any) {
      alert(`生成失败: ${error.message || '请检查 API 配置是否正确'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    const step3Data: Step3Data = { targets };
    setData('step3', step3Data);
    alert('数据已保存');
  };

  const handleNext = () => {
    if (targets.length === 0) {
      alert('请先设定目标');
      return;
    }
    handleSave();
    setStep(4);
  };

  const handlePrev = () => {
    handleSave();
    setStep(2);
  };

  const updateTarget = (index: number, field: keyof Target, value: string | number) => {
    const newTargets = [...targets];
    (newTargets[index][field] as any) = value;
    setTargets(newTargets);
  };

  const addTarget = () => {
    const newTarget: Target = {
      name: '新目标',
      type: 'other',
      currentValue: 0,
      targetValue: 0,
      description: '请输入目标描述',
    };
    setTargets([...targets, newTarget]);
  };

  const removeTarget = (index: number) => {
    const newTargets = targets.filter((_, i) => i !== index);
    setTargets(newTargets);
  };

  const getTargetTypeLabel = (type: string) => {
    switch (type) {
      case 'revenue': return '营收';
      case 'market': return '市场';
      default: return '其他';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Step 3: 设定目标
        </h2>
        <p className="text-gray-600 dark:text-slate-400">
          基于业绩复盘和市场机会，制定明年的关键目标
        </p>
      </div>

      {/* Summary from previous steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            业绩复盘要点
          </h3>
          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {data.step1?.summary || '无数据'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            战略机会点
          </h3>
          <ul className="space-y-2">
            {data.step2?.strategicPoints?.map((point, index) => (
              <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                {index + 1}. {point}
              </li>
            )) || <li className="text-sm text-gray-500 dark:text-slate-500">无数据</li>}
          </ul>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          年度目标
        </h3>
        <div className="flex gap-3">
          {isEditing && (
            <button
              onClick={addTarget}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg
                         flex items-center gap-2 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              添加目标
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400
                       text-white font-medium rounded-lg flex items-center gap-2
                       transition-all duration-200"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                AI 生成目标
              </>
            )}
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300
                       hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2
                       transition-all duration-200"
          >
            {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            {isEditing ? '完成编辑' : '编辑'}
          </button>
        </div>
      </div>

      {targets.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-12 text-center">
          <p className="text-gray-500 dark:text-slate-500">点击 "AI 生成目标" 开始</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  目标名称
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  类型
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  当前值
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  目标值
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  描述
                </th>
                {isEditing && (
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                    操作
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {targets.map((target, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={target.name}
                        onChange={(e) => updateTarget(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded
                                   bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                                   focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{target.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <select
                        value={target.type}
                        onChange={(e) => updateTarget(index, 'type', e.target.value as 'revenue' | 'market' | 'other')}
                        className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded
                                   bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                                   focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="revenue">营收</option>
                        <option value="market">市场</option>
                        <option value="other">其他</option>
                      </select>
                    ) : (
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium
                        ${target.type === 'revenue' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          target.type === 'market' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                          'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'}`}>
                        {getTargetTypeLabel(target.type)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="number"
                        value={target.currentValue}
                        onChange={(e) => updateTarget(index, 'currentValue', Number(e.target.value))}
                        className="w-24 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded
                                   bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                                   focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <span className="text-gray-700 dark:text-gray-300">{target.currentValue}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="number"
                        value={target.targetValue}
                        onChange={(e) => updateTarget(index, 'targetValue', Number(e.target.value))}
                        className="w-24 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded
                                   bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                                   focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <span className="text-gray-900 dark:text-gray-100 font-semibold">{target.targetValue}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={target.description}
                        onChange={(e) => updateTarget(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded
                                   bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                                   focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-700 dark:text-gray-300">{target.description}</span>
                    )}
                  </td>
                  {isEditing && (
                    <td className="px-6 py-4">
                      <button
                        onClick={() => removeTarget(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between items-center mt-8">
        <button
          onClick={handlePrev}
          className="px-6 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300
                     hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2
                     transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          上一步
        </button>
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="px-6 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300
                       hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2
                       transition-all duration-200"
          >
            <Save className="w-4 h-4" />
            保存数据
          </button>
          <button
            onClick={handleNext}
            className="px-8 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg
                       flex items-center gap-2 transition-all duration-200"
          >
            下一步
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
