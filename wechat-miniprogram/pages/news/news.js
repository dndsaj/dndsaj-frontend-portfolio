Page({
  data: {
    activeTab: 'all',
    allNews: [
      {
        id: 1,
        title: '扬军威展才艺，千锤百炼铸成器',
        desc: '为帮助教师更好地理解统编小学道法教材，提升教师教学教研能力，我市教育科学研究院开展了小学道德与法治优质课评选活动。',
        readCount: 812,
        date: '2025-06-18',
        cover: 'https://picsum.photos/id/1005/800/450'
      },
      {
        id: 2,
        title: '有缘相遇，有幸相识——校园社团纳新活动圆满结束',
        desc: '爱就大声说出来。新生们怀揣着憧憬与热情，在各个社团摊位前咨询了解，选择自己心仪的兴趣团体。',
        readCount: 376,
        date: '2025-06-12',
        cover: 'https://picsum.photos/id/1082/800/450'
      },
      {
        id: 3,
        title: '我校代表队在省级职业技能大赛中斩获金奖',
        desc: '本次比赛吸引了全省数十所院校的选手同台竞技，我校参赛队伍凭借扎实的专业功底和默契的团队配合，最终脱颖而出。',
        readCount: 1245,
        date: '2025-06-05',
        cover: 'https://picsum.photos/id/1071/800/450'
      }
    ],
    hotNews: [
      {
        id: 1,
        title: '保定本地端午文化节即将开幕，邀你共赴传统之约',
        desc: '本次文化节将设置龙舟赛、包粽子体验、非遗展示等多个主题板块，市民可以免费进场参观体验，为期三天。',
        readCount: 2561,
        date: '2025-06-20',
        cover: 'https://picsum.photos/id/1019/800/450'
      },
      {
        id: 2,
        title: '市区新开免费露营基地，周末休闲又有新去处',
        desc: '新开放的露营基地紧邻滨河公园，配备停车场和公共卫生间，支持自带装备也可以现场租赁，快约上朋友出发吧。',
        readCount: 1892,
        date: '2025-06-15',
        cover: 'https://picsum.photos/id/1039/800/450'
      }
    ],
    campusNews: [
      {
        id: 1,
        title: '扬军威展才艺，千锤百炼铸成器',
        desc: '为帮助教师更好地理解统编小学道法教材，提升教师教学教研能力，我市教育科学研究院开展了小学道德与法治优质课评选活动。',
        readCount: 812,
        date: '2025-06-18',
        cover: 'https://picsum.photos/id/1005/800/450'
      },
      {
        id: 2,
        title: '有缘相遇，有幸相识——校园社团纳新活动圆满结束',
        desc: '爱就大声说出来。新生们怀揣着憧憬与热情，在各个社团摊位前咨询了解，选择自己心仪的兴趣团体。',
        readCount: 376,
        date: '2025-06-12',
        cover: 'https://picsum.photos/id/1082/800/450'
      }
    ],
    currentList: []
  },

  onLoad() {
    // 初始化展示全部列表
    this.setData({
      currentList: this.data.allNews
    })
  },

  // 切换标签
  switchTab(e) {
    const activeTab = e.currentTarget.dataset.tab
    let currentList = []
    if (activeTab === 'all') currentList = this.data.allNews
    if (activeTab === 'hot') currentList = this.data.hotNews
    if (activeTab === 'campus') currentList = this.data.campusNews
    
    this.setData({
      activeTab,
      currentList
    })
  },

  // 点击进入详情（预留跳转入口，不需要可删除）
  goDetail(e) {
    const id = e.currentTarget.dataset.id
    console.log('跳转资讯详情，id：', id)
    // wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  }
})
