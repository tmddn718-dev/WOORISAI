if ('serviceWorker' in navigator) {
  addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(error => {
      console.warn('우리사이 오프라인 준비를 완료하지 못했어요.', error);
    });
  });
}
