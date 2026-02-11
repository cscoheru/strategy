'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Step1Data, Step2Data, DimensionCard, KSFDimension, BenchmarkScore, CustomerInsight, CompetitorAnalysis } from '@/types/strategy';
import {
  Code,
  ChevronUp,
  ChevronDown,
  Trash2,
  Download,
  Upload,
  Check,
  Zap
} from 'lucide-react';

// 完整的测试数据
const MOCK_DATA = {
  step1: {
    goals: '2024年度目标：\n1. 营收目标：5000万元，同比增长30%\n2. 新客户开发：新增优质客户50家\n3. 产品创新：完成2个新产品的研发和上市\n4. 团队建设：销售团队扩充至30人\n5. 市场拓展：进入华东、华南市场',
    actuals: '2024实际完成：\n1. 营收：3800万元，完成率76%，未达标\n2. 新客户：新增28家，完成率56%\n3. 新产品：仅完成1个，延期3个月\n4. 团队：销售团队22人，未达编制\n5. 市场拓展：仍集中在本地市场',
    summary: '2024年度目标完成率为76%，核心差距在于新客户开发和产品创新进度滞后。虽然老客户复购率保持稳定，但新市场开拓受阻，产品研发效率低下。',
    dimensions: [
      {
        id: 'sales',
        name: '销售力',
        category: 'force' as const,
        isHighlighted: true,
        reason: '新客户开发完成率仅56%，销售团队人员不足，市场拓展能力有限',
        score: 85
      },
      {
        id: 'product',
        name: '产品力',
        category: 'force' as const,
        isHighlighted: true,
        reason: '新产品研发延期3个月，创新能力不足，产品迭代速度落后市场竞品',
        score: 90
      },
      {
        id: 'delivery',
        name: '交付力',
        category: 'force' as const,
        isHighlighted: false,
        reason: '交付能力稳定，客户满意度保持较高水平',
        score: 60
      },
      {
        id: 'hr',
        name: '人力资源',
        category: 'platform' as const,
        isHighlighted: true,
        reason: '销售团队仅22人，未达30人编制，人才密度不足',
        score: 75
      },
      {
        id: 'finance',
        name: '财务物资',
        category: 'platform' as const,
        isHighlighted: false,
        reason: '资金状况稳定，但研发投入不足',
        score: 65
      },
      {
        id: 'digital',
        name: '流程数字化',
        category: 'platform' as const,
        isHighlighted: true,
        reason: '研发项目管理系统落后，缺乏有效的协同工具',
        score: 70
      }
    ] as DimensionCard[],
    diagnosticSession: {
      selectedDimension: 'product' as const,
      messages: [
        { id: '1', role: 'ai' as const, content: '产品研发为什么会延期3个月？是技术难度超出预期，还是资源配置问题？', timestamp: Date.now() },
        { id: '2', role: 'user' as const, content: '主要是技术人员不足，项目经理同时负责多个项目，精力分散', timestamp: Date.now() },
        { id: '3', role: 'ai' as const, content: '技术人员的招聘是否困难？有没有考虑过外部合作或外包？', timestamp: Date.now() },
        { id: '4', role: 'user' as const, content: '招聘确实困难，高级工程师薪资要求高。外包尝试过但质量不稳定', timestamp: Date.now() },
        { id: '5', role: 'ai' as const, content: '研发流程是否有瓶颈？比如需求变更频繁、测试环节耗时等？', timestamp: Date.now() }
      ],
      rootCause: '研发团队人员配置不足，项目经理多线作战导致进度管控缺失，外部外包质量不稳定',
      isCompleted: true
    },
    rootCause: '研发团队配置不足与项目管理低效是产品延期的根本原因'
  } as Step1Data,

  step2: {
    trends: '【行业发展趋势】\n1. 数字化转型加速：行业内85%的企业已实施数字化办公系统\n2. 云服务普及：SaaS模式成为主流，客户更倾向于按需付费\n3. AI技术应用：智能化需求识别、自动化报告生成成为标配功能\n4. 合规要求提升：数据安全和隐私保护法规日趋严格\n5. 移动化办公：客户对移动端、随时随地访问的需求增加',
    competitors: '【主要竞争对手】\n\n竞争对手A - 云图科技：\n- 市场份额：35%，行业龙头\n- 核心优势：产品功能完整，品牌知名度高，拥有强大的销售团队\n- 客户群体：大型企业客户为主\n- 年营收：约2亿元\n\n竞争对手B - 敏捷软件：\n- 市场份额：25%，快速成长中\n- 核心优势：产品迭代快，价格灵活，中小微企业客户服务经验丰富\n- 融资情况：已完成B轮融资5000万\n- 最新动态：正在推出AI辅助功能',
    companyInfo: '【本公司信息】\n\n公司名称：智汇战略科技有限公司\n成立时间：2020年\n团队规模：45人（研发18人，销售12人，其他15人）\n\n核心优势：\n1. 深度行业理解：创始人团队有15年行业经验\n2. 客户成功：老客户续约率85%，NPS评分70+\n3. 技术积累：拥有3项核心发明专利\n\n当前挑战：\n1. 资金有限：现金流紧张，营销投入不足\n2. 品牌知名度低：行业内知名度不如竞对A\n3. 产品功能：相比竞对A，功能覆盖不够全面\n\n财务状况：\n- 年营收：3800万元\n- 毛利率：65%\n- 研发投入占比：20%',
    customerInsight: {
      profile: '核心客户画像：\n\n1. 基本特征\n- 企业规模：100-500人中小型企业\n- 行业分布：制造业、零售连锁、专业服务\n- 决策者：CTO/信息总监/运营负责人\n- 地理位置：主要集中在华东、华南经济发达地区\n\n2. 行为特征\n- 采购偏好：注重性价比和实施服务，价格敏感度中等\n- 使用场景：多部门协同、移动办公、数据汇报\n- 痛点：现有系统操作复杂、培训成本高、功能过剩',
      kbf: [
        '实施周期短（2-4周内完成部署）',
        '操作简单，无需专业IT人员维护',
        '数据安全可靠，有合规认证',
        '性价比高，按需付费',
        '移动端体验好，支持随时随地访问'
      ],
      kbfLocked: true
    } as CustomerInsight,
    competitorAnalysis: {
      advantages: [
        { id: 'csf_1', competitorName: '云图科技', advantage: '产品功能最完整，可满足大型企业复杂需求', category: '产品' },
        { id: 'csf_2', competitorName: '云图科技', advantage: '品牌知名度高，客户信任度强', category: '品牌' },
        { id: 'csf_3', competitorName: '敏捷软件', advantage: '产品迭代速度快，每2周一个版本', category: '技术' },
        { id: 'csf_4', competitorName: '敏捷软件', advantage: '价格灵活，中小微企业套餐性价比高', category: '价格' }
      ],
      searchResults: '【竞对搜索结果】\n\n云图科技最新动态：\n- 2024年10月完成C轮融资1.5亿元\n- 发布AI智能助手功能，用户可自然语言查询数据\n- 入选《财富》杂志"最佳中小企业服务商"榜单\n\n敏捷软件最新动态：\n- 推出"极速版"产品，针对小微企业\n- 与阿里云达成战略合作，深度整合云服务',
      analysisLocked: true
    } as CompetitorAnalysis,
    ksfDimensions: [
      {
        id: 'product_completeness',
        name: '产品完整性',
        description: '功能覆盖完整，满足客户核心业务场景需求',
        reasoning: '因为客户看重"操作简单、无需专业IT人员维护"（KBF），且竞对云图科技具备"产品功能最完整"（CSF），所以我们需要在保持简单易用的同时，补充核心功能模块'
      },
      {
        id: 'rapid_deployment',
        name: '快速部署能力',
        description: '2-4周内完成系统部署和上线',
        reasoning: '因为客户明确看重"实施周期短"（KBF），这是关键的购买决策因素'
      },
      {
        id: 'data_security',
        name: '数据安全保障',
        description: '通过合规认证，数据安全可靠',
        reasoning: '因为客户看重"数据安全可靠，有合规认证"（KBF），且合规要求在行业内日趋严格'
      },
      {
        id: 'cost_effectiveness',
        name: '性价比优势',
        description: '提供有竞争力的价格和灵活的付费方式',
        reasoning: '因为客户看重"性价比高，按需付费"（KBF），且竞对敏捷软件具备"价格灵活"（CSF）'
      },
      {
        id: 'mobile_experience',
        name: '移动端体验',
        description: '移动端功能完整，随时随地访问',
        reasoning: '因为客户看重"移动端体验好，支持随时随地访问"（KBF），且移动化办公是行业趋势'
      }
    ] as KSFDimension[],
    ksfLocked: true,
    benchmarkScores: [
      { dimensionId: 'product_completeness', dimensionName: '产品完整性', myScore: 6, competitorScore: 9, ranking: 'medium' as const },
      { dimensionId: 'rapid_deployment', dimensionName: '快速部署能力', myScore: 8, competitorScore: 7, ranking: 'high' as const },
      { dimensionId: 'data_security', dimensionName: '数据安全保障', myScore: 7, competitorScore: 8, ranking: 'medium' as const },
      { dimensionId: 'cost_effectiveness', dimensionName: '性价比优势', myScore: 8, competitorScore: 7, ranking: 'high' as const },
      { dimensionId: 'mobile_experience', dimensionName: '移动端体验', myScore: 9, competitorScore: 6, ranking: 'high' as const }
    ] as BenchmarkScore[],
    benchmarkLocked: true,
    swot: {
      strengths: [
        '快速部署能力强，平均3周完成上线',
        '性价比优势明显，中小微企业套餐定价合理',
        '移动端体验优秀，用户活跃度高',
        '老客户续约率85%，客户成功体系完善'
      ],
      weaknesses: [
        '产品功能覆盖不如云图科技完整',
        '品牌知名度低，市场影响力有限',
        '资金紧张，营销投入不足',
        '研发团队规模小，产品迭代速度受限'
      ],
      opportunities: [
        'AI技术普及带来智能化升级机会',
        '云图科技主要服务大型企业，中小微企业市场存在空隙',
        '客户对SaaS模式接受度提高，市场教育成本降低',
        '移动化办公需求增长，我们的移动端优势可放大'
      ],
      threats: [
        '敏捷软件获得大额融资，可能发动价格战',
        '大型厂商可能推出免费基础版抢占市场',
        '数据安全法规趋严，合规成本增加',
        '客户需求升级，功能完整性要求提高'
      ]
    },
    strategicPoints: [
      '聚焦中小微企业市场，发挥快速部署和性价比优势',
      '深化移动端能力，打造差异化竞争优势',
      '补齐核心功能短板，重点突破客户高频使用的功能模块',
      '构建生态合作伙伴体系，通过合作补全产品功能',
      '优化定价策略，推出行业解决方案套餐提升客单价'
    ]
  } as Step2Data
};

