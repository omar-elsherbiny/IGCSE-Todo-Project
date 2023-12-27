document.addEventListener('DOMContentLoaded', function () {
    loadDnD();
    updateAdderCenter();
})

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
            }
        })

        draggable.addEventListener('dragend', function () {
            draggable.classList.remove('dragging');
            re_container, re_afterE = null;
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
            if (draggable!=null && checkValidTags(draggable, container)) {
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
    event.preventDefault();
    const draggable = document.querySelector('.dragging');

    let valid = [draggable.classList.contains('board_closed'), draggable.classList.contains('board_open'), draggable.classList.contains('task'), draggable.classList.contains('list_item')];
    if (valid.some(e => e === true)) {
        draggable.remove();
        document.getElementById('trash').classList.remove('open');
        console.log(valid);
    }
}