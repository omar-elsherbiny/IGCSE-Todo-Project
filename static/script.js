document.addEventListener('DOMContentLoaded', function () {

})

function toggleSidebar() {
    bar = document.getElementById('sidebar')
    if (bar.style.width == '2px') {
        bar.style.width = '';
    } else {
        bar.style.width = '2px'
    }
    document.getElementById('pulltab_open').classList.toggle('hide')
    document.getElementById('pulltab_close').classList.toggle('hide')
}