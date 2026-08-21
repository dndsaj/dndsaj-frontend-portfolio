Page({
  data: {
    detailInfo: {} // 先初始化空对象
  },
  onLoad(options){
    // 解析传递过来的商品数据
    const goodsData = JSON.parse(decodeURIComponent(options.item));
    // 赋值给detailInfo
    this.setData({
      detailInfo: goodsData
    })
  }
})
