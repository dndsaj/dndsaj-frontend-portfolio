// 初始化本地数据，第一次打开自动加载预置样板数据，强制覆盖确保数据一定存在
if(!localStorage.getItem('orders') || JSON.parse(localStorage.getItem('orders')).length === 0) {
    localStorage.setItem('orders', JSON.stringify([
        { id: 1, customer: "邯郸恒信机械制造", contact: "王建国", phone: "13503101111", product: "数控六轴中控机", price: 128000, status: "已完成", time: "2026-01-15 09:25:00" },
        { id: 2, customer: "石家庄锐达自动化", contact: "李志强", phone: "13803112222", product: "高精度数控车床", price: 85000, status: "已完成", time: "2026-03-22 14:10:00" },
        { id: 3, customer: "邢台鑫泰重工", contact: "张东风", phone: "13903123333", product: "工业机器人工作站", price: 245000, status: "已完成", time: "2026-05-08 10:45:00" },
        { id: 4, customer: "安阳顺通汽配", contact: "刘红", phone: "13703134444", product: "智能焊接机械臂", price: 76000, status: "已发货", time: "2026-07-17 16:30:00" },
        { id: 5, customer: "鹤壁精密仪器厂", contact: "赵伟", phone: "13603145555", product: "五轴联动加工中心", price: 368000, status: "生产中", time: "2026-08-05 11:20:00" },
        { id: 6, customer: "长治矿业设备", contact: "陈刚", phone: "13303156666", product: "自动化分拣生产线", price: 152000, status: "待支付", time: "2026-08-12 09:15:00" },
        { id: 7, customer: "晋城工程机械", contact: "周明", phone: "13103167777", product: "液压传动控制系统", price: 69000, status: "已取消", time: "2026-08-14 15:40:00" }
    ]));
}
if(!localStorage.getItem('customers') || JSON.parse(localStorage.getItem('customers')).length === 0) {
    localStorage.setItem('customers', JSON.stringify([
        { id: 1, name: "邯郸恒信机械制造", contact: "王建国", phone: "13503101111", addr: "邯郸市经济开发区东区创业路12号", createTime: "2025-11-20" },
        { id: 2, name: "石家庄锐达自动化", contact: "李志强", phone: "13803112222", addr: "石家庄高新区天山大街269号", createTime: "2025-12-05" },
        { id: 3, name: "邢台鑫泰重工", contact: "张东风", phone: "13903123333", addr: "邢台市南和工业区振兴路8号", createTime: "2026-02-18" },
        { id: 4, name: "安阳顺通汽配", contact: "刘红", phone: "13703134444", addr: "安阳市文峰区文昌大道32号", createTime: "2026-06-01" },
        { id: 5, name: "鹤壁精密仪器厂", contact: "赵伟", phone: "13603145555", addr: "鹤壁市淇滨区黎阳路156号", createTime: "2026-07-22" },
        { id: 6, name: "长治矿业设备", contact: "陈刚", phone: "13303156666", addr: "长治市潞城区潞华街道工业园", createTime: "2026-08-01" }
    ]));
}
if(!localStorage.getItem('pageSize')) {
    localStorage.setItem('pageSize', '10');
}

// 全局分页状态
let orderCurrentPage = 1;
let customerCurrentPage = 1;
let filteredOrders = [];
let filteredCustomers = [];
let lineChart, pieChart;

// 页面加载自动初始化所有数据，确保数据100%显示
document.addEventListener('DOMContentLoaded', function () {
    // 强制立刻渲染页面主内容
    document.getElementById('mainPage').style.display = 'flex';
    
    // 优先加载仪表盘统计数据
    calcDashboard();
    
    // 提前初始化订单和客户列表默认数据
    filteredOrders = JSON.parse(localStorage.getItem('orders'));
    renderOrderTable();
    
    filteredCustomers = JSON.parse(localStorage.getItem('customers'));
    renderCustomerTable();
    
    // 延迟初始化图表，避免DOM未加载完成导致渲染失败
    setTimeout(initCharts, 300);
})

