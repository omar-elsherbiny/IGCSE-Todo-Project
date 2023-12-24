document.addEventListener('DOMContentLoaded', function () {
    loadDnD();
    updateAdderCenter();
})

function loadDnD() {
    const draggables = document.querySelectorAll('.draggable');
    const containers = document.querySelectorAll('.dropzone');
    let po_afterE;

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', function () {
            if (document.querySelector('.dragging') == null) {
                draggable.classList.add('dragging');
            }
        })

        draggable.addEventListener('dragend', function () {
            draggable.classList.remove('dragging');
            po_afterE = null;
        })
    })

    containers.forEach(container => {
        container.addEventListener('dragover', event => {
            event.preventDefault();
            const draggable = document.querySelector('.dragging');
            if (checkValidTags(draggable, container)) {
                po_afterE = getDragAfter(container, event.clientY);
            }
        })

        container.addEventListener('drop', event => {
            event.preventDefault();
            const draggable = document.querySelector('.dragging');
            if (container.classList.contains("dropzone")) {
                container.classList.remove("dragover");
                handleDragHover(false, draggable, draggable.parentNode, draggable.nextElementSibling, container, po_afterE);
            }
            if (checkValidTags(draggable, container)) {
                console.log('just before', draggable);
                handleDragDrop(draggable, draggable.parentNode, draggable.nextElementSibling, container, po_afterE);
            }
            po_afterE = null;
        })

        container.addEventListener('dragenter', event => {
            const draggable = document.querySelector('.dragging');
            if (container.classList.contains("dropzone") && checkValidTags(draggable, container)) {
                container.classList.add("dragover");
                handleDragHover(true, draggable, draggable.parentNode, draggable.nextElementSibling, container, po_afterE);
            }
        })

        container.addEventListener('dragleave', event => {
            const draggable = document.querySelector('.dragging');
            if (container.classList.contains("dropzone")) {
                const newTarget = event.relatedTarget;
                if (!newTarget || !container.contains(newTarget)) {
                    // Check if the new target is not a child of the container
                    container.classList.remove("dragover");
                    handleDragHover(false, draggable, draggable.parentNode, draggable.nextElementSibling, container, po_afterE);
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

const draggable_tags = ['board', 'task', 'list_item'];
function checkValidTags(draggable, container) {
    for (let i = 0; i < draggable_tags.length; i++) {
        if (draggable.classList.contains(draggable_tags[i]) && container.classList.contains(draggable_tags[i])) {
            return true;
        }
    }
    return false;
}

function handleDragHover(ishover, draggable, prev_container, prev_afterE, dest_container, dest_afterE) {
    console.log('inside', draggable)
    if (dest_container.id == 'trash') {
        if (ishover) {
            document.getElementById('trash').classList.add('open');
        } else {
            document.getElementById('trash').classList.remove('open');
        }
    }
}

function handleDragDrop(draggable, prev_container, prev_afterE, dest_container, dest_afterE) {
    if (dest_container.id == 'trash') {
        if (prev_container.id == 'boards_list') {

        } else {
            if (draggable.classList.contains('board')) {
                const idx = Number(draggable.id.split('').slice(5).join(''));
                updateData({ 'rem_board': idx });
            }
            prev_container.removeChild(draggable);
            updateAdderCenter();
        }
    }
    if (dest_container.id == 'boards_view' && prev_container.id == 'boards_list' && draggable.classList.contains('board')) {
        const idx = Number(draggable.id.split('').slice(5).join(''));
        updateData({ 'get_board': idx })
            .then(board => {
                if (board == null) { return; }
                let board_template = `
                <div id="board${board.board_id}" class="draggable board open" draggable="true">
                    <div style="border-color: #${board.color};">
                        <h4>${board.board_name}</h4>
                        <input class="pin" type="checkbox" ${board.is_pinned ? 'checked' : ''}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m13.827 1.69l8.486 8.485l-1.415 1.414l-.707-.707l-4.242 4.243l-.707 3.536l-1.415 1.414l-4.242-4.243l-4.95 4.95l-1.414-1.414l4.95-4.95l-4.243-4.243l1.414-1.414l3.536-.707l4.242-4.243l-.707-.707zm.707 3.536l-4.67 4.67l-2.822.565l6.5 6.5l.564-2.822l4.671-4.67z"/></svg>
                    </div>
                    <div class="dropzone task">`;
                for (const task of board.tasks) {
                    let tmp = `
                    <div class="draggable task" draggable="true">
                    <div>
                        <svg class="task_dropdown" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 14.975q-.2 0-.375-.062T11.3 14.7l-4.6-4.6q-.275-.275-.275-.7t.275-.7q.275-.275.7-.275t.7.275l3.9 3.9l3.9-3.9q.275-.275.7-.275t.7.275q.275.275.275.7t-.275.7l-4.6 4.6q-.15.15-.325.213t-.375.062"/></svg>
                        <h5>${task.task}</h5>
                        <h4 class="prevent-select" style="color: rgba(0, 0, 0, 0.2); margin-left: 0.5rem;">|</h4>
                        <svg class="task_check" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m10 13.6l5.9-5.9q.275-.275.7-.275t.7.275q.275.275.275.7t-.275.7l-6.6 6.6q-.3.3-.7.3t-.7-.3l-2.6-2.6q-.275-.275-.275-.7t.275-.7q.275-.275.7-.275t.7.275z"/></svg>
                    </div>
                    <div class="list_item dropzone">`
                    for (const li of task.list) {
                        tmp += `
                        <li class="draggable list_item" draggable="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 20 20"><path fill="currentColor" d="m7.825 10l2.9 2.9q.3.3.288.7t-.288.7q-.3.3-.7.313t-.7-.288L4.7 9.7q-.15-.15-.213-.325T4.426 9q0-.2.063-.375T4.7 8.3l4.575-4.575q.3-.3.713-.3t.712.3q.3.3.3.7t-.3.7L7.825 8H17q.825 0 1.413.588T19 10v9q0 .425-.288.713T18 20q-.425 0-.712-.288T17 19v-9z"/></svg>
                        <div>
                            <input class="input_checkbox" type="checkbox" ${li.checked ? 'checked' : ''}>
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
}

function updateAdderCenter() {
    let adder = document.getElementById('adder');
    if (document.getElementById('boards_view').childElementCount == 0) {
        adder.classList.add('center');
    } else {
        adder.classList.remove('center');
    }
}

function updateData(data) {
    return fetch('/receive_data', {
        method: 'PUT',
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