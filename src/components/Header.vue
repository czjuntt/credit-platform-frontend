<template>
  <header class="site-header">
    <div class="header-content">
      <div class="logo" @click="$router.push('/')">
        <span class="logo-icon">贷</span>
        <span class="logo-text">金昌市银行业普惠金融信贷服务中心</span>
      </div>
      <nav class="nav-menu">
        <router-link to="/" exact-active-class="active">首页</router-link>
        <router-link to="/policies" active-class="active">信贷政策</router-link>
        <router-link to="/products" active-class="active">信贷产品</router-link>
        <router-link to="/cases" active-class="active">信贷案例</router-link>
        <router-link to="/contacts" active-class="active">咨询电话</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped lang="scss">
.site-header {
  background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;

  .logo-icon {
    width: 40px;
    height: 40px;
    background: #ffd700;
    color: #1a365d;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
  }

  .logo-text {
    color: #fff;
    font-size: 18px;
    font-weight: bold;
  }
}

.nav-menu {
  display: flex;
  gap: 8px;

  a {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 4px;
    transition: all 0.3s;
    font-size: 14px;

    &:hover,
    &.active {
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.header-actions {
  .admin-link {
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    font-size: 14px;
    padding: 6px 12px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    transition: all 0.3s;

    &:hover {
      color: #fff;
      border-color: #fff;
    }
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }

  .logo .logo-text {
    font-size: 14px;
  }

  .nav-menu {
    flex-wrap: wrap;
    justify-content: center;
    gap: 4px;

    a {
      padding: 6px 10px;
      font-size: 12px;
    }
  }
}
</style>