// 页面切换逻辑
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function () {
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        document.querySelectorAll('.page').forEach(p => p.classList.add('hide'));
        document.getElementById(`page-${this.dataset.page}`).classList.remove('hide');
        if(this.dataset.page === 'dashboard') {
            calcDashboard();
            setTimeout(initCharts, 100);
        }
        if(this.dataset.page === 'order') {
            resetOrderSearch();
        }
        if(this.dataset.page === 'customer') {
            resetCustomerSearch();
        }
    })
})

// 订单管理实时搜索：输入任意字符立刻自动过滤渲染结果
function realTimeOrderSearch() {
    let keyword = document.getElementById('orderKeyword').value.trim();
    let status = document.getElementById('orderStatusFilter').value;
    let startDate = document.getElementById('orderStartDate').value;
    let endDate = document.getElementById('orderEndDate').value;
    let orders = JSON.parse(localStorage.getItem('orders'));

    // 全字段模糊匹配：只要任意一个字段和输入字符有重叠就命中
    filteredOrders = orders.filter(item => {
        let match = true;
        if(keyword) {
            // 匹配订单ID、客户名称、联系人、联系电话、产品所有字段
            let matchKeyword = String(item.id).includes(keyword) 
                            || item.customer.includes(keyword) 
                            || item.contact.includes(keyword) 
                            || item.phone.includes(keyword) 
                            || item.product.includes(keyword);
            match = match && matchKeyword;
        }
        if(status) {
            match = match && (item.status === status);
        }
        if(startDate) {
            match = match && (new Date(item.time) >= new Date(startDate));
        }
        if(endDate) {
            match = match && (new Date(item.time) <= new Date(endDate + ' 23:59:59'));
        }
        return match;
    })

    // 输入字符的同时立刻刷新表格渲染结果
    orderCurrentPage = 1;
    renderOrderTable();
}

// 客户管理实时搜索：输入任意字符立刻自动过滤渲染结果
function realTimeCustomerSearch() {
    let keyword = document.getElementById('customerKeyword').value.trim();
    let customers = JSON.parse(localStorage.getItem('customers'));

    filteredCustomers = customers.filter(item => {
        let match = true;
        if(keyword) {
            // 匹配客户ID、客户名称、联系人、联系电话、地址所有字段
            let matchKeyword = String(item.id).includes(keyword) 
                            || item.name.includes(keyword) 
                            || item.contact.includes(keyword) 
                            || item.phone.includes(keyword) 
                            || item.addr.includes(keyword);
            match = match && matchKeyword;
        }
        return match;
    })

    customerCurrentPage = 1;
    renderCustomerTable();
}

// 初始化图表
function initCharts() {
    // 年度销售趋势折线图
    if(lineChart) lineChart.dispose();
    lineChart = echarts.init(document.getElementById('lineChart'));
    lineChart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
        },
        yAxis: {
            type: 'value',
            name: '销售额(元)'
        },
        series: [{
            data: [128000, 86000, 85000, 150000, 245000, 132000, 76000, 589000, 0, 0, 0, 0],
            type: 'line',
            smooth: true,
            itemStyle: { color: '#2f54eb' },
            areaStyle: { color: 'rgba(47, 84, 235, 0.1)'}
        }]
    });

    // 订单状态分布饼图
    if(pieChart) pieChart.dispose();
    pieChart = echarts.init(document.getElementById('pieChart'));
    let orders = JSON.parse(localStorage.getItem('orders'));
    let statusCount = { '待支付':0, '生产中':0, '已发货':0, '已完成':0, '已取消':0 };
    orders.forEach(o => statusCount[o.status]++);

    pieChart.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: '5%', left: 'center' },
        series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
            data: [
                { value: statusCount['待支付'], name: '待支付' },
                { value: statusCount['生产中'], name: '生产中' },
                { value: statusCount['已发货'], name: '已发货' },
                { value: statusCount['已完成'], name: '已完成' },
                { value: statusCount['已取消'], name: '已取消' }
            ]
        }]
    });
}

