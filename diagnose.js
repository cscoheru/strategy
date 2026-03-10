const net = require('net');
const http = require('http');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function diagnosePort(port = 30022) {
  console.log(`=== 端口 ${port} 诊断报告 ===\n`);
  
  // 1. 检查端口是否被占用
  console.log('1. 检查端口占用情况:');
  try {
    const { stdout } = await execPromise(`lsof -i :${port} || ss -tlnp | grep :${port} || netstat -tlnp | grep :${port} || echo "未找到相关命令"`);
    console.log(stdout);
  } catch (error) {
    console.log('端口未被占用或无法检查');
  }
  
  // 2. 尝试创建服务器测试端口
  console.log('\n2. 测试端口可用性:');
  const server = net.createServer();
  
  return new Promise((resolve) => {
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`端口 ${port} 已被占用`);
      } else {
        console.log(`端口错误: ${err.code}`);
      }
      resolve(false);
    });
    
    server.once('listening', () => {
      console.log(`端口 ${port} 可用`);
      server.close();
      resolve(true);
    });
    
    server.listen(port, '0.0.0.0');
  });
}

async function checkFirewall() {
  console.log('\n3. 防火墙检查建议:');
  console.log('请运行以下命令检查防火墙:');
  console.log('  sudo ufw status');
  console.log('  sudo firewall-cmd --list-all  # CentOS/RHEL');
  console.log('\n如果需要开放端口:');
  console.log(`  sudo ufw allow ${30022}/tcp`);
  console.log('  sudo firewall-cmd --permanent --add-port=30022/tcp && sudo firewall-cmd --reload  # CentOS/RHEL');
}

async function checkNetwork() {
  console.log('\n4. 网络配置检查:');
  console.log('请检查:');
  console.log('  - 服务器IP地址是否正确配置');
  console.log('  - 路由器/防火墙是否允许端口30022');
  console.log('  - 云服务商安全组规则（如AWS安全组、阿里云安全组等）');
}

async function main() {
  const port = 30022;
  const isPortAvailable = await diagnosePort(port);
  
  if (!isPortAvailable) {
    console.log(`\n端口 ${port} 不可用，尝试其他端口:`);
    
    // 尝试其他常用端口
    const alternativePorts = [3000, 3001, 8080, 8081, 30023, 30024];
    for (const altPort of alternativePorts) {
      const available = await diagnosePort(altPort);
      if (available) {
        console.log(`\n建议使用端口: ${altPort}`);
        console.log(`修改 server.js 中的 PORT 常量为 ${altPort}`);
        break;
      }
    }
  }
  
  await checkFirewall();
  await checkNetwork();
  
  console.log('\n5. 快速测试命令:');
  console.log(`  本地测试: curl http://localhost:${port}`);
  console.log(`  查看监听: sudo lsof -i :${port} || sudo ss -tlnp | grep :${port}`);
  console.log(`  进程检查: ps aux | grep node`);
  
  console.log('\n=== 诊断完成 ===');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { diagnosePort };
