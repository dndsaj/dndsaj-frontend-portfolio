// ===================== 全局配置与变量 =====================
const STAFF_STORAGE_KEY = 'h5_employee_full_data';
const ATTENDANCE_STORAGE_KEY = 'h5_attendance_record_data';
let currentEditIndex = null;
let currentUploadAvatar = '';
let currentPage = 'homePage';
let pageHistoryStack = ['homePage'];

// DOM元素集中获取
const $ = (id) => document.getElementById(id);
const addStaffBtn = $('addStaffBtn');
const operateModal = $('operateModal');
const modalTitle = $('modalTitle');
const cancelOperateBtn = $('cancelOperateBtn');
const confirmOperateBtn = $('confirmOperateBtn');
const globalToast = $('globalToast');
const previewAvatar = $('previewAvatar');
const avatarUploadInput = $('avatarUploadInput');
const inputName = $('inputName');
const inputIdCard = $('inputIdCard');
const inputPhone = $('inputPhone');
const inputDept = $('inputDept');
const inputJobNum = $('inputJobNum');
const inputIdentity = $('inputIdentity');
const inputStaffStatus = $('inputStaffStatus');
const inputAttendanceDate = $('inputAttendanceDate');
const inputAttendanceStatus = $('inputAttendanceStatus');
const leaveReasonWrap = $('leaveReasonWrap');
const inputLeaveReason = $('inputLeaveReason');
const attendanceDatePicker = $('attendanceDatePicker');
const entryCardGroup = document.querySelectorAll('.entry-card');
const allStaffSearch = $('allStaffSearch');

// ===================== 通用工具方法 =====================
function showToast(msg) {
    globalToast.textContent = msg;
    globalToast.classList.add('show');
    setTimeout(() => globalToast.classList.remove('show'), 2000);
}

// 员工基础数据读写
function getStaffBaseData() {
    const raw = localStorage.getItem(STAFF_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}
function saveStaffBaseData(data) {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(data));
}

// 考勤记录数据读写
function getAttendanceRecordData() {
    const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}
function saveAttendanceRecordData(data) {
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(data));
}

// ===================== 页面路由控制 =====================
function switchPage(targetPageId) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    // 显示目标页面
    $(targetPageId).classList.add('active');
    // 记录跳转历史
    if(targetPageId !== currentPage) pageHistoryStack.push(targetPageId);
    currentPage = targetPageId;
    // 控制新增按钮显示
    addStaffBtn.style.display = ['allStaffPage', 'internPage', 'resignedPage'].includes(targetPageId) ? 'flex' : 'none';
    // 页面初始化渲染
    const renderMap = {
        homePage: renderHomeOverview,
        attendanceStatPage: renderAttendanceStatPage,
        allStaffPage: renderAllStaffList,
        resignedPage: renderResignedStaffList,
        internPage: renderInternStaffList
    };
    renderMap[targetPageId]?.();
}

// 返回上一页
window.goBack = function() {
    if(pageHistoryStack.length <= 1) return;
    pageHistoryStack.pop();
    const lastPage = pageHistoryStack.at(-1);
    switchPage(lastPage);
}

// ===================== 各页面渲染方法 =====================
// 首页概览渲染
function renderHomeOverview() {
    const allStaff = getStaffBaseData();
    const onJobStaff = allStaff.filter(i => i.staffStatus === '在职');
    $('totalStaffCount').textContent = onJobStaff.length;
    $('formalStaffCount').textContent = onJobStaff.filter(i => i.identity === '正式员工').length;
    $('internStaffCount').textContent = onJobStaff.filter(i => i.identity === '实习员工').length;
}

// 指定日期考勤统计页渲染
function renderAttendanceStatPage() {
    const selectDate = attendanceDatePicker.value;
    $('attendancePageTitle').textContent = `${selectDate} 考勤统计`;
    const allAttendance = getAttendanceRecordData();
    const targetRecords = allAttendance.filter(i => i.attendanceDate === selectDate);
    
    $('normalAttCount').textContent = targetRecords.filter(i => i.attendanceStatus === '正常出勤').length;
    $('lateAttCount').textContent = targetRecords.filter(i => i.attendanceStatus === '迟到').length;
    $('leaveAttCount').textContent = targetRecords.filter(i => ['请假','休假'].includes(i.attendanceStatus)).length;

    const wrap = $('attendanceListWrap');
    if(targetRecords.length === 0) {
        wrap.innerHTML = `<div class="empty-state"><i class="fa fa-calendar-check-o"></i><p>该日期暂无考勤记录</p></div>`;
        return;
    }
    wrap.innerHTML = targetRecords.map(item => {
        const statusClass = item.attendanceStatus === '迟到' ? 'late' : (['请假','休假'].includes(item.attendanceStatus) ? 'leave' : 'normal');
        return `
        <div class="staff-card">
            <div class="card-top">
                <div class="staff-avatar">${item.staffName.charAt(0)}</div>
                <div class="staff-base-info">
                    <p class="name">${item.staffName}</p>
                    <div class="info-tag-group"><span class="status-tag ${statusClass}">${item.attendanceStatus}</span></div>
                </div>
            </div>
            <div class="card-detail"><p>工号：${item.jobNum}</p><p>部门：${item.dept}</p></div>
        </div>`;
    }).join('')
}