// 计算仪表盘数据
function calcDashboard() {
    let orders = JSON.parse(localStorage.getItem('orders'));
    let customers = JSON.parse(localStorage.getItem('customers'));
    let now = new Date();
    let currentMonth = now.getMonth();
    let currentYear = now.getFullYear();

    let monthTotal = 0;
    let successOrder = 0;
    let pendingOrder = 0;
    let totalAmount = 0;
    let unpaidAmount = 0;
    let monthNewCustomer = 0;

    orders.forEach(o => {
        let orderDate = new Date(o.time);
        if(orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
            monthTotal += Number(o.price);
        }
        if(o.status === '已完成') {
            successOrder ++;
            totalAmount += Number(o.price);
        }
        if(o.status === '待支付') {
            unpaidAmount += Number(o.price);
        }
        if(o.status === '生产中') {
            pendingOrder ++;
        }
    })

    customers.forEach(c => {
        let createDate = new Date(c.createTime || new Date());
        if(createDate.getMonth() === currentMonth && createDate.getFullYear() === currentYear) {
            monthNewCustomer ++;
        }
    })

    document.getElementById('monthSale').innerText = monthTotal.toLocaleString();
    document.getElementById('totalOrder').innerText = orders.length;
    document.getElementById('successRate').innerText = orders.length > 0 ? Math.round(successOrder / orders.length * 100) + '%' : '0%';
    document.getElementById('totalCustomer').innerText = customers.length;
    document.getElementById('pendingOrder').innerText = pendingOrder;
    document.getElementById('monthNewCustomer').innerText = monthNewCustomer;
    document.getElementById('totalAmount').innerText = totalAmount.toLocaleString();
    document.getElementById('unpaidAmount').innerText = unpaidAmount.toLocaleString();
}

// 重置订单搜索
function resetOrderSearch() {
    document.getElementById('orderKeyword').value = '';
    document.getElementById('orderStatusFilter').value = '';
    document.getElementById('orderStartDate').value = '';
    document.getElementById('orderEndDate').value = '';
    filteredOrders = JSON.parse(localStorage.getItem('orders'));
    orderCurrentPage = 1;
    renderOrderTable();
}

// 导出订单
function exportOrder() {
    let orders = filteredOrders.length > 0 ? filteredOrders : JSON.parse(localStorage.getItem('orders'));
    let csvContent = "订单ID,客户名称,联系人,联系电话,订购产品,订单金额,订单状态,下单时间\n";
    orders.forEach(o => {
        csvContent += `${o.id},${o.customer},${o.contact},${o.phone},${o.product},${o.price},${o.status},${o.time}\n`;
    })
    let blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = `订单数据_${new Date().toLocaleDateString()}.csv`;
    a.click();
    alert('订单导出成功');
}

// 订单相关弹窗操作
function showOrderModal(editIndex = -1) {
    document.getElementById('orderModal').style.display = 'flex';
    if(editIndex >= 0) {
        document.getElementById('orderModalTitle').innerText = '编辑订单';
        let orders = JSON.parse(localStorage.getItem('orders'));
        let item = orders[editIndex];
        document.getElementById('editOrderIndex').value = editIndex;
        document.getElementById('orderCustomer').value = item.customer;
        document.getElementById('orderContact').value = item.contact;
        document.getElementById('orderPhone').value = item.phone;
        document.getElementById('orderProduct').value = item.product;
        document.getElementById('orderPrice').value = item.price;
        document.getElementById('orderStatus').value = item.status;
    } else {
        document.getElementById('orderModalTitle').innerText = '新增订单';
        document.getElementById('editOrderIndex').value = -1;
        document.getElementById('orderCustomer').value = '';
        document.getElementById('orderContact').value = '';
        document.getElementById('orderPhone').value = '';
        document.getElementById('orderProduct').value = '';
        document.getElementById('orderPrice').value = '';
    }
}

function hideOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
}

