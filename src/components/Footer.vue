<template>
  <footer class="site-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h4>快速链接</h4>
        <router-link to="/policies">信贷政策</router-link>
        <router-link to="/products">信贷产品</router-link>
        <router-link to="/cases">信贷案例</router-link>
        <router-link to="/login" class="admin-link">管理入口</router-link>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 金昌市银行业协会普惠金融信贷服务平台 版权所有（开发测试中）</p>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped lang="scss">
.site-footer {
  background: #1a365d;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 40px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  display: flex;
  justify-content: flex-start;
}

.footer-content .footer-section {
  max-width: 280px;
}

.footer-section {
  h4 {
    color: #fff;
    margin-bottom: 16px;
    font-size: 16px;
  }

  p {
    margin: 8px 0;
    font-size: 14px;
    line-height: 1.6;
  }

  a {
    display: block;
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    margin: 8px 0;
    font-size: 14px;
    transition: color 0.3s;

    &:hover {
      color: #ffd700;
    }
  }

  .admin-link {
    display: inline-block;
    margin-top: 4px;
    padding: 8px 16px;
    border: 1px solid rgba(255, 215, 0, 0.5);
    border-radius: 6px;
    color: #ffd700;
    font-size: 14px;
    transition: all 0.3s;

    &:hover {
      background: rgba(255, 215, 0, 0.15);
      border-color: #ffd700;
    }
  }
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  text-align: center;

  p {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
  }
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 30px 20px;
  }
}
</style>
