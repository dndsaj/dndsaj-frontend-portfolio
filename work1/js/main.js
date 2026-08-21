// 顶部导航滚动效果
window.addEventListener('scroll', () => {
    const mainNav = document.querySelector('.main-nav');
    if(window.scrollY > 100) {
        mainNav.style.padding = '0.5rem 0';
        mainNav.style.transition = '0.3s';
    } else {
        mainNav.style.padding = '1rem 0';
    }
})

// 自动轮播初始化（首页用）
let bannerIndex = 0;
const bannerDots = document.querySelectorAll('.banner-dot');
const bannerSlides = document.querySelectorAll('.banner-slide');
if(bannerDots.length > 0) {
    setInterval(() => {
        bannerDots[bannerIndex].classList.remove('active');
        bannerSlides[bannerIndex].style.opacity = '0';
        bannerIndex = (bannerIndex + 1) % bannerDots.length;
        bannerDots[bannerIndex].classList.add('active');
        bannerSlides[bannerIndex].style.opacity = '1';
    }, 3000)
}
