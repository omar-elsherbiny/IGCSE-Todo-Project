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

adder_open=false;

function toggleAdderMenu() {
    let adder_div = document.getElementById('adder');
    let icon = document.getElementById('adder_icon');
    let menu = document.getElementById('adder_menu');

    if (adder_open) {
        adder_open=false;
        adder_div.style.height='';
        adder_div.style.width='';
        icon.style.transform='rotate(0deg)';
    } else {
        adder_open=true;
        adder_div.style.height='40dvh';
        adder_div.style.width='10dvw';
        icon.style.transform='rotate(-180deg)';
    }
    menu.classList.toggle('hide');
}