const btnGoToHide = document.querySelector('#btnGoToHide');
const btnGoToRestore = document.querySelector('#btnGoToRestore');

btnGoToHide.addEventListener('click', () => {
    window.location.href = "http://127.0.0.1:5500/html/hide.html";
});

btnGoToRestore.addEventListener('click', () => {
    window.location.href = "http://127.0.0.1:5500/html/restore.html";
});