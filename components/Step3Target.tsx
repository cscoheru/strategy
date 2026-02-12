'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Step3Data } from '@/types/strategy';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Plus,
  Trash2,
  TrendingUp,
  Target,
  CheckCircle,
  AlertCircle,
  Info,
  Slider
} from 'lucide-react';

// 客户/产品矩阵数据结构
interface MatrixData {
  oldClients: string[];    // 老客户/存量市场
  newClients: string[];    // 新客户/增量市场
  oldProducts: string[];   // 原有产品/服务
  newProducts: string[];   // 新产品/服务
  values: {             // 单元格值
    [key: string]: number;  // 格式: "client_id_product_id": 金额
  };
}

export default function Step3Target() {
  const { data, setData, modelConfig, setStep } = useStore();

  // 从 Step 1 读取核心短板
  const step1Data = data.step1;
  const coreWeakness = step1Data?.rootCause || '未分析';

  // 从 Step 2 读取 SWOT 和策略
  const step2Data = data.step2;
  const swotSummary = step2Data?.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  const strategicDirection = step2Data?.strategicDirection || '未选择';
  const productMatrix = step2Data?.productCustomerMatrix || null;

  // ========== TOWS 策略（从 Step 2 读取）==========
  const towsStrategies = step2Data?.towsStrategies || { so: [], wo: [], st: [], wt: [] };
  const [towsSummary, setTowsSummary] = useState(
    `${towsStrategies.so.map((s, i) => `[SO] ${s}`).join('\n')}\n\n${towsStrategies.wo.map((w, i) => `[WO] ${w}`).join('\n')}\n\n${towsStrategies.st.map((s, i) => `[ST] ${s}`).join('\n')}\n\n${towsStrategies.wt.map((w, i) => `[WT] ${w}`).join('\n')}`
  );

  // ========== 矩阵数据状态 ==========
  const [matrixData, setMatrixData] = useState<MatrixData>(() => {
    // 尝试从 Step3 恢复数据
    const saved = data.step3 as any;
    if (saved?.matrixData) {
      return saved.matrixData;
    }
    // 否则初始化空矩阵
    return {
      oldClients: ['华东区中小制造企业', '华南区贸易公司'],
      newClients: [],
      oldProducts: ['电机轴', '控制器'],
      newProducts: [],
      values: {}
    };
  });

  // ========== 目标测算状态 ==========
  const [confidenceIndex, setConfidenceIndex] = useState(120); // 信心指数 100%-200%
  const [dataUnit, setDataUnit] = useState<'revenue' | 'sales'>('revenue'); // 数据单位
  const [calculatedTargets, setCalculatedTargets] = useState({
    base: 0,      // 保底目标
    standard: 0,   // 达标目标
    challenge: 0    // 挑战目标
  });

  // 数据恢复提示
  const [showDataRestored, setShowDataRestored] = useState(false);

  // 初始化加载
  useEffect(() => {
    const step3Data = data.step3;
    if (step3Data) {
      const hasData = step3Data.matrixData || step3Data.calculatedTargets;
      if (hasData) {
        setShowDataRestored(true);
        setTimeout(() => setShowDataRestored(false), 3000);
      }
    }
  }, []);

  // ========== 矩阵计算函数 ==========

  // 计算指定客户组在指定产品组上的所有值总和
  const calculateRegionSum = (clientType: 'old' | 'new', productType: 'old' | 'new') => {
    const clients = clientType === 'old' ? matrixData.oldClients : matrixData.newClients;
    const products = productType === 'old' ? matrixData.oldProducts : matrixData.newProducts;

    let sum = 0;
    clients.forEach(client => {
      products.forEach(product => {
        const key = `${client}_${product}`;
        sum += matrixData.values[key] || 0;
      });
    });

    return sum;
  };

  // 计算单个客户（所有产品的总和）
  const calculateClientSum = (clientName: string) => {
    let sum = 0;
    [...matrixData.oldProducts, ...matrixData.newProducts].forEach(product => {
      const key = `${clientName}_${product}`;
      sum += matrixData.values[key] || 0;
    });
    return sum;
  };

  // 计算单个产品（所有客户的总和）
  const calculateProductSum = (productName: string) => {
    let sum = 0;
    [...matrixData.oldClients, ...matrixData.newClients].forEach(client => {
      const key = `${client}_${productName}`;
      sum += matrixData.values[key] || 0;
    });
    return sum;
  };

  // ========== 目标计算 ==========

  useEffect(() => {
    // A. 保底目标 = 老客户 × 老产品
    const baseTarget = calculateRegionSum('old', 'old');

    // B. 达标目标 = 所有单元格总和
    let standardTarget = 0;
    Object.values(matrixData.values).forEach(value => {
      standardTarget += value || 0;
    });

    // C. 挑战目标 = 达标目标 × 信心指数
    const challengeTarget = Math.round(standardTarget * (confidenceIndex / 100));

    setCalculatedTargets({
      base: baseTarget,
      standard: standardTarget,
      challenge: challengeTarget
    });
  }, [matrixData, confidenceIndex]);

  // ========== 矩阵操作函数 ==========

  const handleAddClient = (type: 'old' | 'new') => {
    const name = prompt(`请输入${type === 'old' ? '老客户/存量市场' : '新客户/增量市场'}名称:`);
    if (name && name.trim()) {
      if (type === 'old') {
        setMatrixData(prev => ({ ...prev, oldClients: [...prev.oldClients, name.trim()] }));
      } else {
        setMatrixData(prev => ({ ...prev, newClients: [...prev.newClients, name.trim()] }));
      }
    }
  };

  const handleAddProduct = (type: 'old' | 'new') => {
    const name = prompt(`请输入${type === 'old' ? '原有产品/服务' : '新产品/服务'}名称:`);
    if (name && name.trim()) {
      if (type === 'old') {
        setMatrixData(prev => ({ ...prev, oldProducts: [...prev.oldProducts, name.trim()] }));
      } else {
        setMatrixData(prev => ({ ...prev, newProducts: [...prev.newProducts, name.trim()] }));
      }
    }
  };

  const handleRemoveClient = (type: 'old' | 'new', index: number) => {
    if (type === 'old') {
      const client = matrixData.oldClients[index];
      // 清理相关数据
      const newValues = { ...matrixData.values };
      matrixData.oldProducts.forEach(product => {
        delete newValues[`${client}_${product}`];
      });
      setMatrixData(prev => ({
        ...prev,
        oldClients: prev.oldClients.filter((_, i) => i !== index),
        values: newValues
      }));
    } else {
      const client = matrixData.newClients[index];
      const newValues = { ...matrixData.values };
      [...matrixData.oldProducts, ...matrixData.newProducts].forEach(product => {
        delete newValues[`${client}_${product}`];
      });
      setMatrixData(prev => ({
        ...prev,
        newClients: prev.newClients.filter((_, i) => i !== index),
        values: newValues
      }));
    }
  };

  const handleRemoveProduct = (type: 'old' | 'new', index: number) => {
    if (type === 'old') {
      const product = matrixData.oldProducts[index];
      const newValues = { ...matrixData.values };
      [...matrixData.oldClients, ...matrixData.newClients].forEach(client => {
        delete newValues[`${client}_${product}`];
      });
      setMatrixData(prev => ({
        ...prev,
        oldProducts: prev.oldProducts.filter((_, i) => i !== index),
        values: newValues
      }));
    } else {
      const product = matrixData.newProducts[index];
      const newValues = { ...matrixData.values };
      [...matrixData.oldClients, ...matrixData.newClients].forEach(client => {
        delete newValues[`${client}_${product}`];
      });
      setMatrixData(prev => ({
        ...prev,
        newProducts: prev.newProducts.filter((_, i) => i !== index),
        values: newValues
      }));
    }
  };

  const handleCellValueChange = (client: string, product: string, value: number) => {
    setMatrixData(prev => ({
      ...prev,
      values: { ...prev.values, [`${client}_${product}`]: value }
    }));
  };

  // ========== 保存和导航 ==========

  const handleSave = () => {
    const step3Data: Step3Data = {
      matrixData,
      calculatedTargets,
      confidenceIndex
    };
    setData('step3', step3Data);
    alert('数据已保存');
  };

  const handlePrev = () => {
    handleSave();
    setStep(2);
  };

  const handleNext = () => {
    // 验证是否有数据
    const hasData = Object.keys(matrixData.values).length > 0;
    if (!hasData) {
      alert('请至少填写一个营收数据');
      return;
    }
    handleSave();
    setStep(4);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 数据恢复提示 */}
      {showDataRestored && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                数据已恢复
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                上次的客户/产品规划数据已自动加载
              </p>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Step 3: 目标设定
      </h1>
      <p className="text-gray-600 dark:text-slate-400 mb-8">
        基于客户/产品规划矩阵，测算三级目标（保底/达标/挑战）
      </p>

      {/* ========== 顶部上下文信息栏 ========== */}
      <div className="mb-8 space-y-4">
        {/* 核心短板卡片 */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                来自 Step 1 的核心短板
              </h3>
              <p className="text-sm text-orange-800 dark:text-orange-200 leading-relaxed">
                {coreWeakness}
              </p>
            </div>
          </div>
        </div>

        {/* SWOT 和策略卡片 */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SWOT 摘要 */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary-500" />
                SWOT 摘要（来自 Step 2）
              </h3>
              <div className="space-y-2 text-sm">
                {swotSummary.strengths.slice(0, 2).map((s, i) => (
                  <div key={i} className="text-green-700 dark:text-green-300">
                    <span className="font-medium">S:</span> {s}
                  </div>
                ))}
                {swotSummary.weaknesses.slice(0, 2).map((w, i) => (
                  <div key={i} className="text-red-700 dark:text-red-300">
                    <span className="font-medium">W:</span> {w}
                  </div>
                ))}
                {swotSummary.opportunities.slice(0, 2).map((o, i) => (
                  <div key={i} className="text-blue-700 dark:text-blue-300">
                    <span className="font-medium">O:</span> {o}
                  </div>
                ))}
                {swotSummary.threats.slice(0, 2).map((t, i) => (
                  <div key={i} className="text-yellow-700 dark:text-yellow-300">
                    <span className="font-medium">T:</span> {t}
                  </div>
                ))}
                {(swotSummary.strengths.length === 0 && swotSummary.weaknesses.length === 0 && swotSummary.opportunities.length === 0 && swotSummary.threats.length === 0) && (
                  <p className="text-gray-500 dark:text-slate-400 text-xs">暂无 SWOT 数据，请先完成 Step 2</p>
                )}
              </div>
            </div>

            {/* TOWS 交叉策略摘要（新增）========== */}
            {towsStrategies.so.length > 0 && (
              <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <div className="flex items-start gap-3 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1 text-sm">
                      TOWS 交叉策略摘要（来自 Step 2）
                    </h3>
                    <p className="text-xs text-purple-700 dark:text-purple-300">
                      💡 下方展示 AI 生成的 SO/WO/ST/WT 四类交叉策略。您可以在此基础上进行人工修订和总结。
                    </p>
                  </div>
                </div>
                <textarea
                  value={towsSummary}
                  onChange={(e) => setTowsSummary(e.target.value)}
                  className="w-full h-48 px-3 py-2 text-sm border border-purple-300 dark:border-purple-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="TOWS 策略摘要..."
                />
              </div>
            )}
          </div>

            {/* 战略方向 */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary-500" />
                战略方向
              </h3>
              <div className="p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
                <p className="text-sm font-medium text-primary-900 dark:text-primary-100">
                  {strategicDirection === 'expansion' ? '扩张型' :
                   strategicDirection === 'diversification' ? '多元化' :
                   strategicDirection === 'stability' ? '稳定型' :
                   strategicDirection === 'defensive' ? '收缩型' : strategicDirection}
                </p>
                {productMatrix && (
                  <p className="text-xs text-primary-700 dark:text-primary-300 mt-2">
                    基于 Step 2 的安索夫矩阵分析
                  </p>
                )}
              </div>
          </div>
        </div>
      </div>

      {/* ========== 目标计算结果卡片 ========== */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Target className="w-6 h-6" />
          三级目标自动测算
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* 保底目标 */}
          <div className="bg-white dark:bg-slate-800 border-2 border-green-500 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-green-700 dark:text-green-300">A. 保底目标</h3>
              <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded">
                确定
              </div>
            </div>
            <p className="text-3xl font-bold text-green-900 dark:text-green-100 mb-2">
              {dataUnit === 'revenue' ? '¥' : ''}{calculatedTargets.base.toLocaleString()}{dataUnit === 'sales' ? ' 件' : ''}
            </p>
            <p className="text-xs text-green-700 dark:text-green-300">
              = 老客户 × 老产品（存量业务确定性{dataUnit === 'revenue' ? '收入' : '销量'}）
            </p>
          </div>

          {/* 达标目标 */}
          <div className="bg-white dark:bg-slate-800 border-2 border-blue-500 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-blue-700 dark:text-blue-300">B. 达标目标</h3>
              <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded">
                正常
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-2">
              {dataUnit === 'revenue' ? '¥' : ''}{calculatedTargets.standard.toLocaleString()}{dataUnit === 'sales' ? ' 件' : ''}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              = 所有业务总和（存量 + 增量）
            </p>
          </div>

          {/* 挑战目标 */}
          <div className="bg-white dark:bg-slate-800 border-2 border-purple-500 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-purple-700 dark:text-purple-300">C. 挑战目标</h3>
              <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded">
                冲刺
              </div>
            </div>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-2">
              {dataUnit === 'revenue' ? '¥' : ''}{calculatedTargets.challenge.toLocaleString()}{dataUnit === 'sales' ? ' 件' : ''}
            </p>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              = 达标目标 × {confidenceIndex}%（信心指数）
            </p>
          </div>
        </div>

        {/* 信心指数滑块 */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              信心指数调整
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="100"
                max="200"
                value={confidenceIndex}
                onChange={(e) => setConfidenceIndex(Number(e.target.value))}
                className="flex-1 h-2 bg-purple-200 dark:bg-purple-800 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400 min-w-[60px] text-center">
                {confidenceIndex}%
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            <Info className="w-3 h-3 inline mr-1" />
            100% = 保守，120% = 正常，150% = 激进，200% = 极限挑战
          </p>
        </div>
      </div>

      {/* ========== 客户/产品规划矩阵 ========== */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Target className="w-6 h-6" />
            客户/产品规划矩阵（The Growth Matrix）
          </h2>
          {/* 数据单位选择 */}
          <div className="mt-3 sm:mt-0 flex items-center gap-3 bg-gray-50 dark:bg-slate-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">数据类型：</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="dataUnit"
                  value="revenue"
                  checked={dataUnit === 'revenue'}
                  onChange={() => setDataUnit('revenue')}
                  className="w-4 h-4 text-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">预计营收 (万元)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="dataUnit"
                  value="sales"
                  checked={dataUnit === 'sales'}
                  onChange={() => setDataUnit('sales')}
                  className="w-4 h-4 text-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">预计销量 (件/套)</span>
              </label>
            </div>
          </div>
        </div>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          在行列交叉的单元格中填写预计{dataUnit === 'revenue' ? '营收金额（万元）' : '销量（件/套）'}，系统将自动计算行列合计
        </p>

        {/* 添加客户/产品按钮 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <button
            onClick={() => handleAddClient('old')}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加老客户
          </button>
          <button
            onClick={() => handleAddClient('new')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加新客户
          </button>
          <button
            onClick={() => handleAddProduct('old')}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加原有产品
          </button>
          <button
            onClick={() => handleAddProduct('new')}
            className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加新产品
          </button>
        </div>

        {/* 矩阵表格 */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-700">
                <th className="border border-gray-300 dark:border-slate-600 px-3 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  客户 \\ 产品
                </th>
                {matrixData.oldProducts.map((product, idx) => (
                  <th key={`old_${idx}`} className="border border-gray-300 dark:border-slate-600 px-2 py-2 text-center min-w-[120px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">{product}</span>
                      <button
                        onClick={() => handleRemoveProduct('old', idx)}
                        className="text-red-500 hover:text-red-700"
                        title="删除"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </th>
                ))}
                {matrixData.newProducts.map((product, idx) => (
                  <th key={`new_${idx}`} className="border border-gray-300 dark:border-slate-600 px-2 py-2 text-center min-w-[120px] bg-pink-50 dark:bg-pink-900/10">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-pink-700 dark:text-pink-300">{product}</span>
                      <button
                        onClick={() => handleRemoveProduct('new', idx)}
                        className="text-red-500 hover:text-red-700"
                        title="删除"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </th>
                ))}
                <th className="border border-gray-300 dark:border-slate-600 px-3 py-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[100px]">
                  合计
                </th>
              </tr>
            </thead>
            <tbody>
              {/* 老客户/存量市场 */}
              {matrixData.oldClients.map((client, clientIdx) => (
                <tr key={`old_client_${clientIdx}`}>
                  <td className="border border-gray-300 dark:border-slate-600 px-3 py-2 bg-green-50 dark:bg-green-900/10 font-medium text-green-900 dark:text-green-100 min-w-[120px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm truncate">{client}</span>
                      <button
                        onClick={() => handleRemoveClient('old', clientIdx)}
                        className="text-red-500 hover:text-red-700 flex-shrink-0"
                        title="删除"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  {/* 老产品列 */}
                  {matrixData.oldProducts.map((product, productIdx) => {
                    const key = `${client}_${product}`;
                    return (
                      <td key={key} className="border border-gray-300 dark:border-slate-600 px-2 py-1">
                        <input
                          type="number"
                          value={matrixData.values[key] || ''}
                          onChange={(e) => handleCellValueChange(client, product, Number(e.target.value))}
                          className="w-full px-2 py-1 text-center border border-gray-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-green-500 text-sm"
                          placeholder="0"
                        />
                      </td>
                    );
                  })}
                  {/* 新产品列 - 老客户也可以购买新产品 */}
                  {matrixData.newProducts.map((product, productIdx) => {
                    const key = `${client}_${product}`;
                    return (
                      <td key={key} className="border border-gray-300 dark:border-slate-600 px-2 py-1 bg-pink-50 dark:bg-pink-900/10">
                        <input
                          type="number"
                          value={matrixData.values[key] || ''}
                          onChange={(e) => handleCellValueChange(client, product, Number(e.target.value))}
                          className="w-full px-2 py-1 text-center border border-gray-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-pink-500 text-sm"
                          placeholder="0"
                        />
                      </td>
                    );
                  })}
                  <td className="border border-gray-300 dark:border-slate-600 px-3 py-2 bg-gray-50 dark:bg-slate-700 text-center font-bold text-gray-900 dark:text-gray-100 min-w-[100px]">
                    {calculateClientSum(client).toLocaleString()}
                  </td>
                </tr>
              ))}

              {/* 新客户/增量市场 */}
              {matrixData.newClients.map((client, clientIdx) => (
                <tr key={`new_client_${clientIdx}`}>
                  <td className="border border-gray-300 dark:border-slate-600 px-3 py-2 bg-blue-50 dark:bg-blue-900/10 font-medium text-blue-900 dark:text-blue-100 min-w-[120px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm truncate">{client}</span>
                      <button
                        onClick={() => handleRemoveClient('new', clientIdx)}
                        className="text-red-500 hover:text-red-700 flex-shrink-0"
                        title="删除"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  {/* 老产品列 - 新客户也可以购买老产品 */}
                  {matrixData.oldProducts.map((product, productIdx) => {
                    const key = `${client}_${product}`;
                    return (
                      <td key={key} className="border border-gray-300 dark:border-slate-600 px-2 py-1">
                        <input
                          type="number"
                          value={matrixData.values[key] || ''}
                          onChange={(e) => handleCellValueChange(client, product, Number(e.target.value))}
                          className="w-full px-2 py-1 text-center border border-gray-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="0"
                        />
                      </td>
                    );
                  })}
                  {/* 新产品列 */}
                  {matrixData.newProducts.map((product, productIdx) => {
                    const key = `${client}_${product}`;
                    return (
                      <td key={key} className="border border-gray-300 dark:border-slate-600 px-2 py-1 bg-pink-50 dark:bg-pink-900/10">
                        <input
                          type="number"
                          value={matrixData.values[key] || ''}
                          onChange={(e) => handleCellValueChange(client, product, Number(e.target.value))}
                          className="w-full px-2 py-1 text-center border border-gray-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-pink-500 text-sm"
                          placeholder="0"
                        />
                      </td>
                    );
                  })}
                  <td className="border border-gray-300 dark:border-slate-600 px-3 py-2 bg-gray-50 dark:bg-slate-700 text-center font-bold text-gray-900 dark:text-gray-100 min-w-[100px]">
                    {calculateClientSum(client).toLocaleString()}
                  </td>
                </tr>
              ))}

              {/* 列合计 */}
              <tr className="bg-gray-100 dark:bg-slate-600 font-semibold">
                <td className="border border-gray-300 dark:border-slate-600 px-3 py-2 text-center text-gray-700 dark:text-gray-300">
                  合计
                </td>
                {matrixData.oldProducts.map((product, productIdx) => (
                  <td key={`sum_old_${productIdx}`} className="border border-gray-300 dark:border-slate-600 px-3 py-2 text-center text-purple-700 dark:text-purple-300">
                    {calculateProductSum(product).toLocaleString()}
                  </td>
                ))}
                {matrixData.newProducts.map((product, productIdx) => (
                  <td key={`sum_new_${productIdx}`} className="border border-gray-300 dark:border-slate-600 px-3 py-2 text-center text-pink-700 dark:text-pink-300">
                    {calculateProductSum(product).toLocaleString()}
                  </td>
                ))}
                <td className="border border-gray-300 dark:border-slate-600 px-3 py-2 text-center text-gray-900 dark:text-gray-100">
                  <strong>
                    {Object.values(matrixData.values).reduce((sum, val) => sum + (val || 0), 0).toLocaleString()}
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== 底部操作按钮 ========== */}
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
            className="px-8 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg flex items-center gap-2 transition-all duration-200"
          >
            下一步：任务分解
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
