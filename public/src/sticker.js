import Draggable from "./draggable.js";
import Todo from "./todo.js";
import createEl from "./utile.js";

const COLOR_START = 150;
const COLOR_END = 200;

//랜덤 배경 생성 rgb 값
function createColor() {
  const r =
    Math.floor(Math.random() * (COLOR_START - COLOR_END + 1)) + COLOR_START;
  const g =
    Math.floor(Math.random() * (COLOR_START - COLOR_END + 1)) + COLOR_START;
  const b =
    Math.floor(Math.random() * (COLOR_START - COLOR_END + 1)) + COLOR_START;

  return `rgb(${r}, ${g}, ${b})`;
}

export default class Sticker extends Draggable {
  static new(root, { id, title, color, todoList }) {
    const sticker = new Sticker(root, id);
    sticker.createSticker(title, color);
    todoList.forEach((text) => sticker.add(Todo.new(text)));
    return sticker;
  }
  constructor(root, stikerId) {
    super("li", "stickerBoard"); //상속받는 constructor를 호출
    this.root = root;
    this.stikerId = stikerId;
    this.stikerTitle = null;
    this.StickerColor = "";
    this.todoList = [];
  }

  update() {
    this.root.update();
  }

  setStickerColor(color = createColor()) {
    this.StickerColor = color;
    this.element.style.background = this.StickerColor;
  }

  findTodo(x, y) {
    // console.log(x, y);
    return this.todoList.find(({ element }) => {
      const rect = element.getBoundingClientRect();
      const [x1, y1, x2, y2] = [
        rect.x,
        rect.y,
        rect.x + rect.width,
        rect.y + rect.height,
      ];
      return x1 <= x && x <= x2 && y1 <= y && y <= y2;
    });
  }

  //스티커 타이틀 텍스트 갱신
  setStikerTitle(text = `Sticker${this.stikerId}`) {
    this.stikerTitle = text;
    this.element.querySelector(".stickerTitle").innerText = this.stikerTitle;
    this.update();
  }

  //스티커 타이틀 수정
  modifyTitleText(event, targetTitleText) {
    event.stopPropagation();

    const titleInputEl = createEl("input", "stikerTitleinput");
    titleInputEl.value = targetTitleText.textContent; //인풋에 있는 값빼오기

    //값이 있는 경우에만 변경
    titleInputEl.onblur = () => {
      if (titleInputEl.value) {
        targetTitleText.textContent = titleInputEl.value;
        this.setStikerTitle(titleInputEl.value);
      }

      titleInputEl.remove();
      targetTitleText.hidden = false;
    };

    targetTitleText.before(titleInputEl);
    titleInputEl.focus(); //포커스
    titleInputEl.select(); //전체 다블록 잡아줌
    targetTitleText.hidden = true; //원본 숨김
  }

  //스티커 삭제
  deleteSticker(event) {
    event.stopPropagation();
    this.root.delete(this);
  }

  //스티커 엘리먼트 생성
  createSticker(title, color) {
    const stickerTopEl = createEl("div", "stickerTop");
    const stickerTitleEl = createEl("div", "stickerTitle");
    const listCreateBtn = createEl("button", "listCreateBtn");
    const stickerRemoveBtn = createEl("button", "stickerRemoveBtn");
    const stickerBottomEl = createEl("ul", "stickerBottom");

    this.element.classList.add("draggable");
    this.setStickerColor(color); //배경색 지정

    listCreateBtn.innerText = "항목 추가";
    stickerRemoveBtn.innerText = "스티커 삭제";

    stickerTopEl.appendChild(stickerTitleEl);
    stickerTopEl.appendChild(listCreateBtn);
    stickerTopEl.appendChild(stickerRemoveBtn);

    this.element.appendChild(stickerTopEl);
    this.element.appendChild(stickerBottomEl);

    this.setStikerTitle(title);

    this.root.targetStickersEl.insertBefore(
      this.element,
      this.root.targetStickersEl.lastChild.previousElementSibling
    );

    stickerTitleEl.addEventListener("click", (event) => {
      this.modifyTitleText(event, stickerTitleEl);
    });

    this.setVertical(false);
  }

  add(todo) {
    this.todoList.push(todo);
    this.element.lastChild.appendChild(todo.element);
    todo.setParent(this);
    this.update();
  }

  onClick(event) {
    if (event.target.className === "listCreateBtn") {
      const todoItem = new Todo(this);
      todoItem.createTodoItem();
      this.add(todoItem); //객체 배열에 추가
      return;
    }

    //제거 버튼 클릭
    if (event.target.className === "stickerRemoveBtn") {
      console.log(this.root);
      this.root.delete(this);
    }
  }

  delete(todo) {
    this.element.lastChild.removeChild(todo.element); //투투 아이템 엘리먼트 삭제
    this.todoList = this.todoList.filter((target) => target !== todo);
    this.update();
  }

  move(nextSticker, todo) {
    if (!this.todoList.includes(todo)) {
      return;
    }
    console.log("move!");
    this.delete(todo);
    nextSticker.add(todo);
  }

  toJson() {
    return {
      id: this.stikerId,
      title: this.stikerTitle,
      color: this.StickerColor,
      todoList: [...this.element.querySelectorAll(".itemTitle")].map(
        (el) => el.innerText
      ),
    };
  }
}
