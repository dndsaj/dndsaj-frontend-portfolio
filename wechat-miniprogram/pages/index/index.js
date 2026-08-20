Page({
  goToDetail(e){
    /// 直接获取当前点击项的完整商品数据
    const goodsItem = e.currentTarget.dataset.item;
    // 编码后传递给详情页
    wx.navigateTo({
      url: `/pages/detail/detail?item=${encodeURIComponent(JSON.stringify(goodsItem))}`
    })
  },
  data: {
    gridList: [
      {name: '校园简介', icon: '📋', color: 'color1'},
      {name: '闲置交换', icon: '📦', color: 'color2'},
      {name: '校园服务', icon: '🍀', color: 'color8'},
      {name: '兼职悬赏', icon: '💰', color: 'color3'},
      {name: '技能陪玩', icon: '🎮', color: 'color5'},
      {name: '互助问答', icon: '💬', color: 'color9'},
      {name: '心愿表白', icon: '🤍', color: 'color10'},
      {name: '学习资料', icon: '📖', color: 'color4'},
      {name: '失物招领', icon: '❓', color: 'color6'},
      {name: '考研租', icon: '📔', color: 'color7'}
    ],
    xianzhi:[
      {
        id: 1,
        name: '复古开源掌机游戏机',
        desc: '2022年10月购入,9成新',
        img: '/images/屏幕截图 2026-06-24 163941.png',
        price: '价格面议'
      },
      {
        id: 2,
        name: '16英寸轻薄本笔记本',
        desc: '9成新,官网自营购入',
        img: '/images/屏幕截图 2026-06-24 164007.png',
        price: '价格面议'
      },
      {
        id: 3,
        name: '16英寸轻薄本笔记本',
        desc: '9成新,官网自营购入',
        img: '/images/屏幕截图 2026-06-24 164007.png',
        price: '价格面议'
      },
      {
        id: 4,
        name: '复古开源掌机游戏机',
        desc: '2022年10月购入,9成新',
        img: '/images/屏幕截图 2026-06-24 163941.png',
        price: '价格面议'
      }
    ],
    newsList:[
      {
        title: "青春须早为，逐梦正当时",
        desc: "“青春须早为，岂能常少年。”奋斗，是时..987768.",
        readCount: 133,
        date: "2022-12-12",
        imgUrl: "/images/xioaixng.png"
      },
      {
        title: "知晓来时路，青春建新功",
        desc: "10月2日,交通运输工程学院特开展“知晓...",
        readCount: 57,
        date: "2022-12-12",
        imgUrl: "/images/xioaixng.png"
      }
    ]
  },
  onLoad: function () {}
})
