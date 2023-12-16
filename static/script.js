document.addEventListener('DOMContentLoaded', function () {
    const draggables = document.querySelectorAll('.draggable');
    const containers = document.querySelectorAll('.dropzone');
    let re_container, re_afterE;

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', function () {
            draggable.classList.add('dragging');
            [re_container, re_afterE] = [draggable.parentElement, draggable.nextElementSibling];
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
                } else {
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
            if (checkValidTags(draggable, container)) {
                if (re_afterE == null) {
                    re_container.appendChild(draggable);
                } else {
                    re_container.insertBefore(draggable, re_afterE);
                }
                handleDragDrop(draggable, re_container, re_afterE, container, draggable.nextElementSibling);
            }
            re_container, re_afterE = null;
        })

        container.addEventListener('dragenter', event => {
            if (container.classList.contains("dropzone") && checkValidTags(document.querySelector('.dragging'), container)) {
                container.classList.add("dragover");
            }
        })

        container.addEventListener('dragleave', event => {
            if (container.classList.contains("dropzone")) {
                container.classList.remove("dragover");
            }
        })
    })
})

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

function handleDragDrop(draggable, prev_container, prev_afterE, dest_container, dest_afterE) {
    console.log(prev_container, dest_container)
}