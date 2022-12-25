// Select dom element
const showMsg = document.querySelector('.show-msg');
const todoForm = document.querySelector('#todo-form');
const btnSubmit = document.querySelector('.btn-submit');
const formInput = document.getElementById('description');
const todoItemsDes = document.querySelectorAll('.todo-des');
const filterButton = document.querySelector('.btn-clear-all');
const todoContainer = document.querySelector('.todo-items-gropu');
const csrf_token = document.getElementById('csrf_token');

const todoData = [];

// handle error
const fireMsg = (msg, isErr=false) => {
  if(isErr) {
    showMsg.classList.add('form-error');
  }else {
    showMsg.classList.add('form-success');
  }
  showMsg.textContent = msg;
  setTimeout(() => {
    showMsg.classList.remove('form-error');
    showMsg.classList.remove('form-success');
    showMsg.textContent = '';
  }, 3000)
}

// fetch all todos
const onFetchTodos = async () => {
  try {
    const res = await fetch('todo/')
  
    if(!res.ok) {
      throw new Error(`Error: ${res.status} ${res.statusText}`)
    }
    const result = await res.json()
    return result;

  } catch (err){
    fireMsg(err, true)
  }
}

// on add new todo data
const onCreateTodo = async (title) => {
  try {
    const res = await fetch('todo/',{
      headers: {
        "Content-type": "application/json",
        "X-CSRF-Token": csrf_token.value,
      },
      method: "POST",
      body: JSON.stringify({
        title: title,
        completed: false
      })
    });
  
    if(!res.ok) {
      throw new Error(`Error: ${res.status} ${res.statusText}`)
    }
    const result = await res.json();
    return result;
  } catch (err) {
    fireMsg(err, true)
  }
}


// Render todos on dom
const render = (todos) => {
  todoContainer.innerHTML = '';
    if (todos.length > 0) {
      todos.forEach((todo) => {
      // create todo item
        const todoItem = document.createElement('li');
        todoItem.id = todo.id;
        todoItem.className = 'todo-item';
        todoItem.setAttribute('draggable', true);

        // drag and drop function;
        todoItem.addEventListener('dragstart', () => {
          todoItem.classList.add('dragging');
        });

        todoItem.addEventListener('dragend', () => {
          todoItem.classList.remove('dragging');
        });

        // todo checkbox
        const checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.id = 'todo-compleate';

        checkbox.addEventListener('change', (e) => {
          this.onCompleate(e);
        });

        // todo description
        const todoDes = document.createElement('p');
        todoDes.className = 'todo-des';
        todoDes.innerText = todo.title;

        if (todo.completed) {
          checkbox.setAttribute('checked', 'yes');
          todoDes.classList.add('todo-compleated');
        }

        // todo Three dot button
        const threeDotButton = document.createElement('button');
        threeDotButton.className = 'btn-three-dot';
        threeDotButton.innerHTML = `<img src="../static/assets/three-dot-24.png" alt="...">`;

        // add event on three icon for edit and delete.
        threeDotButton.addEventListener('click', (e) => {
          this.onClickTodoDes(e);
        });

        // Append all the todo elements inside the todoItems
        todoItem.append(checkbox, todoDes, threeDotButton);

        // appent the todo item inside todoContainer
        todoContainer.appendChild(todoItem);
      });
    } else {
      todoContainer.innerHTML = '<p class="no-item">There is no todo to show! Please add a new one.</p>';
    }
}


// add todo item in dom
const addTodoItemOnDom = (title, id) => {
  const newTodo = document.createElement('li');
    newTodo.id = id
    newTodo.className = "todo-item"
    newTodo.innerHTML = `<input type="checkbox" id="todo-compleate"><p class="todo-des">${title}</p><button class="btn-three-dot"><img src="../static/assets/three-dot-24.png" alt="More">`;
    todoContainer.appendChild(newTodo)
}

// add new todos
formInput.addEventListener('keypress', async(e) => {
  if(e.key === 'Enter') {
    e.preventDefault();
    const title = e.target.value;
    const result = await onCreateTodo(title)

    if(result) {
      fireMsg(result.message)
      addTodoItemOnDom(title, result.todo_id)
    };
  }
})

// btnSubmit
btnSubmit.addEventListener('click', async(e) => {
  e.preventDefault();
  const title = formInput.value
  const result = await onCreateTodo(title)
  console.log(result)
  if(result) {
      fireMsg(result.message)
      addTodoItemOnDom(title, result.todo_id)
    };
});

window.onload = async() => {
  const result = await onFetchTodos();
  if(result) {
    render(result.data)
  }
}