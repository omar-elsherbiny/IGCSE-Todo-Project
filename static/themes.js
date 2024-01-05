document.addEventListener('DOMContentLoaded', function () {
    /*### theme*/
    let toggle = document.getElementById('theme_toggle');
    let storedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (storedTheme) {
        document.documentElement.setAttribute('data-theme', storedTheme)
        if (storedTheme === 'dark') {
            toggle.checked = true;
        }
        else {
            toggle.checked = false;
        }
    }
    toggle.addEventListener('click', function () {
        let currentTheme = document.documentElement.getAttribute("data-theme");
        let targetTheme = 'light';
        if (currentTheme === 'light') {
            targetTheme = 'dark';
        }
        document.documentElement.setAttribute('data-theme', targetTheme);
        localStorage.setItem('theme', targetTheme);
    });
    /*### theme*/

    /*### sidebar*/
    let sb_status = localStorage.getItem('sb_status') || 'opened';
    if (sb_status) {
        document.documentElement.setAttribute('sb_status', sb_status)
        if (sb_status === 'closed') { toggleSidebar(true); }
    }
    /*### sidebar*/
})


function toggleSidebar(maintain) {
    bar = document.getElementById('sidebar')
    if (bar.style.width == '2px') {
        bar.style.width = '';
    } else {
        bar.style.width = '2px'
    }
    document.getElementById('pulltab_open').classList.toggle('hide')
    document.getElementById('pulltab_close').classList.toggle('hide')

    if (!maintain) {
        let current_sb_status = document.documentElement.getAttribute("sb_status");
        let target_sb_status = 'opened';
        if (current_sb_status === 'opened') {
            target_sb_status = 'closed';
        }
        document.documentElement.setAttribute('sb_status', target_sb_status);
        localStorage.setItem('sb_status', target_sb_status);
    }
}

adder_open = false;
function toggleAdderMenu() {
    let adder_div = document.getElementById('adder');
    let icon = document.getElementById('adder_icon');
    let menu = document.getElementById('adder_menu');

    adder_div.classList.toggle('close');
    adder_div.classList.toggle('open');
    menu.classList.toggle('close');
    menu.classList.toggle('open');
    if (adder_open) {
        adder_open = false;
        icon.style.transform = 'rotate(0deg)';
        document.getElementById('adder').style.height = '';
        document.getElementById('adder_icon').style.color = '';
    } else {
        adder_open = true;
        icon.style.transform = 'rotate(-180deg)';
    }
}

function toggleTaskList(board, index) {
    const boardDiv = document.querySelector('#board' + board + '.board_open');
    const taskDiv = boardDiv.querySelector('.dtask .task:nth-child(' + index + ')');
    const taskHeadDiv = taskDiv.querySelector('div:nth-child(1)');
    const taskListDiv = taskDiv.querySelector('.dlist_item');

    taskHeadDiv.querySelector('#task_dropdown_down').classList.toggle('hide');
    taskHeadDiv.querySelector('#task_dropdown_up').classList.toggle('hide');
    taskListDiv.style.display = (taskListDiv.style.display === 'none') ? '' : 'none';
}