// 全部在职员工列表渲染
function renderAllStaffList(keyword = '') {
    const allStaff = getStaffBaseData().filter(i => i.staffStatus === '在职');
    let renderList = keyword.trim() ? allStaff.filter(i => 
        i.name.includes(keyword) || i.jobNum.includes(keyword) || i.dept.includes(keyword)
    ) : allStaff;
    
    const wrap = $('allStaffListWrap');
    if(renderList.length === 0) {
        wrap.innerHTML = `<div class="empty-state"><i class="fa fa-users"></i><p>暂无在职员工信息</p></div>`;
        return;
    }
    wrap.innerHTML = renderList.map(item => {
        const realIndex = getStaffBaseData().findIndex(i => i.jobNum === item.jobNum);
        return generateStaffCardHtml(item, realIndex);
    }).join('')
}

// 离职员工列表渲染
function renderResignedStaffList() {
    const allStaff = getStaffBaseData().filter(i => i.staffStatus === '已离职');
    const wrap = $('resignedStaffListWrap');
    if(allStaff.length === 0) {
        wrap.innerHTML = `<div class="empty-state"><i class="fa fa-user-times"></i><p>暂无离职员工档案</p></div>`;
        return;
    }
    wrap.innerHTML = allStaff.map(item => {
        const realIndex = getStaffBaseData().findIndex(i => i.jobNum === item.jobNum);
        return generateStaffCardHtml(item, realIndex);
    }).join('')
}

// 实习员工列表渲染
function renderInternStaffList() {
    const allStaff = getStaffBaseData().filter(i => i.identity === '实习员工' && i.staffStatus === '在职');
    const wrap = $('internStaffListWrap');
    if(allStaff.length === 0) {
        wrap.innerHTML = `<div class="empty-state"><i class="fa fa-user-circle-o"></i><p>暂无实习员工信息</p></div>`;
        return;
    }
    wrap.innerHTML = allStaff.map(item => {
        const realIndex = getStaffBaseData().findIndex(i => i.jobNum === item.jobNum);
        return generateStaffCardHtml(item, realIndex);
    }).join('')
}

// 通用员工卡片生成模板
function generateStaffCardHtml(item, realIndex) {
    const avatarHtml = item.avatar 
        ? `<div class="staff-avatar" style="background-image: url(${item.avatar})"></div>`
        : `<div class="staff-avatar">${item.name.charAt(0)}</div>`;
    return `
    <div class="staff-card">
        <div class="card-top">${avatarHtml}
            <div class="staff-base-info">
                <p class="name">${item.name}</p>
                <div class="info-tag-group">
                    <span class="identity-tag">${item.identity}</span>
                    <span class="identity-tag">${item.staffStatus}</span>
                </div>
            </div>
        </div>
        <div class="card-detail">
            <p>工号：${item.jobNum}</p>
            <p>部门：${item.dept}</p>
            <p>手机号：${item.phone}</p>
        </div>
        <div class="card-actions">
            <button class="action-btn edit-btn" onclick="openEditModal(${realIndex})">编辑</button>
            <button class="action-btn delete-btn" onclick="deleteStaff(${realIndex})">删除</button>
        </div>
    </div>`;
}

// ===================== 交互事件绑定 =====================
// 打开新增弹窗
addStaffBtn.addEventListener('click', () => {
    modalTitle.textContent = '新增员工信息';
    currentEditIndex = null;
    currentUploadAvatar = '';
    previewAvatar.style.backgroundImage = '';
    previewAvatar.innerHTML = `<i class="fa fa-camera"></i>`;
    // 清空所有表单
    const fieldsToClear = [inputName, inputIdCard, inputPhone, inputDept, inputJobNum, inputLeaveReason];
    fieldsToClear.forEach(el => el.value = '');
    inputIdentity.value = '正式员工';
    inputStaffStatus.value = '在职';
    inputAttendanceDate.value = new Date().toISOString().split('T')[0];
    inputAttendanceStatus.value = '正常出勤';
    leaveReasonWrap.style.display = 'none';
    operateModal.classList.add('show');
})

