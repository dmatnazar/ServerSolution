window.addEventListener('DOMContentLoaded',  () => {

 function updateOnlineStatus() {
    if (navigator.onLine) {
        window.indexWindow.restartApp() 
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
})