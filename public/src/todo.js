import Draggable from "./draggable.js";
import createEl from "./utile.js";

const modalEl = document.querySelector("#modal");
export default class Todo extends Draggable {
  static new(text) {
    const todo = new Todo();
    todo.createTodoItem();
    todo.setItemText(text);
    return todo;
  }
  constructor() {
    super("li", "todoItem", true); //상속받는 constructor를 호출

    this.parent = null; //Sticker 바라보는 클래스 변수
    this.itemText = null;

    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
  }

  update() {
    if (this.parent) {
      this.parent.update();
    }
  }

  setItemText(text) {
    if (this.itemText === text) {
      return;
    }
    this.itemText = text;
    this.element.firstChild.firstChild.innerText = this.itemText;
    this.update();
  }

  //부모 재지정
  setParent(parent) {
    this.parent = parent;

    if (this.isDraggingStarted) {
      this.createPlaceholder();
    }
  }

  mouseMoveHandler(event) {
    //내 스티커, 이동하는 스티커 좌표 체크 오버라이딩
    const newSticker = this.parent.root.findSticker(
      event.clientX,
      event.clientY
    );
    const mySticker = this.parent; //부모 Sticker 클래스

    if (newSticker && newSticker !== mySticker) {
      mySticker.move(newSticker, this);
    }

    //새로운 플레이스 홀더 위치 끼워넣기
    const newTodo = this.parent.findTodo(event.clientX, event.clientY);

    //드래그 클래스 원본 mouseMoveHandler()
    super.mouseMoveHandler(event);
  }

  modifyTodoText(event, itemTitle) {
    event.stopPropagation();
    const rect = itemTitle.parentElement.parentElement.getBoundingClientRect();
    const modalArea = createEl("div", "modalArea");
    const modalBoard = createEl("div", "modalBoard");
    const inputBox = createEl("textarea", "textareaBox");
    const saveBtn = createEl("button", "saveBtn");

    modalBoard.style.top = `${rect.top}px`;
    modalBoard.style.left = `${rect.left}px`;
    saveBtn.style.top = `${rect.top + 150}px`;
    saveBtn.style.left = `${rect.left}px`;
    saveBtn.innerText = "Save";
    inputBox.value = itemTitle.innerText;

    modalBoard.appendChild(inputBox);
    modalArea.appendChild(modalBoard);
    modalArea.appendChild(saveBtn);
    modalEl.appendChild(modalArea);

    inputBox.focus(); //포커스
    inputBox.select(); //전체 다블록 잡아줌

    modalArea.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    modalEl.addEventListener("click", (event) => {
      modalArea.remove();
      modalEl.classList.remove("isActive");
    });

    saveBtn.addEventListener("click", () => {
      //값이 있는 경우에만 변경
      if (inputBox.value) {
        itemTitle.innerText = inputBox.value;
        this.setItemText(inputBox.value); //this.itemText 변경
      }
      modalArea.remove();
      modalEl.classList.remove("isActive");
    });
  }

  //투두 아이템 삭제
  deleteTodoItem(event) {
    event.stopPropagation();
    this.parent.delete(this);
  }

  createTodoItem() {
    const itemArea = createEl("div", "itemArea");

    const delBtn = createEl("button", "delBtn");
    const itemTitleEl = createEl("span", "itemTitle");

    this.element.classList.add("draggable");

    delBtn.innerText = `삭제`;

    itemArea.appendChild(itemTitleEl);
    itemArea.appendChild(delBtn);
    this.element.appendChild(itemArea);
    this.setItemText("기본");
  }

  onClick(event) {
    if (event.target.className === "itemTitle") {
      modalEl.classList.add("isActive");
      this.modifyTodoText(event, this.element.querySelector(".itemTitle"));
      return;
    }
    if (event.target.className === "delBtn") {
      this.deleteTodoItem(event);
    }
  }
}
