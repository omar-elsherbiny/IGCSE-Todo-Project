document.addEventListener('DOMContentLoaded', function () {
    const draggables = document.querySelectorAll('.draggable');
    const containers = document.querySelectorAll('.dropbox');

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', function () {
            draggable.classList.add('dragging');
        })

        draggable.addEventListener('dragend', function () {
            draggable.classList.remove('dragging');
        })
    })

    containers.forEach(container => {
        container.addEventListener('dragover', e => {
            e.preventDefault();
            const afterE = getDragAfter(container, e.clientY);
            const draggable = document.querySelector('.dragging');
            if (afterE==null) {
                container.appendChild(draggable);
            } else {
                container.insertBefore(draggable,afterE);
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