<template>
  <div class="front-page">
    <Header />
    <main class="main-content">
      <section class="hero-section">
        <div class="hero-content">
          <h1>金昌市银行业协会普惠金融信贷服务平台</h1>
          <p>服务地方经济 助力小微企业 普惠金融 惠民惠企</p>
          <div class="hero-actions">
            <router-link to="/products" class="btn-primary">查看信贷产品</router-link>
          </div>
        </div>
      </section>

      <section class="quick-section">
        <div class="page-container">
          <div class="quick-grid">
            <router-link to="/policies" class="quick-card">
              <div class="card-icon" style="background: linear-gradient(135deg, #667eea, #764ba2)">
                <el-icon :size="32"><Document /></el-icon>
              </div>
              <h3>信贷政策</h3>
              <p>了解最新普惠金融政策</p>
            </router-link>
            <router-link to="/products" class="quick-card">
              <div class="card-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c)">
                <el-icon :size="32"><Money /></el-icon>
              </div>
              <h3>信贷产品</h3>
              <p>全市银行产品全览</p>
            </router-link>
            <router-link to="/products" class="quick-card">
              <div class="card-icon" style="background: linear-gradient(135deg, #4facfe, #00f2fe)">
                <el-icon :size="32"><Guide /></el-icon>
              </div>
              <h3>申请流程</h3>
              <p>简单快速的申请步骤</p>
            </router-link>
            <router-link to="/cases" class="quick-card">
              <div class="card-icon" style="background: linear-gradient(135deg, #43e97b, #38f9d7)">
                <el-icon :size="32"><Reading /></el-icon>
              </div>
              <h3>成功案例</h3>
              <p>真实案例参考</p>
            </router-link>
            <router-link to="/contacts" class="quick-card">
              <div class="card-icon" style="background: linear-gradient(135deg, #fa709a, #fee140)">
                <el-icon :size="32"><Phone /></el-icon>
              </div>
              <h3>咨询电话</h3>
              <p>银行联系方式</p>
            </router-link>
          </div>
        </div>
      </section>

      <section class="feature-section">
        <div class="page-container">
          <div class="section-header">
            <h2>服务特色</h2>
            <p>专业、便捷、高效的金融服务</p>
          </div>
          <div class="feature-grid">
            <div class="feature-item">
              <el-icon :size="40" color="#1890ff"><Clock /></el-icon>
              <h4>快速审批</h4>
              <p>简化流程，几个工作日即可完成审批</p>
            </div>
            <div class="feature-item">
              <el-icon :size="40" color="#52c41a"><Money /></el-icon>
              <h4>低息优惠</h4>
              <p>普惠金融专项优惠利率，减轻企业负担</p>
            </div>
            <div class="feature-item">
              <el-icon :size="40" color="#faad14"><OfficeBuilding /></el-icon>
              <h4>银行汇集</h4>
              <p>汇集辖内大中小各类银行</p>
            </div>
            <div class="feature-item">
              <el-icon :size="40" color="#722ed1"><User /></el-icon>
              <h4>专属服务</h4>
              <p>专人对接，全程跟踪，确保贷款顺利获批</p>
            </div>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
</script>

<style scoped lang="scss">
.front-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

.hero-section {
  background: linear-gradient(135deg, #1a365d 0%, #2c5282 50%, #4299e1 100%);
  padding: 80px 20px;
  text-align: center;
  color: #fff;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;

  h1 {
    font-size: 36px;
    margin-bottom: 16px;
    line-height: 1.3;
  }

  p {
    font-size: 18px;
    opacity: 0.9;
    margin-bottom: 32px;
  }
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;

  .btn-primary {
    background: #ffd700;
    color: #1a365d;
    padding: 12px 32px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: bold;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
    }
  }

  .btn-secondary {
    background: transparent;
    color: #fff;
    padding: 12px 32px;
    border-radius: 8px;
    border: 2px solid rgba(255, 255, 255, 0.5);
    text-decoration: none;
    transition: all 0.3s;

    &:hover {
      border-color: #fff;
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.quick-section {
  padding: 60px 0;
  background: #f7fafc;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}

.quick-card {
  background: #fff;
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
  text-decoration: none;
  color: #333;
  transition: all 0.3s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .card-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    margin: 0 auto 16px;
  }

  h3 {
    font-size: 18px;
    margin-bottom: 8px;
  }

  p {
    color: #999;
    font-size: 14px;
  }
}

.feature-section {
  padding: 60px 0;
}

.section-header {
  text-align: center;
  margin-bottom: 40px;

  h2 {
    font-size: 28px;
    color: #1a365d;
    margin-bottom: 8px;
  }

  p {
    color: #999;
    font-size: 16px;
  }
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 32px;
}

.feature-item {
  text-align: center;

  h4 {
    font-size: 18px;
    margin: 16px 0 8px;
    color: #333;
  }

  p {
    color: #666;
    font-size: 14px;
    line-height: 1.6;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 40px 20px;

    .hero-content h1 {
      font-size: 24px;
    }

    .hero-content p {
      font-size: 14px;
    }
  }

  .quick-section {
    padding: 40px 0;
  }

  .feature-section {
    padding: 40px 0;
  }
}
</style>