interface DevToolsProps {
  onInjectData?: (step: 'all' | 'step1' | 'step2') => void;
}

export default function DevTools({ onInjectData }: DevToolsProps) {
  const { data, setData, setStep, clearData } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);

  // 检查是否在本地开发环境
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLocalhost(
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === ''
      );
    }
  }, []);

  // 不在本地环境则不显示
  if (!isLocalhost) return null;

  // 注入测试数据
  const handleInjectData = (step: 'all' | 'step1' | 'step2') => {
    if (step === 'all' || step === 'step1') {
      setData('step1', MOCK_DATA.step1);
    }
    if (step === 'all' || step === 'step2') {
      setData('step2', MOCK_DATA.step2);
    }

    // 显示成功提示
    const injectedSteps = step === 'all' ? 'Step 1 和 Step 2' : `Step ${step.slice(-1)}`;
    alert(`✅ 已注入测试数据（${injectedSteps}）\n\n可以直接跳转到 Step 3 或 Step 4 进行测试！`);

    if (onInjectData) {
      onInjectData(step);
    }
  };

  // 清空所有数据
  const handleClearData = () => {
    if (confirm('确定要清空所有测试数据吗？')) {
      clearData();
      alert('已清空所有数据');
    }
  };

  // 导出当前数据
  const handleExportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strategy-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* 悬浮按钮 */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-lg transition-all duration-200"
          title="开发者工具"
        >
          <Code className="w-5 h-5" />
          <span className="font-semibold">DevTools</span>
        </button>
      )}

      {/* 展开的工具面板 */}
      {isExpanded && (
        <div className="w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          {/* 头部 */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-white" />
                <span className="font-semibold text-white">开发者工具</span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <ChevronDown className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* 内容区 */}
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {/* 快速注入 */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                一键注入测试数据
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => handleInjectData('all')}
                  className="w-full px-3 py-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium transition-colors text-left"
                >
                  注入全部数据 (Step 1 + 2)
                </button>
                <button
                  onClick={() => handleInjectData('step1')}
                  className="w-full px-3 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm transition-colors text-left"
                >
                  仅注入 Step 1 数据
                </button>
                <button
                  onClick={() => handleInjectData('step2')}
                  className="w-full px-3 py-2 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm transition-colors text-left"
                >
                  仅注入 Step 2 数据
                </button>
              </div>
            </div>

            {/* 快速跳转 */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                快速跳转
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-3 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-sm transition-colors"
                >
                  Step 1
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="px-3 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-sm transition-colors"
                >
                  Step 2
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-3 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-sm transition-colors"
                >
                  Step 3
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-3 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-sm transition-colors"
                >
                  Step 4
                </button>
              </div>
            </div>

            {/* 数据操作 */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                数据操作
              </h4>
              <div className="space-y-2">
                <button
                  onClick={handleExportData}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  导出数据 (JSON)
                </button>
                <button
                  onClick={handleClearData}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  清空所有数据
                </button>
              </div>
            </div>

            {/* 当前数据状态 */}
            <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2">
                当前数据状态
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Step 1 数据:</span>
                  <span className={data.step1 ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500'}>
                    {data.step1 ? '✓ 已填充' : '✗ 未填充'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Step 2 数据:</span>
                  <span className={data.step2 ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500'}>
                    {data.step2 ? '✓ 已填充' : '✗ 未填充'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Step 3 数据:</span>
                  <span className={data.step3 ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500'}>
                    {data.step3 ? '✓ 已填充' : '✗ 未填充'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Step 4 数据:</span>
                  <span className={data.step4 ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500'}>
                    {data.step4 ? '✓ 已填充' : '✗ 未填充'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
