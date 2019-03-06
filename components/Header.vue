<template>
  <el-header style="text-align: right; width: 100%; font-size: 12px; background-color: #9ff781;">
    <el-menu :default-active="activeIndex" class="el-menu-header" mode="horizontal" style="background-color: #9ff781; border-style: none;">
      <el-menu-item index="1"><router-link to="/top">Top</router-link></el-menu-item>
      <el-menu-item index="2"><router-link to="/info">Info</router-link></el-menu-item>
      <el-menu-item index="3"><router-link to="/privacy">Privacy Policy</router-link></el-menu-item>
      <el-menu-item index="4"><router-link to="/contact">Contact</router-link></el-menu-item>
    </el-menu>
  </el-header>
</template>
