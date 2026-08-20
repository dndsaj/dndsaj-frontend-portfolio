Page({
  data: {
    activeTab: 'latest',
    // 示例列表数据，实际开发替换为接口返回数据
    infoList: [
      {
        id: 1,
        nickname: '张三同学',
        avatar: '',
        category: '闲置转让',
        content: '九成新笔记本电脑转让，价格美丽，配置是i5处理器+8G内存，运行流畅，有意者私聊。',
        coverImg: '/images/2026-06-11 161156.png'
      },
      {
        id: 2,
        nickname: '李四同学',
        avatar: '',
        category: '学习互助',
        content: '求借计算机网络教材，考完归还，谢谢！',
        coverImg: '/images/2026-06-11 161227.png'
      }
    ]
  },

  onLoad() {
    // 页面加载，可在这里发起列表请求
    this.loadInfoList(this.data.activeTab)
  },

  // 页面显示时自动读取新发布的内容
  onShow() {
    // 检查有没有刚刚发布的新内容缓存
    const newInfo = wx.getStorageSync('newPublishedInfo');
    if (newInfo) {
      // 把新内容放到列表最顶部
      let infoList = this.data.infoList;
      infoList.unshift(newInfo);
      // 更新页面数据并清空缓存
      this.setData({
        infoList: infoList
      });
      wx.removeStorageSync('newPublishedInfo');
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadInfoList(this.data.activeTab, () => {
      wx.stopPullDownRefresh()
    })
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
    this.loadInfoList(tab)
  },

  // 加载信息列表
  loadInfoList(tab, callback) {
    // 实际开发替换为你的接口请求
    // 示例：wx.request({ url: '你的接口地址', data: { tab }, success: res => { ... } })
    wx.showToast({
      title: `加载${tab === 'latest' ? '最新' : '距离'}列表`,
      icon: 'none'
    })
    typeof callback === 'function' && callback()
  },

  // 跳转发布页面
  goPublish() {
    // 替换为你的发布页面路径
    wx.navigateTo({
      url: '/pages/publish/publish'
    })
  },

  // 分享当前页面
  onShare() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  // 联系用户
  onContact() {
    wx.showActionSheet({
      itemList: ['复制微信号', '拨打电话'],
      success: (res) => {
        // res.tapIndex 对应点击操作
      }
    })
  },

  // 返回顶部
  onBackTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },

  // 页面分享配置
  onShareAppMessage() {
    return {
      title: '校园信息广场',
      path: '/pages/index/index'
    }
  }
})
