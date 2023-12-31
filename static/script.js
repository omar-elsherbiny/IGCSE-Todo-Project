document.addEventListener('DOMContentLoaded', function () {
    loadDnD();
    updateAdderCenter();
})

let reset;
function loadDnD() {
    const draggables = document.querySelectorAll('.draggable');
    const containers = document.querySelectorAll('.dropzone');
    let re_container, re_afterE;

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', function () {
            if (document.querySelector('.dragging') == null) {
                draggable.classList.add('dragging');
                re_container = draggable.parentElement;
                re_afterE = draggable.nextElementSibling;
                reset = true;
            }
        })

        draggable.addEventListener('dragend', function () {
            draggable.classList.remove('dragging');
            re_container, re_afterE = null;
            reset = true;
        })
    })

    containers.forEach(container => {
        container.addEventListener('dragover', event => {
            event.preventDefault();
            const draggable = document.querySelector('.dragging');
            if (checkValidTags(draggable, container)) {
                const afterE = getDragAfter(container, event.clientY);
                if (afterE == null) {
                    container.appendChild(draggable);
                } else if (afterE.parentElement === container) {
                    container.insertBefore(draggable, afterE);
                }
            }
        })

        container.addEventListener('drop', event => {
            event.preventDefault();
            const draggable = document.querySelector('.dragging');
            if (container.classList.contains("dropzone")) {
                container.classList.remove("dragover");
            }
            if (reset && draggable != null) { //  && checkValidTags(draggable, container)
                if (re_afterE == null) {
                    re_container.appendChild(draggable);
                } else {
                    re_container.insertBefore(draggable, re_afterE);
                }
            }
            re_container, re_afterE = null;
        })

        container.addEventListener('dragenter', event => {
            const draggable = document.querySelector('.dragging');
            if (container.classList.contains("dropzone") && checkValidTags(draggable, container)) {
                container.classList.add("dragover");
            }
        })

        container.addEventListener('dragleave', event => {
            if (container.classList.contains("dropzone")) {
                const newTarget = event.relatedTarget;
                if (!newTarget || !container.contains(newTarget)) {
                    // Check if the new target is not a child of the container
                    container.classList.remove("dragover");
                }
            }
        })
    })
}

