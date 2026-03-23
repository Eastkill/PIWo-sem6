List = null;

function addTask(list, revText = null) {
  let text = "";

  if (revText != null) {
    text = revText;
  } else {
    text = list.querySelector("input[type='text']").value;
    list.querySelector("input[type='text']").value = "";
  }

  if (text == "") {
    alert("Nie można dodać pustego zadania!");
    return;
  }

  list.querySelector("ul").innerHTML += `

  <li class="list-group-item d-flex justify-content-between align-items-center">

    <div class="d-flex align-items-center gap-2">

      <input
        type="checkbox"
        class="form-check-input"
        onclick="toggleTask(this.parentElement.parentElement)"
      >

      <span class="list-text">${text}</span>

    </div>

    <div class="d-flex align-items-center gap-2">

      <small class="date text-muted"></small>

      <button
        class="btn btn-sm btn-danger"
        onclick="deleteTask(this.parentElement.parentElement)"
      >
        X
      </button>

    </div>

  </li>

  `;
}
function addList() {
  element = document.getElementById("listInput");

  if (element.value == "") return;

  name = element.value;
  element.value = "";

  listContainer = document.getElementById("listContainer");

  const id = "list_" + Date.now();

  listContainer.innerHTML += `

  <div class="card mb-3 shadow-sm">

    <div class="card-header d-flex justify-content-between align-items-center">

      <button
        class="btn btn-link text-decoration-none"
        data-bs-toggle="collapse"
        data-bs-target="#${id}"
      >
        <strong>${name}</strong>
      </button>

      <button
        class="btn btn-sm btn-danger"
        onclick="deleteList(this.parentElement.parentElement)"
      >
        X
      </button>

    </div>

    <div id="${id}" class="collapse show">

      <div class="card-body">

        <ul class="list-group mb-2"></ul>

        <div class="input-group">

          <input
            type="text"
            class="form-control"
            placeholder="Nowe zadanie"
          />

          <button
            class="btn btn-success"
            onclick="addTask(this.parentElement.parentElement)"
          >
            Dodaj
          </button>

        </div>

      </div>

    </div>

  </div>

  `;
}
function swapList(listSel) {
  list = listSel;
  console.log(list);
}
function deleteList(list) {
  if (!confirm("Czy na pewno chcesz usunąć listę: " + list.querySelector("p").innerText + "?" )) return;
  list.remove();
}
function deleteTask(task) {

  if (
    !confirm(
      "Czy na pewno chcesz usunąć zadanie: " +
        task.querySelector(".list-text").innerText +
        "?"
    )
  )
    return;

  Trashbin = document.getElementById("Trashbin");

  Trashbin.innerHTML = `

    <button
      class="btn btn-warning mb-2"
      onclick="revert()"
    >
      Cofnij
    </button>

    <div class="alert alert-secondary">
      ${task.querySelector(".list-text").innerText}
    </div>

  `;

  List = task.closest(".card-body");

  task.remove();
}
function toggleTask(task) {

  checked =
    task.querySelector("input").checked;

  task.querySelector(".list-text").style.textDecoration =
    checked ? "line-through" : "none";

  task.querySelector(".date").innerText =
    checked
      ? "Zrobione: " + new Date().toLocaleString()
      : "";
}
function revert() {

  const text =
    Trashbin.querySelector(".alert").innerText;

  addTask(List, text);

  Trashbin.innerHTML =
    '<p class="text-muted">Brak usuniętych zadań</p>';
}


function searchTasks() {

  const text =
    document.getElementById("searchInput").value;

  const ignoreCase =
    document.getElementById("caseCheck").checked;

  const tasks =
    document.querySelectorAll(".list-text");
  console.log(tasks);
  tasks.forEach(task => {

    let taskText = task.innerText;

    let searchText = text;

    if (ignoreCase) {
      taskText = taskText.toLowerCase();
      searchText = searchText.toLowerCase();
    }

    if (taskText.includes(searchText)) {
      task.closest("li").classList.remove("d-none");
    } else {
      task.closest("li").classList.add("d-none");
    }

  });

}