function saveOrder() {
    let customer = document.getElementById('orderCustomer').value;
    let contact = document.getElementById('orderContact').value;
    let phone = document.getElementById('orderPhone').value;
    let product = document.getElementById('orderProduct').value;
    let price = document.getElementById('orderPrice').value;
    let status = document.getElementById('orderStatus').value;
    let editIndex = Number(document.getElementById('editOrderIndex').value);
    if(!customer || !price) {
        alert('请填写客户名称和订单金额两项必填信息');
        return;
    }
    let orders = JSON.parse(localStorage.getItem('orders'));
    if(editIndex >= 0) {
        orders[editIndex].customer = customer;
        orders[editIndex].contact = contact;
        orders[editIndex].phone = phone;
        orders[editIndex].product = product;
        orders[editIndex].price = price;
        orders[editIndex].status = status;
    } else {
        orders.push({
            id: orders.length + 1,
            customer: customer,
            contact: contact,
            phone: phone,
            product: product,
            price: price,
            status: status,
            time: new Date().toLocaleString()
        })
    }
    localStorage.setItem('orders', JSON.stringify(orders));
    filteredOrders = orders;
    hideOrderModal();
    renderOrderTable();
    calcDashboard();
    initCharts();
    alert(editIndex >= 0 ? '订单修改成功' : '订单添加成功');
}

function renderOrderTable() {
    let pageSize = Number(localStorage.getItem('pageSize'));
    let totalPage = Math.ceil(filteredOrders.length / pageSize);
    let startIndex = (orderCurrentPage - 1) * pageSize;
    let pageData = filteredOrders.slice(startIndex, startIndex + pageSize);
    
    let tbody = document.getElementById('orderTableBody');
    tbody.innerHTML = '';
    pageData.forEach((item) => {
        let originalIndex = JSON.parse(localStorage.getItem('orders')).findIndex(o => o.id === item.id);
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.customer}</td>
            <td>${item.contact}</td>
            <td>${item.phone}</td>
            <td>${item.product}</td>
            <td>¥${Number(item.price).toLocaleString()}</td>
            <td>${item.status}</td>
            <td>${item.time}</td>
            <td>
                <button class="btn-small" onclick="showOrderModal(${originalIndex})">编辑</button>
                <button class="btn-small del" onclick="delOrder(${originalIndex})">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    })

    renderPagination('orderPagination', totalPage, orderCurrentPage, (page) => {
        orderCurrentPage = page;
        renderOrderTable();
    })
}

function delOrder(index) {
    if(!confirm('确定要删除这条订单吗？删除后不可恢复')) return;
    let orders = JSON.parse(localStorage.getItem('orders'));
    orders.splice(index, 1);
    orders.forEach((o,i) => o.id = i+1);
    localStorage.setItem('orders', JSON.stringify(orders));
    filteredOrders = orders;
    renderOrderTable();
    calcDashboard();
    initCharts();
}

// 重置客户搜索
function resetCustomerSearch() {
    document.getElementById('customerKeyword').value = '';
    filteredCustomers = JSON.parse(localStorage.getItem('customers'));
    customerCurrentPage = 1;
    renderCustomerTable();
}

// 导出客户
function exportCustomer() {
    let customers = filteredCustomers.length > 0 ? filteredCustomers : JSON.parse(localStorage.getItem('customers'));
    let csvContent = "客户ID,客户名称,联系人,联系电话,地址,累计消费\n";
    let orders = JSON.parse(localStorage.getItem('orders'));
    customers.forEach(c => {
        let totalConsume = orders.filter(o => o.customer === c.name && o.status === '已完成').reduce((sum, o) => sum + Number(o.price), 0);
        csvContent += `${c.id},${c.name},${c.contact},${c.phone},${c.addr},${totalConsume}\n`;
    })
    let blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = `客户数据_${new Date().toLocaleDateString()}.csv`;
    a.click();
    alert('客户数据导出成功');
}

// 客户相关弹窗操作
function showCustomerModal(editIndex = -1) {
    document.getElementById('customerModal').style.display = 'flex';
    if(editIndex >= 0) {
        document.getElementById('customerModalTitle').innerText = '编辑客户';
        let customers = JSON.parse(localStorage.getItem('customers'));
        let item = customers[editIndex];
        document.getElementById('editCustomerIndex').value = editIndex;
        document.getElementById('customerName').value = item.name;
        document.getElementById('customerContact').value = item.contact;
        document.getElementById('customerPhone').value = item.phone;
        document.getElementById('customerAddr').value = item.addr;
    } else {
        document.getElementById('customerModalTitle').innerText = '新增客户';
        document.getElementById('editCustomerIndex').value = -1;
        document.getElementById('customerName').value = '';
        document.getElementById('customerContact').value = '';
        document.getElementById('customerPhone').value = '';
        document.getElementById('customerAddr').value = '';
    }
}