function getDragAfter(container, y) {
    const draggableEs = [...container.querySelectorAll('.draggable:not(.dragging)')];

    return draggableEs.reduce(function (closest, child) {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child }
        } else {
            return closest
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element
}

const draggable_tags = ['board_closed', 'board_open', 'task', 'list_item'];
function checkValidTags(draggable, container) {
    for (let i = 0; i < draggable_tags.length; i++) {
        if (draggable.classList.contains(draggable_tags[i]) && container.classList.contains('d' + draggable_tags[i])) {
            return true;
        }
    }
    return false;
}

function updateData(data, method = 'PUT') {
    return fetch('/receive_data', {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            return result;
        })
        .catch(error => {
            console.error('Error sending data:', error);
            throw error;
        });
}

function updateAdderCenter() {
    let adder = document.getElementById('adder');
    if (adder && document.getElementById('boards_view').childElementCount == 0) {
        adder.classList.add('center');
    } else if (adder) {
        adder.classList.remove('center');
    }
}

function updateAdderValid() {
    let task = document.getElementById('task_name').value;
    let board_id = document.getElementById('task_board').value;
    if (task != '' && board_id != '') {
        document.getElementById('adder').style.height = 'clamp(3.5rem, 12rem, 20rem)';
        document.getElementById('adder_icon').style.color = '#1fad26';
    } else {
        document.getElementById('adder').style.height = '';
        document.getElementById('adder_icon').style.color = '';
    }
}

function updateTaskLi(board, index) {
    const parentE = document.querySelector('#board' + board + '.board_open .dtask .task:nth-child(' + index + ') .dlist_item');
    const childrenArray = Array.from(parentE.children);
    childrenArray.sort((a, b) => {
        const isCheckedA = a.querySelector('input[type="checkbox"]').checked;
        const isCheckedB = b.querySelector('input[type="checkbox"]').checked;

        return isCheckedA - isCheckedB;
    });
    childrenArray.forEach(child => {
        parentE.appendChild(child);
    });

    const processedTags = childrenArray.map(child => {
        return [child.querySelector('h6').textContent, child.querySelector('input[type="checkbox"]').checked ? 1 : 0];
    });
    updateData({ 'upd_list': processedTags, 'board': board, 'task': parentE.parentElement.querySelector('div h5').textContent });
}

function clearInputs() {
    let inputFields = document.querySelectorAll('input:not([type="radio"])');
    inputFields.forEach(function (input) {
        input.value = '';
    });
}
////////////////////////////////////
function trashEnter(event) {
    document.getElementById('trash').classList.add('open');
}
function trashLeave(event) {
    const newTarget = event.relatedTarget;
    if (!newTarget || !event.target.contains(newTarget)) {
        document.getElementById('trash').classList.remove('open');
    }
}
function trashDrop(event) {
    const draggable = document.querySelector('.dragging');

    let valid = [draggable.classList.contains('board_closed'), draggable.classList.contains('board_open'), draggable.classList.contains('task'), draggable.classList.contains('list_item')];
    if (valid.some(e => e === true)) {
        document.getElementById('trash').classList.remove('open');
        if (valid[0]) {
            const head = document.querySelector('header');
            head.innerHTML += `
            <div class="alert" id="beep${head.childElementCount + 1}">
                <p>Are you sure you want to delete ${draggable.querySelector('h4').textContent} permenantly?</p>
                <svg onclick="updateData({'del_board':${Number(draggable.id.split('').slice(5).join(''))}}).then(res =>{window.location.href='/todos';})"
                    xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 24 24">
                    <path fill="#888888"
                        d="m10 13.6l5.9-5.9q.275-.275.7-.275t.7.275q.275.275.275.7t-.275.7l-6.6 6.6q-.3.3-.7.3t-.7-.3l-2.6-2.6q-.275-.275-.275-.7t.275-.7q.275-.275.7-.275t.7.275z" />
                </svg>
                <svg onclick="hide_alert(${head.childElementCount + 1})" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                    viewBox="0 0 512 512">
                    <path
                        d="M437.5 386.6L306.9 256l130.6-130.6c14.1-14.1 14.1-36.8 0-50.9-14.1-14.1-36.8-14.1-50.9 0L256 205.1 125.4 74.5c-14.1-14.1-36.8-14.1-50.9 0-14.1 14.1-14.1 36.8 0 50.9L205.1 256 74.5 386.6c-14.1 14.1-14.1 36.8 0 50.9 14.1 14.1 36.8 14.1 50.9 0L256 306.9l130.6 130.6c14.1 14.1 36.8 14.1 50.9 0 14-14.1 14-36.9 0-50.9z"
                        fill="#888888" />
                </svg>
            </div>`
        }
        if (valid[1]) {
            const idx = Number(draggable.id.split('').slice(5).join(''));
            updateData({ 'rem_board': idx });
            updateAdderCenter();
            draggable.remove();
        }
        if (valid[2]) {
            let check = draggable.querySelector('#task_check');
            if (check.onclick) {
                check.onclick();
            } else if (check.dispatchEvent) {
                var clickEvent = new Event('click', { bubbles: true });
                check.dispatchEvent(clickEvent);
            }
            draggable.remove();
        }
    }
}

function boardsViewDrop(event) {
    const draggable = document.querySelector('.dragging');
    if (draggable.classList.contains('board_closed')) {
        const idx = Number(draggable.id.split('').slice(5).join(''));
        updateData({ 'get_board': idx })
            .then(board => {
                if (board == null) { return; }
                let board_template = `
                <div id="board${board.board_id}" class="draggable board_open" draggable="true">
                    <div style="border-color: #${board.color};">
                        <h4>${board.board_name}</h4>
                        <div style="display: flex;justify-content: space-around;align-items: center;gap: 1rem;">
                        <div class="svg_dropdown">
                            <svg onclick="event.target.parentElement.classList.toggle('open')" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                                <path onclick="event.target.parentElement.parentElement.classList.toggle('open')" fill="currentColor"
                                    d="M11 20q-.425 0-.712-.288T10 19v-6L4.2 5.6q-.375-.5-.112-1.05T5 4h14q.65 0 .913.55T19.8 5.6L14 13v6q0 .425-.288.713T13 20zm1-7.7L16.95 6h-9.9zm0 0" />
                            </svg>
                            <div>
                                <option value="0">By Priority</option>
                                <hr>
                                <option value="1">By Date</option>
                                <hr>
                                <option value="2">By Most Recent</option>
                                <hr>
                                <option value="3" disabled>Custom Order</option>
                            </div>
                        </div>
                        <input id="pin${board.board_id}" onchange="updateData({'upd_board_data':${board.board_id},'pin':event.target.checked})" class="pin" type="checkbox" ${board.is_pinned ? 'checked' : ''}>
                        <label for="pin${board.board_id}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path fill="currentColor"
                                    d="m13.827 1.69l8.486 8.485l-1.415 1.414l-.707-.707l-4.242 4.243l-.707 3.536l-1.415 1.414l-4.242-4.243l-4.95 4.95l-1.414-1.414l4.95-4.95l-4.243-4.243l1.414-1.414l3.536-.707l4.242-4.243l-.707-.707zm.707 3.536l-4.67 4.67l-2.822.565l6.5 6.5l.564-2.822l4.671-4.67z" />
                            </svg>
                        </label>
                        </div>
                    </div>
                    <div class="dropzone dtask">`;
                for (const [index, task] of board.tasks.entries()) {
                    let tmp = `
                    <div id="task${task.task_id}" class="draggable task" draggable="true">
                    <div style="border-color: var(--priority${task.priority});">
                        <svg id="task_dropdown_down" onclick="toggleTaskList(${board.board_id},${index + 1})" onclick="toggleTaskList({{ board.board_id }},{{ loop.index }})" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                            viewBox="0 0 24 24">
                            <path fill="currentColor"
                                d="M12 14.975q-.2 0-.375-.062T11.3 14.7l-4.6-4.6q-.275-.275-.275-.7t.275-.7q.275-.275.7-.275t.7.275l3.9 3.9l3.9-3.9q.275-.275.7-.275t.7.275q.275.275.275.7t-.275.7l-4.6 4.6q-.15.15-.325.213t-.375.062" />
                        </svg>
                        <svg id="task_dropdown_up" onclick="toggleTaskList(${board.board_id},${index + 1})" onclick="toggleTaskList({{ board.board_id }},{{ loop.index }})" class="hide" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                            viewBox="0 0 24 24">
                            <path fill="currentColor"
                                d="M12 13.825L8.1 17.7q-.275.275-.687.288T6.7 17.7q-.275-.275-.275-.7t.275-.7l4.6-4.6q.15-.15.325-.213t.375-.062q.2 0 .375.062t.325.213l4.6 4.6q.275.275.288.688t-.288.712q-.275.275-.7.275t-.7-.275zm0-6L8.1 11.7q-.275.275-.687.288T6.7 11.7q-.275-.275-.275-.7t.275-.7l4.6-4.6q.15-.15.325-.212T12 5.425q.2 0 .375.063t.325.212l4.6 4.6q.275.275.288.688t-.288.712q-.275.275-.7.275t-.7-.275z" />
                        </svg>
                        <h5>${task.task}</h5>
                        <h4 class="prevent-select" style="color: rgba(0, 0, 0, 0.2); margin-left: 0.5rem;">|</h4>
                        <svg id="task_check" onclick="doneTask(${board.board_id},${task.task_id})" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                        <path fill="currentColor"
                            d="m10 13.6l5.9-5.9q.275-.275.7-.275t.7.275q.275.275.275.7t-.275.7l-6.6 6.6q-.3.3-.7.3t-.7-.3l-2.6-2.6q-.275-.275-.275-.7t.275-.7q.275-.275.7-.275t.7.275z" />
                    </svg>
                    </div>
                    <div class="dropzone dlist_item" style="display: none;">`
                    for (const li of task.list) {
                        tmp += `
                        <li class="draggable list_item" draggable="true" ondrop="taskLiDrop(event,${board.board_id},${index + 1})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 20 20"><path fill="currentColor" d="m7.825 10l2.9 2.9q.3.3.288.7t-.288.7q-.3.3-.7.313t-.7-.288L4.7 9.7q-.15-.15-.213-.325T4.426 9q0-.2.063-.375T4.7 8.3l4.575-4.575q.3-.3.713-.3t.712.3q.3.3.3.7t-.3.7L7.825 8H17q.825 0 1.413.588T19 10v9q0 .425-.288.713T18 20q-.425 0-.712-.288T17 19v-9z"/></svg>
                        <div>
                            <input class="input_checkbox" type="checkbox" onchange="updateTaskLi(${board.board_id},${index + 1})" ${li.checked ? 'checked' : ''}>
                            <h4 class="prevent-select" style="color: rgba(0, 0, 0, 0.2);">|</h4>
                            <h6>${li.content}</h6>
                        </div></li>`
                    }
                    tmp += `</div></div>`;
                    board_template += tmp;
                }
                board_template += `</div></div>`;
                document.getElementById('boards_view').innerHTML += board_template;
                loadDnD();
                updateAdderCenter();
            });
    }
    if (draggable.classList.contains('board_open')) {
        reset = false;
        const processedIDs = Array.from(document.getElementById('boards_view').children).map(child => {
            return Number(child.id.split('').slice(5).join(''));
        });
        updateData({ 'upd_boards': processedIDs });
    }
}
function boardTemp() {
    if (document.querySelector('#board_temp') == null) {
        let boards_list = document.getElementById(('boards_list'));
        const tmp = `
        <div id="board_temp" class="draggable board_closed" style="border-color: #555555;">
            <div class="input_default_box">
                <input id="board_name" type="text" placeholder="Board Name" maxlength="25">
            </div>
            <input id="board_color" class="input_color" type="color" value="#555555" oninput="document.getElementById('board_temp').style.borderColor=event.target.value">
        </div>`
        boards_list.innerHTML += tmp;

        let board_temp = document.querySelector('#board_temp');
        let board_name = document.getElementById('board_name');
        let board_adder = document.getElementById('board_adder');

        board_name.focus();
        board_name.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' && board_name.value != '') {
                updateData({ 'add_board': board_name.value, 'color': document.getElementById('board_color').value })
                    .then(res => { window.location.href = '/todos'; })
            }
        });

        document.addEventListener('click', function (event) {
            if (board_temp && !board_temp.contains(event.target) && event.target !== board_adder && !board_adder.contains(event.target)) {
                if (board_name.value != '') {
                    updateData({ 'add_board': board_name.value, 'color': document.getElementById('board_color').value })
                        .then(res => { window.location.href = '/todos'; })
                } else {
                    board_temp.remove();
                }
            }
        });
    }
}
function boardEdit(board_id, prev_name, prev_color) {
    if (document.querySelector('#board_temp') == null) {
        const tmp = `
        <div id="board_temp" class="draggable board_closed" style="border-color: #${prev_color};">
        <div class="input_default_box">
        <input id="board_name" type="text" placeholder="Board Name" maxlength="25" value="${prev_name}">
        </div>
        <input id="board_color" class="input_color" type="color" value="#${prev_color}" oninput="document.getElementById('board_temp').style.borderColor=event.target.value">
        </div>`
        let prev_board = document.querySelector('#board' + board_id + '.board_closed');
        prev_board.insertAdjacentHTML('beforebegin', tmp);
        prev_board.remove();

        let board_temp = document.querySelector('#board_temp');
        let board_name = document.getElementById('board_name');
        board_name.focus();
        board_name.setSelectionRange(board_name.value.length, board_name.value.length);
        board_name.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' && board_name.value != '') {
                updateData({ 'edit_board': board_id, 'name': board_name.value, 'color': document.getElementById('board_color').value })
                    .then(res => { window.location.href = '/todos'; })
            }
        });

        document.addEventListener('click', function (event) {
            if (board_temp && !board_temp.contains(event.target)
                && !isBoardEditE(event.target)) {
                if (board_name.value != '') {
                    updateData({ 'edit_board': board_id, 'name': board_name.value, 'color': document.getElementById('board_color').value })
                        .then(res => { window.location.href = '/todos'; })
                } else {
                    board_temp.remove();
                    window.location.href = '/todos';
                }
            }
        });
    }
}
function isBoardEditE(element) {
    if (element.nodeName === "svg" && element.getAttribute("onclick") && element.getAttribute("onclick").includes("boardEdit")) return true
    if (element.nodeName === "path") {
        let svgParent = element.closest('svg');
        if (svgParent && svgParent.getAttribute("onclick") && svgParent.getAttribute("onclick").includes("boardEdit")) return true
    }
    return false;
}

