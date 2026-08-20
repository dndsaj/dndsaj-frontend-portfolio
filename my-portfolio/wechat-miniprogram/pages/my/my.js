Page({
  data: {
    // 用户信息，未登录则为空对象
    userInfo: {},
    // 各状态订单数量
    orderCount: {
      doing: 3,
      done: 0,
      canceled: 0
    },
    // 功能模块未读消息数
    functionBadge: {
      message: 1,
      subscribe: 0,
      form: 0
    },
    // 客服电话，统一配置方便修改
    servicePhone: '13800000000'
  },

  onLoad() {
    // 页面创建时可从全局获取用户信息
    this.initPageData()
  },

  onShow() {
    // 每次显示页面刷新数据
    this.initPageData()
  },

  /** 初始化页面数据 */
  initPageData() {
    const app = getApp()
    // 假设用户信息存在全局，可以换成你自己的存储获取方式
    const userInfo = app.globalData.userInfo || {}
    this.setData({
      userInfo: userInfo
    })
  },

  /** 跳转登录页 */
  handleGoLogin() {
    console.log('[我的页面] 点击登录')
  },

  /** 跳转全部订单页 */
  handleGoAllOrder() {
    console.log('[我的页面] 查看全部订单')
  },

  /** 跳转指定状态订单列表 */
  handleGoOrderList(e) {
    const { status } = e.currentTarget.dataset
    console.log('[我的页面] 查看订单，状态：', status)
  },

  /** 跳转功能页面统一处理 */
  handleGoPage(e) {
    const { page } = e.currentTarget.dataset
    console.log('[我的页面] 跳转功能页：', page)
  },

  /** 退出登录 */
  handleLogout() {
    wx.showModal({
      title: '退出提示',
      content: '确定要退出当前登录吗？',
      success: (res) => {
        if (res.confirm) {
          console.log('[我的页面] 确认退出登录')
          // 1. 清除本地存储的用户信息
          // 2. 更新全局用户信息
          // 3. 刷新当前页面数据
          this.setData({ userInfo: {} })
          wx.showToast({ title: '已退出登录' })
        }
      }
    })
  }
})
