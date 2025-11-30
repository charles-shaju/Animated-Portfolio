const lottieSlot = document.getElementById('lottie-hero');
if (!lottieSlot) {
    throw new Error('Missing Lottie slot element in the DOM.');
}

const animationPath = 'videos/robotic-core.json';

const animationInstance = lottie.loadAnimation({
    container: lottieSlot,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: animationPath,
    rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice',
        progressiveLoad: true
    }
});

animationInstance.addEventListener('DOMLoaded', () => {
    lottieSlot.dataset.loaded = 'true';
});

animationInstance.addEventListener('data_failed', () => {
    lottieSlot.dataset.loaded = 'false';
});