function addTask(event) {
    let task = document.getElementById('task_name').value;
    let board_id = document.getElementById('task_board').value;
    if (task != '' && board_id != '') {
        let time = document.getElementById('task_time').value;
        let date = document.getElementById('task_date').value;
        let datetime = date == '' || time == '' ? null : time + ' ' + date;
        let priority = document.querySelector('input[name="priorityGroup"]:checked').value;

        let n = document.querySelector('#board' + board_id + '.board_closed h5');
        n.textContent = Number(n.textContent) + 1;

        let b = document.querySelector('#board' + board_id + '.board_open .dropzone.dtask');
        updateData({ 'add_task': true, 'task': task, 'board_id': board_id, 'date': datetime, 'priority': priority })
            .then(res => {
                let id = res.task_id;
                if (b != null) {
                    let tmp = `
                    <div id="task${id}" class="draggable task" draggable="true">
                    <div style="border-color: var(--priority${priority});">
                        <svg id="task_dropdown_down" onclick="toggleTaskList(${board_id},${b.childElementCount + 1})" onclick="toggleTaskList({{ board.board_id }},{{ loop.index }})" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                            viewBox="0 0 24 24">
                            <path fill="currentColor"
                                d="M12 14.975q-.2 0-.375-.062T11.3 14.7l-4.6-4.6q-.275-.275-.275-.7t.275-.7q.275-.275.7-.275t.7.275l3.9 3.9l3.9-3.9q.275-.275.7-.275t.7.275q.275.275.275.7t-.275.7l-4.6 4.6q-.15.15-.325.213t-.375.062" />
                        </svg>
                        <svg id="task_dropdown_up" onclick="toggleTaskList(${board_id},${b.childElementCount + 1})" onclick="toggleTaskList({{ board.board_id }},{{ loop.index }})" class="hide" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                            viewBox="0 0 24 24">
                            <path fill="currentColor"
                                d="M12 13.825L8.1 17.7q-.275.275-.687.288T6.7 17.7q-.275-.275-.275-.7t.275-.7l4.6-4.6q.15-.15.325-.213t.375-.062q.2 0 .375.062t.325.213l4.6 4.6q.275.275.288.688t-.288.712q-.275.275-.7.275t-.7-.275zm0-6L8.1 11.7q-.275.275-.687.288T6.7 11.7q-.275-.275-.275-.7t.275-.7l4.6-4.6q.15-.15.325-.212T12 5.425q.2 0 .375.063t.325.212l4.6 4.6q.275.275.288.688t-.288.712q-.275.275-.7.275t-.7-.275z" />
                        </svg>
                        <h5>${task}</h5>
                        <h4 class="prevent-select" style="color: rgba(0, 0, 0, 0.2); margin-left: 0.5rem;">|</h4>
                        <svg id="task_check" onclick="doneTask(${board_id},${id})" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                        <path fill="currentColor"
                            d="m10 13.6l5.9-5.9q.275-.275.7-.275t.7.275q.275.275.275.7t-.275.7l-6.6 6.6q-.3.3-.7.3t-.7-.3l-2.6-2.6q-.275-.275-.275-.7t.275-.7q.275-.275.7-.275t.7.275z" />
                    </svg>
                    </div>
                    <div class="dropzone dlist_item" style="display: none;">
                    </div></div>`
                    b.innerHTML += tmp;
                }
            })
        clearInputs();
    }
}
function doneTask(board_id, task_id) {
    let t = document.querySelector('#board' + board_id + '.board_open #task' + task_id);
    if (t != null) {
        updateData({ 'rem_task': task_id, 'board_id': board_id, 'done': true });
        t.style.animation = "nope_out 0.5s ease forwards";
        const removeElementAfterAnimation = () => {
            t.removeEventListener('animationend', removeElementAfterAnimation);
            t.remove();
        };
        t.addEventListener('animationend', removeElementAfterAnimation);
    } else {
        updateData({ 'rem_task': task_id, 'board_id': board_id, 'done': false });
    }
    let n = document.querySelector('#board' + board_id + '.board_closed h5');
    n.textContent = Number(n.textContent) - 1;
}

function taskLiDrop(event, board, index) {
    const draggable = document.querySelector('.dragging');
    if (draggable.classList.contains('list_item')) {
        reset = false;
        updateTaskLi(board, index);
    }
}