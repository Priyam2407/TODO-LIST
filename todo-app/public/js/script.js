async function fetchTodos() {
  const res = await fetch('/todos');
  const todos = await res.json();
  renderTasks(todos);
}

function renderTasks(todos) {
  const list = document.getElementById('todo-list');
  list.innerHTML = '';
  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';

    const text = document.createElement('span');
    text.textContent = todo.task;
    if (todo.completed) text.style.textDecoration = 'line-through';

    const doneBtn = document.createElement('button');
    doneBtn.textContent = '✓';
    doneBtn.className = 'btn btn-sm btn-success me-1';
    doneBtn.onclick = () => updateTask(todo.id, todo.task, !todo.completed);

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'btn btn-sm btn-primary me-1';
    editBtn.onclick = () => {
      const newTask = prompt("Edit task", todo.task);
      if (newTask) updateTask(todo.id, newTask, todo.completed);
    };

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'btn btn-sm btn-danger';
    delBtn.onclick = () => deleteTask(todo.id);

    const btns = document.createElement('div');
    btns.appendChild(doneBtn);
    btns.appendChild(editBtn);
    btns.appendChild(delBtn);

    li.appendChild(text);
    li.appendChild(btns);
    list.appendChild(li);
  });
}

async function updateTask(id, task, completed) {
  await fetch('/update-todo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, task, completed })
  });
  fetchTodos();
}

async function deleteTask(id) {
  await fetch('/delete-todo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  fetchTodos();
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.querySelector('#task-input');
      const task = input.value.trim();
      if (!task) return;
      await fetch('/add-todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task })
      });
      input.value = '';
      fetchTodos();
    });
  }

  fetchTodos();
});
