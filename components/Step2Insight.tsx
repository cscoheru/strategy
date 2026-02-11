'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Step2Data, KSFDimension, BenchmarkScore, CustomerInsight, CompetitorAnalysis, CompetitorAdvantage } from '@/types/strategy';
import {
  analyzeCustomerKBF,
  analyzeCompetitorCSF,
  extractKSFDimensions,
  generateBenchmarkScores,
  generateSWOTFromBenchmark
} from '@/lib/zhipu-api';
import AIAnalysisChat from './AIAnalysisChat';
import {
  Save,
  ArrowLeft,
  ArrowRight,
  Edit2,
  Check,
  TrendingUp,
  Users,
  Award,
  Upload,
  X,
  Plus,
  ChevronRight,
  Target,
  BarChart3,
  Search,
  Eye,
  Lightbulb,
  AlertCircle,
  Shield,
  Sparkles
} from 'lucide-react';

export default function Step2Insight() {
  const { data, setData, modelConfig, setStep } = useStore();

  // ========== 原始输入 ==========
  const [trends, setTrends] = useState(data.step2?.trends || '');
  const [competitors, setCompetitors] = useState(data.step2?.competitors || '');
  const [companyInfo, setCompanyInfo] = useState(data.step2?.companyInfo || '');
  const [trendsFile, setTrendsFile] = useState<File | null>(null);
  const [competitorsFile, setCompetitorsFile] = useState<File | null>(null);

  // ========== 客户需求洞察（新增） ==========
  const [customerProfile, setCustomerProfile] = useState(data.step2?.customerInsight?.profile || '');
  const [kbfInput, setKbfInput] = useState('');
  const [customerKbf, setCustomerKbf] = useState<string[]>(data.step2?.customerInsight?.kbf || []);
  const [kbfLocked, setKbfLocked] = useState(data.step2?.customerInsight?.kbfLocked || false);
  const [kbvFeedback, setKbvFeedback] = useState<{ validated: boolean; feedback: string; suggestions: string[] } | null>(null);
  const [isValidatingKBF, setIsValidatingKBF] = useState(false);

  // ========== 竞对深度侦察（新增） ==========
  const [competitorSearchResults, setCompetitorSearchResults] = useState(data.step2?.competitorAnalysis?.searchResults || '');
  const [showCSFModal, setShowCSFModal] = useState(false);
  const [competitorAdvantages, setCompetitorAdvantages] = useState<CompetitorAdvantage[]>(
    data.step2?.competitorAnalysis?.advantages || []
  );
  const [analysisLocked, setAnalysisLocked] = useState(data.step2?.competitorAnalysis?.analysisLocked || false);
  const [isAnalyzingCSF, setIsAnalyzingCSF] = useState(false);

  // ========== KSF 维度 ==========
  const [ksfDimensions, setKsfDimensions] = useState<KSFDimension[]>(data.step2?.ksfDimensions || []);
  const [ksfLocked, setKsfLocked] = useState(data.step2?.ksfLocked || false);
  const [isAnalyzingKSF, setIsAnalyzingKSF] = useState(false);
  const [editingDimension, setEditingDimension] = useState<number | null>(null);
  const [newDimensionName, setNewDimensionName] = useState('');

  // ========== 竞争力对标 ==========
  const [benchmarkScores, setBenchmarkScores] = useState<BenchmarkScore[]>(data.step2?.benchmarkScores || []);
  const [benchmarkLocked, setBenchmarkLocked] = useState(data.step2?.benchmarkLocked || false);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  // ========== SWOT 结果 ==========
  const [swot, setSwot] = useState(data.step2?.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] });
  const [strategicPoints, setStrategicPoints] = useState<string[]>(data.step2?.strategicPoints || []);

  // 数据恢复状态
  const [showDataRestored, setShowDataRestored] = useState(false);

  // 初始化加载 - 确保数据正确恢复
  useEffect(() => {
    const step2Data = data.step2;
    if (step2Data) {
      // 检查是否有有效数据
      const hasData =
        step2Data.trends ||
        step2Data.competitors ||
        step2Data.companyInfo ||
        step2Data.customerInsight?.profile ||
        (step2Data.customerInsight?.kbf && step2Data.customerInsight.kbf.length > 0) ||
        step2Data.ksfDimensions?.length > 0;

      if (hasData) {
        setTrends(step2Data.trends || '');
        setCompetitors(step2Data.competitors || '');
        setCompanyInfo(step2Data.companyInfo || '');

        // 恢复客户洞察数据
        if (step2Data.customerInsight) {
          setCustomerProfile(step2Data.customerInsight.profile || '');
          setCustomerKbf(step2Data.customerInsight.kbf || []);
          setKbfLocked(step2Data.customerInsight.kbfLocked || false);
        }

        // 恢复竞对分析数据
        if (step2Data.competitorAnalysis) {
          setCompetitorSearchResults(step2Data.competitorAnalysis.searchResults || '');
          setCompetitorAdvantages(step2Data.competitorAnalysis.advantages || []);
          setAnalysisLocked(step2Data.competitorAnalysis.analysisLocked || false);
        }

        // 恢复 KSF 维度
        setKsfDimensions(step2Data.ksfDimensions || []);
        setKsfLocked(step2Data.ksfLocked || false);

        // 恢复对标评分
        setBenchmarkScores(step2Data.benchmarkScores || []);
        setBenchmarkLocked(step2Data.benchmarkLocked || false);

        // 恢复 SWOT 结果
        setSwot(step2Data.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] });
        setStrategicPoints(step2Data.strategicPoints || []);

        // 显示数据恢复提示
        setShowDataRestored(true);
        setTimeout(() => setShowDataRestored(false), 3000);
      }
    }
  }, []); // 只在组件挂载时执行一次

  // 文件上传处理（Mock）
  const handleFileUpload = async (file: File | null, type: 'trends' | 'competitors') => {
    if (!file) return;
    setTimeout(() => {
      const mockContent = `[文件内容] ${file.name}\n这是从文件中提取的模拟文本内容。`;
      if (type === 'trends') {
        setTrends(prev => prev + '\n' + mockContent);
      } else {
        setCompetitors(prev => prev + '\n' + mockContent);
      }
      alert(`文件 "${file.name}" 已上传（模拟读取）`);
    }, 500);
  };

  // ========== 客户需求洞察功能 ==========

  // 添加 KBF
  const handleAddKBF = () => {
    if (!kbfInput.trim()) return;
    setCustomerKbf([...customerKbf, kbfInput.trim()]);
    setKbfInput('');
    setKbvFeedback(null); // 清除之前的验证结果
  };

  // 删除 KBF
  const handleDeleteKBF = (index: number) => {
    setCustomerKbf(customerKbf.filter((_, i) => i !== index));
    setKbvFeedback(null);
  };

  // 验证 KBF
  const handleValidateKBF = async () => {
    if (!modelConfig.apiKey) {
      alert('请先配置 AI API Key');
      return;
    }
    if (customerKbf.length === 0) {
      alert('请先至少添加一个 KBF');
      return;
    }

    setIsValidatingKBF(true);
    try {
      const result = await analyzeCustomerKBF(
        modelConfig.apiKey,
        customerProfile,
        customerKbf,
        companyInfo.substring(0, 100) // 简单的行业推断
      );
      setKbvFeedback(result);
    } catch (error: any) {
      alert(`KBF 验证失败: ${error.message}`);
    } finally {
      setIsValidatingKBF(false);
    }
  };

  // 确认 KBF
  const handleConfirmKBF = () => {
    setKbfLocked(true);
  };

  // ========== 竞对深度侦察功能 ==========

  // AI 深度侦察
  const handleDeepReconnaissance = async () => {
    if (!modelConfig.apiKey) {
      alert('请先配置 AI API Key');
      return;
    }
    if (!competitors.trim() && !competitorSearchResults.trim()) {
      alert('请先填写竞对信息或粘贴搜索结果');
      return;
    }

    setIsAnalyzingCSF(true);
    try {
      const advantages = await analyzeCompetitorCSF(
        modelConfig.apiKey,
        competitors,
        competitorSearchResults
      );
      setCompetitorAdvantages(advantages);
      setShowCSFModal(false);
    } catch (error: any) {
      alert(`竞对分析失败: ${error.message}`);
    } finally {
      setIsAnalyzingCSF(false);
    }
  };

  // 手动添加竞对优势
  const handleAddManualAdvantage = () => {
    // 简化版：从竞对描述中提取
    const name = prompt('请输入竞对名称:');
    if (!name) return;
    const advantage = prompt('请输入该竞对的核心优势:');
    if (!advantage) return;

    setCompetitorAdvantages([
      ...competitorAdvantages,
      {
        id: `manual_${Date.now()}`,
        competitorName: name,
        advantage
      }
    ]);
  };

  // 删除竞对优势
  const handleDeleteAdvantage = (id: string) => {
    setCompetitorAdvantages(competitorAdvantages.filter(a => a.id !== id));
  };

  // 确认竞对分析
  const handleConfirmCompetitorAnalysis = () => {
    if (competitorAdvantages.length === 0) {
      alert('请先进行竞对分析或手动添加优势');
      return;
    }
    setAnalysisLocked(true);
  };

  // ========== KSF 提炼功能 ==========

  const handleExtractKSF = async () => {
    if (!modelConfig.apiKey) {
      alert('请先配置 AI API Key');
      return;
    }
    if (!kbfLocked) {
      alert('请先完成客户需求洞察并确认 KBF');
      return;
    }
    if (!analysisLocked) {
      alert('请先完成竞对深度侦察并确认');
      return;
    }
    if (!trends.trim()) {
      alert('请先填写行业趋势');
      return;
    }

    setIsAnalyzingKSF(true);
    try {
      const dimensions = await extractKSFDimensions(
        modelConfig.apiKey,
        trends,
        companyInfo,
        customerKbf,
        competitorAdvantages
      );
      setKsfDimensions(dimensions);
    } catch (error: any) {
      alert(`KSF 提取失败: ${error.message}`);
    } finally {
      setIsAnalyzingKSF(false);
    }
  };

  // ========== 竞争力对标功能 ==========

  const handleBenchmark = async () => {
    if (!modelConfig.apiKey) {
      alert('请先配置 AI API Key');
      return;
    }
    if (ksfDimensions.length === 0) {
      alert('请先提炼 KSF 维度');
      return;
    }

    setIsBenchmarking(true);
    try {
      const scores = await generateBenchmarkScores(
        modelConfig.apiKey,
        ksfDimensions,
        competitors,
        companyInfo
      );
      setBenchmarkScores(scores);
    } catch (error: any) {
      alert(`对标分析失败: ${error.message}`);
    } finally {
      setIsBenchmarking(false);
    }
  };

  // ========== SWOT 生成功能 ==========

  const handleGenerateSWOT = async () => {
    if (!modelConfig.apiKey) {
      alert('请先配置 AI API Key');
      return;
    }

    setIsBenchmarking(true);
    try {
      const result = await generateSWOTFromBenchmark(
        modelConfig.apiKey,
        benchmarkScores,
        trends,
        companyInfo
      );
      setSwot(result.swot);
      setStrategicPoints(result.strategicPoints);
    } catch (error: any) {
      alert(`SWOT 生成失败: ${error.message}`);
    } finally {
      setIsBenchmarking(false);
    }
  };

  // ========== 其他功能 ==========

  const handleAddDimension = () => {
    if (!newDimensionName.trim()) return;
    const newDim: KSFDimension = {
      id: `custom_${Date.now()}`,
      name: newDimensionName,
      description: '自定义维度',
      reasoning: '用户手动添加'
    };
    setKsfDimensions([...ksfDimensions, newDim]);
    setNewDimensionName('');
  };

  const handleDeleteDimension = (id: string) => {
    setKsfDimensions(ksfDimensions.filter(d => d.id !== id));
  };

  const handleUpdateScore = (dimensionId: string, field: 'myScore' | 'competitorScore', value: number) => {
    setBenchmarkScores(benchmarkScores.map(s =>
      s.dimensionId === dimensionId ? { ...s, [field]: value } : s
    ));
  };

  // 保存数据
  const handleSave = () => {
    const step2Data: Step2Data = {
      trends,
      competitors,
      companyInfo,
      customerInsight: {
        profile: customerProfile,
        kbf: customerKbf,
        kbfLocked
      },
      competitorAnalysis: {
        advantages: competitorAdvantages,
        searchResults: competitorSearchResults,
        analysisLocked
      },
      ksfDimensions,
      ksfLocked,
      benchmarkScores,
      benchmarkLocked,
      swot,
      strategicPoints
    };
    setData('step2', step2Data);
    alert('数据已保存');
  };

  // 下一步
  const handleNext = () => {
    if (strategicPoints.length === 0) {
      alert('请先生成 SWOT 和战略机会点');
      return;
    }
    handleSave();
    setStep(3);
  };

  // 上一步
  const handlePrev = () => {
    handleSave();
    setStep(1);
  };

  // 计算当前进度
  const calculateProgress = () => {
    let completed = 0;
    let total = 5;

    if (trends.trim()) completed++;
    if (customerProfile.trim() && customerKbf.length >= 3 && kbfLocked) completed++;
    if (competitorAdvantages.length >= 2 && analysisLocked) completed++;
    if (ksfDimensions.length >= 3 && ksfLocked) completed++;
    if (benchmarkScores.length >= 3) completed++;

    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const progress = calculateProgress();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 数据恢复提示 */}
      {showDataRestored && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                数据已恢复
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                上次的输入和分析结果已自动加载，您可以继续之前的工作
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 进度指示器 */}
      <div className="mb-6 p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            当前进度
          </h3>
          <span className="text-sm text-gray-600 dark:text-slate-400">
            {progress.completed}/{progress.total} 完成 ({progress.percentage}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mb-3">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          <div className={`p-2 rounded text-center ${trends.trim() ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
            1. 行业趋势
          </div>
          <div className={`p-2 rounded text-center ${customerProfile.trim() && customerKbf.length >= 3 && kbfLocked ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
            2. 客户洞察
          </div>
          <div className={`p-2 rounded text-center ${competitorAdvantages.length >= 2 && analysisLocked ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
            3. 竞对分析
          </div>
          <div className={`p-2 rounded text-center ${ksfDimensions.length >= 3 && ksfLocked ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
            4. KSF 提炼
          </div>
          <div className={`p-2 rounded text-center ${benchmarkScores.length >= 3 ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
            5. 竞争对标
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Step 2: 行业竞争力建模与对标
        </h2>
        <p className="text-gray-600 dark:text-slate-400">
          客户洞察 → 竞对侦察 → KSF 提炼 → 竞争力对标 → SWOT 生成
        </p>
      </div>

      {/* ========== 阶段 1: 数据收集与深度分析 ========== */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-sm">1</span>
          数据收集与深度分析
        </h3>

        <div className="grid grid-cols-1 gap-6">
          {/* 1.1 行业趋势 */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
            <label className="flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary-500" />
                行业趋势
              </div>
            </label>
            <textarea
              value={trends}
              onChange={(e) => setTrends(e.target.value)}
              placeholder="请描述行业发展趋势、政策变化、技术革新等..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg
                         bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-primary-500
                         resize-none transition-all duration-200"
            />

            {/* AI 助手 */}
            <div className="mt-4">
              <AIAnalysisChat
                apiKey={modelConfig.apiKey}
                module="trends"
                title="行业趋势分析助手"
                placeholder="例如：行业正经历数字化转型..."
                currentValue={trends}
                onValueChange={setTrends}
                onAnalysisComplete={(data) => {
                  if (data.length > 0) {
                    setTrends(prev => prev ? prev + '\n' + data.join('\n') : data.join('\n'));
                  }
                }}
              />
            </div>
          </div>

          {/* 1.2 客户需求洞察（新增模块） */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              <Eye className="w-4 h-4 text-blue-500" />
              客户需求洞察
              <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                新增
              </span>
            </div>

            {/* 典型客户画像 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                典型客户画像
              </label>
              <textarea
                value={customerProfile}
                onChange={(e) => setCustomerProfile(e.target.value)}
                placeholder="描述核心买单的人是谁？例如：华东地区中小制造企业的采购经理，35-45岁，关注性价比..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg
                           bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           resize-none transition-all duration-200"
              />

              {/* 客户画像 AI 助手 */}
              <div className="mt-2">
                <AIAnalysisChat
                  apiKey={modelConfig.apiKey}
                  module="customer"
                  title="客户画像分析助手"
                  placeholder="例如：核心客户是华东地区中小制造企业..."
                  currentValue={customerProfile}
                  onValueChange={setCustomerProfile}
                  onAnalysisComplete={(data) => {
                    if (data.length > 0) {
                      setCustomerProfile(prev => prev ? prev + '\n' + data.join('\n') : data.join('\n'));
                    }
                  }}
                />
              </div>
            </div>

            {/* 关键购买因素 (KBF) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                关键购买因素 (KBF)
                <span className="ml-2 text-xs text-gray-500 dark:text-slate-400">
                  客户在做购买决策时最看重哪 3-5 点？
                </span>
              </label>

              {!kbfLocked ? (
                <div className="space-y-3">
                  {/* KBF 标签列表 */}
                  {customerKbf.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {customerKbf.map((kbf, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20
                                     border border-blue-200 dark:border-blue-800 rounded-full"
                        >
                          <span className="text-sm text-blue-700 dark:text-blue-300">{kbf}</span>
                          <button
                            onClick={() => handleDeleteKBF(index)}
                            className="text-blue-500 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 添加 KBF 输入框 */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={kbfInput}
                      onChange={(e) => setKbfInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddKBF()}
                      placeholder="例如：账期、次品率、交付周期..."
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg
                                 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100
                                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddKBF}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg
                                 flex items-center gap-2 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      添加
                    </button>
                  </div>

                  {/* 验证和确认按钮 */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleValidateKBF}
                      disabled={isValidatingKBF || customerKbf.length === 0}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400
                                 text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                      {isValidatingKBF ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          验证中...
                        </>
                      ) : (
                        <>
                          <Lightbulb className="w-4 h-4" />
                          AI 验证 KBF
                        </>
                      )}
                    </button>

                    {kbvFeedback?.validated && (
                      <button
                        onClick={handleConfirmKBF}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg
                                   flex items-center gap-2 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        确认 KBF
                      </button>
                    )}
                  </div>

                  {/* 验证反馈 */}
                  {kbvFeedback && (
                    <div className={`p-4 rounded-lg ${
                      kbvFeedback.validated
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                    }`}>
                      <div className="flex items-start gap-2">
                        {kbvFeedback.validated ? (
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 dark:text-gray-300">{kbvFeedback.feedback}</p>
                          {kbvFeedback.suggestions.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                建议补充：
                              </p>
                              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                {kbvFeedback.suggestions.map((suggestion, i) => (
                                  <li key={i}>• {suggestion}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20
                               border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        KBF 已确认 ({customerKbf.length} 条)
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {customerKbf.join('、')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setKbfLocked(false)}
                    className="text-sm text-gray-600 dark:text-slate-400 hover:text-blue-500"
                  >
                    解锁修改
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 1.3 竞对深度侦察（升级模块） */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                <Shield className="w-4 h-4 text-orange-500" />
                竞对深度侦察
                <span className="ml-2 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs rounded-full">
                  升级
                </span>
              </div>
            </div>

            {/* 基础竞对信息 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                竞对基本信息
              </label>
              <textarea
                value={competitors}
                onChange={(e) => setCompetitors(e.target.value)}
                placeholder="请描述主要竞争对手的情况、市场份额、优劣势等..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg
                           bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-orange-500
                           resize-none transition-all duration-200"
              />
            </div>

            {/* 网络搜索结果粘贴区 */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Search className="w-4 h-4" />
                网络搜索结果（可选）
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  将搜索到的竞对新闻/财报粘贴到这里
                </span>
              </label>
              <textarea
                value={competitorSearchResults}
                onChange={(e) => setCompetitorSearchResults(e.target.value)}
                placeholder="粘贴从搜索引擎、新闻网站、财报等渠道获取的竞对信息..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg
                           bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-orange-500
                           resize-none transition-all duration-200 text-sm"
              />

              {/* 竞对分析 AI 助手 */}
              <div className="mt-2">
                <AIAnalysisChat
                  apiKey={modelConfig.apiKey}
                  module="competitors"
                  title="竞对分析助手"
                  placeholder="例如：主要竞对A公司市场份额30%..."
                  currentValue={competitors}
                  onValueChange={setCompetitors}
                  onAnalysisComplete={(data) => {
                    if (data.length > 0) {
                      setCompetitors(prev => prev ? prev + '\n' + data.join('\n') : data.join('\n'));
                    }
                  }}
                />
              </div>
            </div>

            {/* 操作按钮 */}
            {!analysisLocked ? (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleDeepReconnaissance}
                  disabled={isAnalyzingCSF}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400
                             text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  {isAnalyzingCSF ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      分析中...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      AI 深度侦察
                    </>
                  )}
                </button>

                <button
                  onClick={handleAddManualAdvantage}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg
                             flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  手动添加优势
                </button>

                {competitorAdvantages.length > 0 && (
                  <button
                    onClick={handleConfirmCompetitorAnalysis}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg
                               flex items-center gap-2 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    确认分析结果
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20
                             border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    竞对分析已完成 ({competitorAdvantages.length} 条优势)
                  </p>
                </div>
                <button
                  onClick={() => setAnalysisLocked(false)}
                  className="text-sm text-gray-600 dark:text-slate-400 hover:text-orange-500"
                >
                  解锁修改
                </button>
              </div>
            )}

            {/* 竞对优势清单展示 */}
            {competitorAdvantages.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  竞对优势清单 (CSF)
                </h4>
                <div className="space-y-2">
                  {competitorAdvantages.map((advantage) => (
                    <div
                      key={advantage.id}
                      className="flex items-start justify-between p-3 bg-white dark:bg-slate-800
                                 border border-gray-200 dark:border-slate-600 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {advantage.competitorName}
                          </span>
                          {advantage.category && (
                            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30
                                           text-orange-600 dark:text-orange-400 text-xs rounded-full">
                              {advantage.category}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                          核心优势：{advantage.advantage}
                        </p>
                      </div>
                      {!analysisLocked && (
                        <button
                          onClick={() => handleDeleteAdvantage(advantage.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 1.4 本公司信息 */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              <Award className="w-4 h-4 text-primary-500" />
              本公司详细信息
            </label>
            <textarea
              value={companyInfo}
              onChange={(e) => setCompanyInfo(e.target.value)}
              placeholder="请描述公司的现状、财务状况、技术实力、团队规模等关键信息..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg
                         bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-primary-500
                         resize-none transition-all duration-200"
            />

            {/* 公司信息 AI 助手 */}
            <div className="mt-4">
              <AIAnalysisChat
                apiKey={modelConfig.apiKey}
                module="company"
                title="企业诊断助手"
                placeholder="例如：公司成立于2020年，目前团队规模50人..."
                currentValue={companyInfo}
                onValueChange={setCompanyInfo}
                onAnalysisComplete={(data) => {
                  if (data.length > 0) {
                    setCompanyInfo(prev => prev ? prev + '\n' + data.join('\n') : data.join('\n'));
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========== 阶段 2: KSF 提炼（带推导理由） ========== */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-sm">2</span>
          提炼行业关键成功要素 (KSF)
          <span className="ml-2 text-xs font-normal text-gray-500 dark:text-slate-400">
            公式：KSF = 满足客户 KBF 的能力 + 抵御竞对 CSF 的能力
          </span>
        </h3>

        {/* 前置条件提示 */}
        {(!kbfLocked || !analysisLocked) && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                  请先完成前置分析
                </p>
                <ul className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 space-y-1">
                  {!kbfLocked && <li>• 完成客户需求洞察并确认 KBF</li>}
                  {!analysisLocked && <li>• 完成竞对深度侦察并确认</li>}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center mb-6">
          <button
            onClick={handleExtractKSF}
            disabled={isAnalyzingKSF || ksfLocked || !kbfLocked || !analysisLocked}
            className="px-8 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed
                       text-white font-semibold rounded-lg flex items-center gap-2 transition-all duration-200"
          >
            {isAnalyzingKSF ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                分析中...
              </>
            ) : (
              <>
                <Target className="w-5 h-5" />
                基于逻辑链提炼 KSF
              </>
            )}
          </button>
        </div>

        {ksfDimensions.length > 0 && (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                AI 推荐的 KSF 维度（含推导理由）
              </h4>
              {!ksfLocked && (
                <div className="text-sm text-gray-600 dark:text-slate-400">
                  可以编辑、删除或添加维度
                </div>
              )}
            </div>

            <div className="space-y-4 mb-4">
              {ksfDimensions.map((dim, index) => (
                <div
                  key={dim.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    ksfLocked
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      {editingDimension === index ? (
                        <input
                          type="text"
                          value={dim.name}
                          onChange={(e) => {
                            const newDims = [...ksfDimensions];
                            newDims[index].name = e.target.value;
                            setKsfDimensions(newDims);
                          }}
                          onBlur={() => setEditingDimension(null)}
                          onKeyPress={(e) => e.key === 'Enter' && setEditingDimension(null)}
                          className="bg-white dark:bg-slate-800 px-3 py-1 rounded text-sm
                                     focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
                          autoFocus
                        />
                      ) : (
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                          {dim.name}
                        </h5>
                      )}
                    </div>
                    {!ksfLocked && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingDimension(index)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-slate-600 rounded"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteDimension(dim.id)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                          title="删除"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                    {dim.description}
                  </p>

                  {/* 推导理由（新增显示） */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                          推导理由
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          {dim.reasoning}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 添加自定义维度 */}
            {!ksfLocked && (
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newDimensionName}
                  onChange={(e) => setNewDimensionName(e.target.value)}
                  placeholder="添加自定义维度..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg
                             bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddDimension()}
                />
                <button
                  onClick={handleAddDimension}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200
                             dark:hover:bg-slate-600 rounded-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  添加
                </button>
              </div>
            )}

            {!ksfLocked ? (
              <button
                onClick={() => setKsfLocked(true)}
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                <Check className="w-4 h-4 inline mr-2" />
                确认锁定维度
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">维度已锁定</span>
                <button
                  onClick={() => setKsfLocked(false)}
                  className="ml-4 text-sm text-gray-600 dark:text-slate-400 hover:text-primary-500"
                >
                  解锁
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========== 阶段 3: 竞争力对标 ========== */}
      {ksfLocked && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-sm">3</span>
            竞争力对标打分
          </h3>

          <div className="flex justify-center mb-6">
            <button
              onClick={handleBenchmark}
              disabled={isBenchmarking}
              className="px-8 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed
                         text-white font-semibold rounded-lg flex items-center gap-2 transition-all duration-200"
            >
              {isBenchmarking ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  分析中...
                </>
              ) : benchmarkScores.length > 0 ? (
                <>
                  <BarChart3 className="w-5 h-5" />
                  重新分析
                </>
              ) : (
                <>
                  <BarChart3 className="w-5 h-5" />
                  开始对标分析
                </>
              )}
            </button>
          </div>

          {benchmarkScores.length > 0 && (
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  竞争力评分对比
                </h4>
                {!benchmarkLocked && (
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    可拖动滑块调整评分
                  </p>
                )}
              </div>

              <div className="space-y-6">
                {benchmarkScores.map((score) => {
                  const myScoreColor = score.myScore >= 7 ? 'bg-green-500' : score.myScore >= 5 ? 'bg-yellow-500' : 'bg-red-500';
                  const competitorColor = score.competitorScore >= 7 ? 'bg-green-500' : score.competitorScore >= 5 ? 'bg-yellow-500' : 'bg-red-500';

                  return (
                    <div key={score.dimensionId} className="border-b border-gray-200 dark:border-slate-700 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{score.dimensionName}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${
                          score.ranking === 'high' ? 'bg-green-500' : score.ranking === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}>
                          {score.ranking === 'high' ? '高' : score.ranking === 'medium' ? '中' : '低'}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {/* 我司评分 */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600 dark:text-slate-400">我司评分</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{score.myScore}/10</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="1"
                              max="10"
                              value={score.myScore}
                              onChange={(e) => handleUpdateScore(score.dimensionId, 'myScore', Number(e.target.value))}
                              disabled={benchmarkLocked}
                              className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
                            />
                            <div className={`w-3 h-3 rounded-full ${myScoreColor}`} />
                          </div>
                        </div>

                        {/* 竞对评分 */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600 dark:text-slate-400">主要竞对</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{score.competitorScore}/10</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="1"
                              max="10"
                              value={score.competitorScore}
                              onChange={(e) => handleUpdateScore(score.dimensionId, 'competitorScore', Number(e.target.value))}
                              disabled={benchmarkLocked}
                              className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
                            />
                            <div className={`w-3 h-3 rounded-full ${competitorColor}`} />
                          </div>
                        </div>
                      </div>

                      {!benchmarkLocked && (
                        <button
                          onClick={() => setBenchmarkLocked(true)}
                          className="mt-3 w-full py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          确认评分
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {benchmarkLocked && (
                <div className="mt-6 flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">对标分析已完成</span>
                  <button
                    onClick={() => setBenchmarkLocked(false)}
                    className="ml-4 text-sm text-gray-600 dark:text-slate-400 hover:text-primary-500"
                  >
                    重新调整
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========== 阶段 4: SWOT 生成 ========== */}
      {benchmarkLocked && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-sm">4</span>
            SWOT 分析生成
          </h3>

          {swot.strengths.length === 0 && (
            <div className="flex justify-center mb-6">
              <button
                onClick={handleGenerateSWOT}
                className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg flex items-center gap-2 transition-all duration-200"
              >
                <Target className="w-5 h-5" />
                生成 SWOT 矩阵
              </button>
            </div>
          )}

          {swot.strengths.length > 0 && (
            <>
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  SWOT 分析矩阵
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SwotSection title="优势 (Strengths)" color="green" items={swot.strengths} />
                  <SwotSection title="劣势 (Weaknesses)" color="red" items={swot.weaknesses} />
                  <SwotSection title="机会 (Opportunities)" color="blue" items={swot.opportunities} />
                  <SwotSection title="威胁 (Threats)" color="yellow" items={swot.threats} />
                </div>
              </div>

              {strategicPoints.length > 0 && (
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    战略机会点
                  </h4>
                  <ul className="space-y-3">
                    {strategicPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-medium mt-0.5">
                          {index + 1}
                        </span>
                        <span className="flex-1">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 底部操作按钮 */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrev}
          className="px-6 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          上一步
        </button>
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="px-6 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-all duration-200"
          >
            <Save className="w-4 h-4" />
            保存数据
          </button>
          <button
            onClick={handleNext}
            disabled={strategicPoints.length === 0}
            className="px-8 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg flex items-center gap-2 transition-all duration-200"
          >
            下一步
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SwotSection({
  title,
  color,
  items
}: {
  title: string;
  color: 'green' | 'red' | 'blue' | 'yellow';
  items: string[];
}) {
  const colorClasses = {
    green: 'border-green-500 bg-green-50 dark:bg-green-900/20',
    red: 'border-red-500 bg-red-50 dark:bg-red-900/20',
    blue: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    yellow: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  };

  return (
    <div className={`border-l-4 p-4 rounded-r-lg ${colorClasses[color]}`}>
      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
