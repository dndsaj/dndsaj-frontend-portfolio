Page({
  data: {
    // 可选分类列表，根据你的需求修改
    categoryList: [
      { id: 1, name: '闲置转让' },
      { id: 2, name: '寻物启事' },
      { id: 3, name: '失物招领' },
      { id: 4, name: '校园互助' },
      { id: 5, name: '交友活动' }
    ],
    selectedCategory: {}, // 用户选中的分类
    content: '', // 输入的内容
    coverImg: '', // 上传的图片地址
    loading: false // 提交状态
  },

  // 分类选择回调
  onCategoryChange(e) {
    const index = e.detail.value
    this.setData({
      selectedCategory: this.data.categoryList[index]
    })
  },

  // 内容输入回调
  onContentInput(e) {
    this.setData({
      content: e.detail.value.trim()
    })
  },

  // 上传图片
  uploadImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // 这里实际开发需要将临时文件上传到你的服务器获取永久地址
        // 示例直接使用临时地址，生产环境请替换为上传接口逻辑
        this.setData({
          coverImg: res.tempFiles[0].tempFilePath
        })
      }
    })
  },

  // 删除已上传图片
  deleteImage() {
    this.setData({
      coverImg: ''
    })
  },

  // 提交发布
  submitPublish() {
    const { selectedCategory, content, coverImg } = this.data

    // 基础校验
    if(!selectedCategory.id) {
      wx.showToast({ title: '请先选择信息分类', icon: 'none' })
      return
    }
    if(content.length < 5) {
      wx.showToast({ title: '内容不能少于5个字', icon: 'none' })
      return
    }

    this.setData({ loading: true })

    // 构造提交数据
    const publishData = {
      category: selectedCategory.name,
      categoryId: selectedCategory.id,
      content: content,
      coverImg: coverImg,
      createTime: Date.now(),
      // 你可以补充用户昵称、头像等信息，从缓存中获取即可
      nickname: getApp().globalData.userInfo?.nickName || '匿名用户',
      avatar: getApp().globalData.userInfo?.avatarUrl || '',
      status: 1 // 1代表审核通过，实际由后端设置
    }

    // -------------- 对接后端接口（去掉注释即可使用）--------------
    /* wx.request({
      url: '你的后端提交接口地址',
      method: 'POST',
      data: publishData,
      success: (res) => {
        if(res.data.success) {
          // 发布成功，将新信息存入缓存，返回信息页自动加载
          wx.setStorageSync('newPublishedInfo', {
            ...res.data.data,
            id: res.data.data.id
          })
          wx.showToast({ title: '发布成功，等待审核后展示' })
          setTimeout(()=>{
            wx.navigateBack() // 返回上一页（信息广场）
          }, 1500)
        }else{
          wx.showToast({ title: res.data.msg || '发布失败', icon: 'none' })
        }
      },
      fail: ()=>{
        wx.showToast({ title: '网络错误，请重试', icon: 'none' })
      },
      complete: ()=>{
        this.setData({ loading: false })
      }
    }) */

    // -------------- 演示用模拟提交（对接后端后删除这段即可）--------------
    setTimeout(()=>{
      publishData.id = Math.floor(Math.random() * 100000)
      wx.setStorageSync('newPublishedInfo', {
        ...publishData,
        tag: publishData.category
      })
      wx.showToast({ title: '发布成功，等待审核' })
      setTimeout(()=>{
        wx.navigateBack()
      }, 1500)
      this.setData({ loading: false })
    }, 1000)
  }
})