// 打开编辑弹窗
window.openEditModal = function(index) {
    const allStaff = getStaffBaseData();
    const editItem = allStaff[index];
    currentEditIndex = index;
    modalTitle.textContent = '修改员工信息';
    // 回填所有字段
    inputName.value = editItem.name;
    inputIdCard.value = editItem.idCard;
    inputPhone.value = editItem.phone;
    inputDept.value = editItem.dept;
    inputJobNum.value = editItem.jobNum;
    inputIdentity.value = editItem.identity;
    inputStaffStatus.value = editItem.staffStatus;
    currentUploadAvatar = editItem.avatar || '';
    if(currentUploadAvatar) {
        previewAvatar.style.backgroundImage = `url(${currentUploadAvatar})`;
        previewAvatar.innerHTML = '';
    } else {
        previewAvatar.style.backgroundImage = '';
        previewAvatar.innerHTML = `<i class="fa fa-camera"></i>`;
    }
    operateModal.classList.add('show');
}

// 删除员工
window.deleteStaff = function(index) {
    if(!confirm('确定要删除该员工的全部信息吗？此操作不可恢复！')) return;
    const allData = getStaffBaseData();
    allData.splice(index, 1);
    saveStaffBaseData(allData);
    // 刷新当前页面+首页统计数据 完全修复首页数字不更新的问题
    const currentRenderMap = {
        allStaffPage: renderAllStaffList,
        resignedPage: renderResignedStaffList,
        internPage: renderInternStaffList
    };
    currentRenderMap[currentPage]?.();
    renderHomeOverview();
    showToast('员工信息已删除');
}

// 头像上传交互
previewAvatar.addEventListener('click', () => avatarUploadInput.click())
avatarUploadInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        currentUploadAvatar = e.target.result;
        previewAvatar.style.backgroundImage = `url(${currentUploadAvatar})`;
        previewAvatar.innerHTML = '';
        showToast('头像上传成功');
    }
    reader.readAsDataURL(file);
})

// 考勤状态自动切换请假字段显示
inputAttendanceStatus.addEventListener('change', () => {
    leaveReasonWrap.style.display = ['请假','休假'].includes(inputAttendanceStatus.value) ? 'block' : 'none';
})

// 首页日期选择器跳转考勤页
attendanceDatePicker.addEventListener('change', () => switchPage('attendanceStatPage'));

// 功能入口卡片跳转
entryCardGroup.forEach(card => {
    card.addEventListener('click', function() {
        switchPage(this.dataset.target);
    })
})

// 搜索实时过滤
allStaffSearch.addEventListener('input', () => renderAllStaffList(allStaffSearch.value))

// 关闭弹窗
cancelOperateBtn.addEventListener('click', () => operateModal.classList.remove('show'))
operateModal.addEventListener('click', e => {
    if(e.target === operateModal) operateModal.classList.remove('show');
})

// 确认保存员工信息
confirmOperateBtn.addEventListener('click', () => {
    if(!inputName.value.trim() || !inputPhone.value.trim() || !inputJobNum.value.trim()) {
        showToast('请填写姓名、手机号和工号必填项');
        return;
    }
    const newStaffItem = {
        name: inputName.value.trim(),
        idCard: inputIdCard.value.trim(),
        phone: inputPhone.value.trim(),
        dept: inputDept.value.trim(),
        jobNum: inputJobNum.value.trim(),
        identity: inputIdentity.value,
        staffStatus: inputStaffStatus.value,
        avatar: currentUploadAvatar
    };
    const newAttendanceItem = {
        staffName: inputName.value.trim(),
        jobNum: inputJobNum.value.trim(),
        dept: inputDept.value.trim(),
        attendanceDate: inputAttendanceDate.value,
        attendanceStatus: inputAttendanceStatus.value,
        leaveReason: inputLeaveReason.value.trim()
    };

    const allStaffData = getStaffBaseData();
    const allAttendanceData = getAttendanceRecordData();

    if(currentEditIndex !== null) {
        allStaffData[currentEditIndex] = newStaffItem;
        showToast('员工信息修改成功');
    } else {
        allStaffData.push(newStaffItem);
        allAttendanceData.push(newAttendanceItem);
        showToast('新员工添加成功');
    }
    saveStaffBaseData(allStaffData);
    saveAttendanceRecordData(allAttendanceData);
    operateModal.classList.remove('show');

    // 所有页面数据全量同步刷新
    const refreshRenderMap = {
        homePage: renderHomeOverview,
        allStaffPage: renderAllStaffList,
        resignedPage: renderResignedStaffList,
        internPage: renderInternStaffList
    };
    refreshRenderMap[currentPage]?.();
    renderHomeOverview();
})

// ===================== 页面初始化 =====================
window.addEventListener('load', () => {
    attendanceDatePicker.value = new Date().toISOString().split('T')[0];
    renderHomeOverview();
})
