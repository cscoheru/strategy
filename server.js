const express = require('express');
const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const cors = require('cors');

const app = express();
const PORT = 30022;

// 配置 CORS
app.use(cors());

// 配置文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// 获取本机IP地址
function getLocalIP() {
  const interfaces = require('os').networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ========== PDF 解析 API ==========

// GET /api/parse-document - API 信息
app.get('/api/parse-document', (req, res) => {
  res.json({
    name: 'Document Parser API',
    version: '1.0.0',
    engine: 'pdf-parse',
    supportedFormats: ['application/pdf'],
    maxSize: '10MB',
    features: [
      'PDF 文本提取',
      '多页文档支持',
      '自动去除空白字符'
    ],
    usage: {
      method: 'POST',
      contentType: 'multipart/form-data',
      fieldName: 'file'
    },
    notes: [
      '仅支持包含可提取文本的 PDF（非扫描件）',
      '扫描件需要 OCR 技术，暂不支持',
      '加密的 PDF 可能无法解析'
    ]
  });
});

// POST /api/parse-document - 解析 PDF
app.post('/api/parse-document', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: '未找到上传的文件'
      });
    }

    const file = req.file;
    const fileType = file.mimetype;

    if (fileType !== 'application/pdf') {
      return res.status(422).json({
        error: '不支持的文件格式',
        details: `文件类型 ${fileType} 暂不支持`,
        supportedFormats: ['application/pdf']
      });
    }

    // 解析 PDF
    try {
      // 使用 PDFParse 类解析 PDF
      const data = await new Promise((resolve, reject) => {
        const pdfParser = new PDFParse();
        pdfParser.parse(file.buffer).then(data => {
          resolve(data);
        }).catch(err => {
          reject(err);
        });
      });
      const extractedText = data.text.trim();

      if (!extractedText || extractedText.length < 10) {
        return res.status(422).json({
          error: 'PDF 解析失败：无法提取文本内容',
          details: '该 PDF 可能是扫描件或图片格式，不包含可提取的文本'
        });
      }

      // 返回解析结果
      res.json({
        success: true,
        fileName: file.originalname,
        fileType: file.mimetype,
        pageCount: data.numpages,
        textLength: extractedText.length,
        text: extractedText,
        message: `成功提取 ${data.numpages} 页，共 ${extractedText.length} 字符`
      });

    } catch (pdfError) {
      console.error('PDF 解析错误:', pdfError);
      return res.status(500).json({
        error: 'PDF 解析失败',
        details: pdfError.message || 'PDF 文件可能已加密或损坏'
      });
    }

  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({
      error: '服务器错误',
      details: error.message
    });
  }
});

// ========== 其他端点 ==========

// 基本路由
app.get('/', (req, res) => {
  res.json({
    message: 'Strategy Decoding API',
    status: 'running',
    port: PORT,
    server_ip: getLocalIP(),
    timestamp: new Date().toISOString(),
    client_ip: req.ip,
    endpoints: {
      parseDocument: {
        path: '/api/parse-document',
        method: 'POST',
        description: '解析 PDF 文件并提取文本内容'
      }
    }
  });
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 服务器信息端点
app.get('/info', (req, res) => {
  res.json({
    port: PORT,
    host: '0.0.0.0',
    local_ip: getLocalIP(),
    node_version: process.version,
    platform: process.platform,
    memory: process.memoryUsage()
  });
});

// 启动服务器
const server = app.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log('\n' + '='.repeat(50));
  console.log('🚀 服务器启动成功');
  console.log('='.repeat(50));
  console.log(`📡 监听端口: ${PORT}`);
  console.log(`🌐 绑定地址: 0.0.0.0 (所有网络接口)`);
  console.log(`💻 本地访问:`);
  console.log(`   - http://localhost:${PORT}`);
  console.log(`   - http://127.0.0.1:${PORT}`);
  console.log(`🌍 网络访问:`);
  console.log(`   - http://${localIP}:${PORT}`);
  console.log(`⏰ 启动时间: ${new Date().toISOString()}`);
  console.log('='.repeat(50));
  console.log('\n📋 可用端点:');
  console.log(`   GET /                     - 主页面`);
  console.log(`   GET /health               - 健康检查`);
  console.log(`   GET /info                 - 服务器信息`);
  console.log(`   GET  /api/parse-document  - 解析 API 信息`);
  console.log(`   POST /api/parse-document  - 解析 PDF 文件`);
  console.log('='.repeat(50) + '\n');
});

// 增强错误处理
server.on('error', (error) => {
  console.error('\n❌ 服务器启动失败:');
  console.error(`错误代码: ${error.code}`);
  console.error(`错误信息: ${error.message}`);

  if (error.code === 'EADDRINUSE') {
    console.error(`\n⚠️  端口 ${PORT} 已被占用！`);
    console.error('请尝试以下解决方案:');
    console.error(`1. 停止占用端口的进程: sudo kill $(sudo lsof -t -i:${PORT})`);
    console.error(`2. 修改 server.js 中的 PORT 为其他值（如 30023、30024、8080）`);
    console.error(`3. 运行诊断脚本: node diagnose.js`);
  } else if (error.code === 'EACCES') {
    console.error('\n⚠️  权限不足！');
    console.error('1024以下端口需要root权限，请尝试:');
    console.error(`1. 使用更高端口（如 3000 以上）`);
    console.error(`2. 或使用sudo运行: sudo node server.js`);
  }

  process.exit(1);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('\n🛑 收到关闭信号，正在优雅关闭服务器...');
  server.close(() => {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 收到中断信号，正在关闭服务器...');
  server.close(() => {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
});

// 全局错误处理
process.on('uncaughtException', (err) => {
  console.error('💥 未捕获的异常:', err);
  server.close(() => process.exit(1));
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 未处理的 Promise 拒绝:', reason);
});
