<template>
  <footer class="site-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h4>关于我们</h4>
        <p>金昌市银行业普惠金融信贷服务中心</p>
        <p>致力于为中小微企业提供便捷的金融服务</p>
      </div>
      <div class="footer-section">
        <h4>快速链接</h4>
        <router-link to="/policies">普惠信贷政策</router-link>
        <router-link to="/products">普惠信贷产品</router-link>
        <router-link to="/cases">普惠信贷案例</router-link>
      </div>
      <div class="footer-section">
        <h4>联系我们</h4>
        <p>服务热线：0935-XXXXXXX</p>
        <p>地址：甘肃省金昌市</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 金昌市银行业普惠金融信贷服务中心 版权所有</p>
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
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
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
