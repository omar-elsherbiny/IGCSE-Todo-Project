document.addEventListener('DOMContentLoaded', function () {
    const draggables = document.querySelectorAll('.draggable');
    const containers = document.querySelectorAll('.dropzone');
    let re_draggable, re_container, re_afterE;

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', function () {
            draggable.classList.add('dragging');
        })

        draggable.addEventListener('dragend', function () {
            draggable.classList.remove('dragging');
        })
    })

    containers.forEach(container => {
        container.addEventListener('dragover', event => {
            event.preventDefault();
            const afterE = getDragAfter(container, event.clientY);
            const draggable = document.querySelector('.dragging');
            if (afterE == null) {
                container.appendChild(draggable);
            } else {
                container.insertBefore(draggable, afterE);
            }
        })

        container.addEventListener('drop', event => {
            event.preventDefault();
            if (re_afterE == null) {
                re_container.appendChild(re_draggable);
                console.log(re_container, re_draggable);
            } else {
                re_container.insertBefore(re_draggable, re_afterE);
            }
            handleDragDrop(re_draggable, container, re_container);
            re_draggable, re_container, re_afterE = null;
        })

        container.addEventListener('dragenter', event => {
            if (container.classList.contains("dropzone")) {
                container.classList.add("dragover");
                const draggable = document.querySelector('.dragging');
                [re_draggable, re_container, re_afterE] = [draggable, draggable.parentElement, draggable.nextElementSibling];
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

function handleDragDrop(draggable, container, prev_container) {

}