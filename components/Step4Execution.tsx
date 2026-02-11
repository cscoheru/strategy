'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Step4Data, Target } from '@/types/strategy';
import { generateExecutionMap } from '@/lib/ai-api';
import { Sparkles, Save, ArrowLeft, ArrowRight, Edit2, Check, MapPin, Calendar } from 'lucide-react';

export default function Step4Execution() {
  const { data, setData, modelConfig, setStep } = useStore();
  const [keyBattles, setKeyBattles] = useState(data.step4?.keyBattles || []);
  const [quarterlyActions, setQuarterlyActions] = useState(data.step4?.quarterlyActions || []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (data.step4) {
      setKeyBattles(data.step4.keyBattles || []);
      setQuarterlyActions(data.step4.quarterlyActions || []);
    }
  }, [data.step4]);

  const handleGenerate = async () => {
    if (!modelConfig.apiKey) {
      alert('请先在设置中配置 AI API Key');
      return;
    }
    if (!data.step3?.targets || data.step3.targets.length === 0) {
      alert('请先设定目标');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateExecutionMap(modelConfig, data.step3.targets);
      setKeyBattles(result.keyBattles);
      setQuarterlyActions(result.quarterlyActions);
    } catch (error: any) {
      alert(`生成失败: ${error.message || '请检查 API 配置是否正确'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    const step4Data: Step4Data = { keyBattles, quarterlyActions };
    setData('step4', step4Data);
    alert('数据已保存');
  };

  const handleNext = () => {
    if (keyBattles.length === 0 && quarterlyActions.length === 0) {
      alert('请先生成作战地图');
      return;
    }
    handleSave();
    setStep('report');
  };

  const handlePrev = () => {
    handleSave();
    setStep(3);
  };

  const updateKeyBattle = (index: number, field: string, value: string) => {
    const newBattles = [...keyBattles];
    (newBattles[index] as any)[field] = value;
    setKeyBattles(newBattles);
  };

  const updateQuarterlyAction = (index: number, field: string, value: string) => {
    const newActions = [...quarterlyActions];
    (newActions[index] as any)[field] = value;
    setQuarterlyActions(newActions);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Step 4: 任务分解
        </h2>
        <p className="text-gray-600 dark:text-slate-400">
          将年度目标拆解为关键战役和季度行动计划
        </p>
      </div>

      {/* Target summary */}
      {data.step3?.targets && data.step3.targets.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            已确定的目标
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.step3.targets.map((target, index) => (
              <div key={index} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">{target.name}</div>
                <div className="text-sm text-gray-500 dark:text-slate-400">{target.description}</div>
                <div className="mt-2 text-sm">
                  <span className="text-gray-500 dark:text-slate-400">目标:</span>{' '}
                  <span className="font-semibold text-primary-600 dark:text-primary-400">{target.targetValue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          作战地图
        </h3>
        <div className="flex gap-3">
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
                生成作战地图
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

      {keyBattles.length === 0 && quarterlyActions.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-12 text-center">
          <p className="text-gray-500 dark:text-slate-500">点击 "生成作战地图" 开始</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Key Battles */}
          {keyBattles.length > 0 && (
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-primary-500" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  关键战役
                </h4>
              </div>
              <div className="space-y-4">
                {keyBattles.map((battle, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={battle.name}
                          onChange={(e) => updateKeyBattle(index, 'name', e.target.value)}
                          placeholder="战役名称"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg
                                     bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                                     focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                        />
                        <textarea
                          value={battle.description}
                          onChange={(e) => updateKeyBattle(index, 'description', e.target.value)}
                          placeholder="战役描述"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg
                                     bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                                     focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
                        />
                        <input
                          type="text"
                          value={battle.owner}
                          onChange={(e) => updateKeyBattle(index, 'owner', e.target.value)}
                          placeholder="负责人/部门"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg
                                     bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                                     focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                      </div>
                    ) : (
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{battle.name}</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{battle.description}</p>
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                          <span>负责人:</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{battle.owner}</span>
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quarterly Actions */}
          {quarterlyActions.length > 0 && (
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-primary-500" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  季度行动计划
                </h4>
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  {quarterlyActions.map((action, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <select
                        value={action.quarter}
                        onChange={(e) => updateQuarterlyAction(index, 'quarter', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg
                                   bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                                   focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="Q1">Q1</option>
                        <option value="Q2">Q2</option>
                        <option value="Q3">Q3</option>
                        <option value="Q4">Q4</option>
                      </select>
                      <input
                        type="text"
                        value={action.action}
                        onChange={(e) => updateQuarterlyAction(index, 'action', e.target.value)}
                        placeholder="具体行动"
                        className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg
                                   bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                                   focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="text"
                        value={action.deadline}
                        onChange={(e) => updateQuarterlyAction(index, 'deadline', e.target.value)}
                        placeholder="截止时间"
                        className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg
                                   bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                                   focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => {
                    const quarterActions = quarterlyActions.filter(a => a.quarter === quarter);
                    if (quarterActions.length === 0) return null;

                    return (
                      <div key={quarter} className="border-l-4 border-primary-500 pl-4">
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{quarter}</h5>
                        <ul className="space-y-2">
                          {quarterActions.map((action, idx) => (
                            <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                              <span className="text-primary-500">•</span>
                              <span className="flex-1">{action.action}</span>
                              <span className="text-xs text-gray-500 dark:text-slate-500 whitespace-nowrap">
                                {action.deadline}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
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
            生成报告
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
