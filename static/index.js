// Select dom element
const showMsg = document.querySelector(".show-msg");
const btnSubmit = document.querySelector(".btn-submit");
const formInput = document.getElementById("description");
const todoItemsDes = document.querySelectorAll(".todo-des");
const filterButton = document.querySelector(".btn-clear-all");
const todoContainer = document.querySelector(".todo-items-gropu");

const todoData = [];

const fetchTodos = async () => {
  const res = await fetch("todo/");

  if (!res.ok) {
    console.log(res);
  }

  const result = await res.json();
  console.log(result);
};

window.onload = () => {
  // fetchTodos();
  console.log("hi");
};
