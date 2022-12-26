// Select dom element
const showMsg = document.querySelector(".show-msg");
const hiddenId = document.getElementById("hidden_id");
const todoForm = document.querySelector("#todo-form");
const btnEdit = document.querySelectorAll(".btn-edit");
const btnSubmit = document.querySelector(".btn-submit");
const csrf_token = document.getElementById("csrf_token");
const formInput = document.getElementById("description");
const btnDelete = document.querySelectorAll(".btn-delete");
const todoItemsDes = document.querySelectorAll(".todo-des");
const filterButton = document.querySelector(".btn-clear-all");
const todoContainer = document.querySelector(".todo-items-gropu");

const todoData = [];

// handle error
const fireMsg = (msg, isErr = false) => {
  if (isErr) {
    showMsg.classList.add("form-error");
  } else {
    showMsg.classList.add("form-success");
  }
  showMsg.textContent = msg;
  setTimeout(() => {
    showMsg.classList.remove("form-error");
    showMsg.classList.remove("form-success");
    showMsg.textContent = "";
  }, 3000);
};

// fetch all todos
const onFetchTodos = async () => {
  try {
    const res = await fetch("todo/");

    if (!res.ok) {
      throw new Error(`Error: ${res.status} ${res.statusText}`);
    }
    const result = await res.json();
    return result;
  } catch (err) {
    fireMsg(err, true);
  }
};

// on add new todo data
const onCreateTodo = async (title) => {
  try {
    const res = await fetch("todo/", {
      headers: {
        "Content-type": "application/json",
        "X-CSRF-Token": csrf_token.value,
      },
      method: "POST",
      body: JSON.stringify({
        title: title,
        completed: false,
      }),
    });

    if (!res.ok) {
      throw new Error(`Error: ${res.status} ${res.statusText}`);
    }
    const result = await res.json();
    return result;
  } catch (err) {
    fireMsg(err, true);
  }
};

// on Update todo
const onUpdateTodo = async (id, title, completed = false) => {
  try {
    const res = await fetch(`todo/${id}`, {
      headers: {
        "Content-type": "application/json",
        "X-CSRF-Token": csrf_token.value,
      },
      method: "PUT",
      body: JSON.stringify({
        title: title,
        completed: completed,
      }),
    });
    if (!res.ok) {
      throw new Error(`Error: ${res.status} ${res.statusText}`);
    }
    const result = await res.json();
    return result;
  } catch (err) {
    fireMsg(err, true);
  }
};

// on Delete todo
const onDeleteTodo = async (id) => {
  try {
    const res = await fetch(`todo/${id}`, {
      headers: {
        "Content-type": "application/json",
        "X-CSRF-Token": csrf_token.value,
      },
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error(`Error: ${res.status} ${res.statusText}`);
    }
    const result = await res.json();
    return result;
  } catch (err) {
    fireMsg(err, true);
  }
};

// Render todos on dom
const render = (todos) => {
  todoContainer.innerHTML = "";
  if (todos.length > 0) {
    todos.forEach((todo) => {
      // create todo item
      const todoItem = document.createElement("li");
      todoItem.id = todo.id;
      todoItem.className = "todo-item";
      // todo checkbox
      const checkbox = document.createElement("input");
      checkbox.setAttribute("type", "checkbox");
      checkbox.id = "todo-compleate";

      checkbox.addEventListener("change", (e) => {
        this.onCompleate(e);
      });

      // todo description
      const todoDes = document.createElement("p");
      todoDes.className = "todo-des";
      todoDes.innerText = todo.title;

      // todo description
      const todoEditInput = document.createElement("input");
      todoEditInput.setAttribute("type", "text");
      todoEditInput.setAttribute("value", todo.title);
      todoEditInput.className = "todo-edit-input";

      // Add event on keypress in the textarea
      todoEditInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          editTodoItem(e);
        }
      });

      if (todo.completed) {
        checkbox.setAttribute("checked", "yes");
        todoItem.classList.add("done");
      }

      const editCompleted = document.createElement("button");
      editCompleted.className = "btn-delete";
      editCompleted.innerHTML = `<img src="../static/assets/replace-24.png" alt="Delete" />`;

      // todo edit button
      const editBtn = document.createElement("button");
      editBtn.className = "btn-edit";
      editBtn.innerHTML = `<img src="../static/assets/edit-24.png" alt="...">`;
      editBtn.addEventListener("click", (e) => {
        const parent = e.target.parentElement.parentElement;
        const getTotodes = parent.querySelector(".todo-des").innerText;
        formInput.value = getTotodes;
        document.getElementById("hidden_id").value = parent.id;
        formInput.focus();
      });

      // todo delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn-delete";
      deleteBtn.innerHTML = `<img src="../static/assets/trash-24.png" alt="Delete" />`;
      deleteBtn.addEventListener("click", (e) => {
        deleteEvent(e);
      });

      // Append all the todo elements inside the todoItems
      todoItem.append(checkbox, todoDes, editBtn, deleteBtn);

      // appent the todo item inside todoContainer
      todoContainer.appendChild(todoItem);
    });
  } else {
    todoContainer.innerHTML =
      '<p class="no-item">There is no todo to show! Please add a new one.</p>';
  }
};

// // add todo item in dom
// const addTodoItemOnDom = (title, id) => {
//   const newTodo = document.createElement("li");
//   newTodo.id = id;
//   newTodo.className = "todo-item";
//   newTodo.innerHTML = `<input type="checkbox" id="todo-compleate"><p class="todo-des">${title}</p><button class="btn-three-dot"><img src="../static/assets/three-dot-24.png" alt="More">`;
//   todoContainer.appendChild(newTodo);
// };

const submitOntodo = async (e) => {
  const title = e.target.value;
  if (hiddenId.value.length > 1) {
    const result = await onUpdateTodo(hiddenId.value, title);
    if (result) {
      fireMsg(result.message);
      render(result.todos);
      hiddenId.value = "";
      formInput.value = "";
    }
  } else {
    const result = await onCreateTodo(title);

    if (result) {
      fireMsg(result.message);
      render(result.todos);
      formInput.value = "";
      hiddenId.value = "";
    }
  }
};

// add new todos
formInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    submitOntodo(e);
  }
});

// btnSubmit
btnSubmit.addEventListener("click", (e) => {
  e.preventDefault();
  submitOntodo(e);
});

const deleteEvent = async (e) => {
  const id = e.target.parentElement.parentElement.id;
  const result = await onDeleteTodo(id);
  e.target.setAttribute("disabled", "");
  if (result) {
    fireMsg(result.message, false);
    render(result.todos);
  }
};

const editTodoItem = (e) => {
  console.log(e);
};

window.onload = async () => {
  const result = await onFetchTodos();
  if (result) {
    render(result.data);
  }
};