function hideCustomerModal() {
    document.getElementById('customerModal').style.display = 'none';
}

function saveCustomer() {
    let name = document.getElementById('customerName').value;
    let contact = document.getElementById('customerContact').value;
    let phone = document.getElementById('customerPhone').value;
    let addr = document.getElementById('customerAddr').value;
    let editIndex = Number(document.getElementById('editCustomerIndex').value);
    if(!name) {
        alert('请填写客户名称');
        return;
    }
    let customers = JSON.parse(localStorage.getItem('customers'));
    if(editIndex >= 0) {
        customers[editIndex].name = name;
        customers[editIndex].contact = contact;
        customers[editIndex].phone = phone;
        customers[editIndex].addr = addr;
    } else {
        customers.push({
            id: customers.length + 1,
            name: name,
            contact: contact,
            phone: phone,
            addr: addr,
            createTime: new Date().toLocaleString()
        })
    }
    localStorage.setItem('customers', JSON.stringify(customers));
    filteredCustomers = customers;
    hideCustomerModal();
    renderCustomerTable();
    calcDashboard();
    alert(editIndex >= 0 ? '客户信息修改成功' : '客户添加成功');
}

function renderCustomerTable() {
    let orders = JSON.parse(localStorage.getItem('orders'));
    let pageSize = Number(localStorage.getItem('pageSize'));
    let totalPage = Math.ceil(filteredCustomers.length / pageSize);
    let startIndex = (customerCurrentPage - 1) * pageSize;
    let pageData = filteredCustomers.slice(startIndex, startIndex + pageSize);
    
    let tbody = document.getElementById('customerTableBody');
    tbody.innerHTML = '';
    pageData.forEach((item) => {
        let originalIndex = JSON.parse(localStorage.getItem('customers')).findIndex(c => c.id === item.id);
        let totalConsume = orders.filter(o => o.customer === item.name && o.status === '已完成').reduce((sum, o) => sum + Number(o.price), 0);
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.contact}</td>
            <td>${item.phone}</td>
            <td>${item.addr}</td>
            <td>¥${totalConsume.toLocaleString()}</td>
            <td>
                <button class="btn-small" onclick="showCustomerModal(${originalIndex})">编辑</button>
                <button class="btn-small del" onclick="delCustomer(${originalIndex})">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    })

    renderPagination('customerPagination', totalPage, customerCurrentPage, (page) => {
        customerCurrentPage = page;
        renderCustomerTable();
    })
}

function delCustomer(index) {
    if(!confirm('确定要删除这个客户吗？删除后不可恢复')) return;
    let customers = JSON.parse(localStorage.getItem('customers'));
    customers.splice(index, 1);
    customers.forEach((c,i) => c.id = i+1);
    localStorage.setItem('customers', JSON.stringify(customers));
    filteredCustomers = customers;
    renderCustomerTable();
    calcDashboard();
}

// 通用分页组件渲染
function renderPagination(containerId, totalPage, currentPage, onPageChange) {
    let container = document.getElementById(containerId);
    container.innerHTML = '';
    if(totalPage <= 1) return;

    let prevBtn = document.createElement('button');
    prevBtn.innerText = '上一页';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if(currentPage > 1) onPageChange(currentPage - 1);
    };
    container.appendChild(prevBtn);

    for(let i = 1; i <= totalPage; i++) {
        let pageBtn = document.createElement('button');
        pageBtn.innerText = i;
        if(i === currentPage) pageBtn.classList.add('active');
        pageBtn.onclick = () => onPageChange(i);
        container.appendChild(pageBtn);
    }

    let nextBtn = document.createElement('button');
    nextBtn.innerText = '下一页';
    nextBtn.disabled = currentPage === totalPage;
    nextBtn.onclick = () => {
        if(currentPage < totalPage) onPageChange(currentPage + 1);
    };
    container.appendChild(nextBtn);
}

// 系统设置保存
function saveSetting() {
    let pageSizeVal = document.getElementById('pageSize').value;
    localStorage.setItem('pageSize', pageSizeVal);
    alert('设置保存成功');
}

// 初始化系统设置默认值
document.getElementById('pageSize').value = localStorage.getItem('pageSize');
