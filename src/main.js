const createBtn = document.querySelector("#createBtn");
const itemLists = document.querySelector(".itemLists");

const COLOR_START = 150;
const COLOR_END = 200;

//엘리먼트 생성, 클래스 이름 부여
function createEl(elKind, className = "") {
  const el = document.createElement(elKind);
  el.className = className;

  return el;
}

class Todo {
  constructor(itemLists) {
    this.todoDic = {};
    this.todoNum = 0;
    this.startPos = {
      x: 0,
      y: 0,
    };

    this.targetItemLists = itemLists;
  }

  getTodoNum() {
    this.todoNum += 1;
    return this.todoNum;
  }

  //생성 시작 좌표 +10 증가
  getStartPos() {
    this.startPos.x += 10;
    this.startPos.y += 10;
  }

  addSticker() {
    this.getStartPos();
    const sticker = new Sticker(this.getTodoNum(), this.startPos, this);
    this.todoDic[this.todoNum] = sticker;
  }
}

class Sticker {
  constructor(todoNum, startPos, todo) {
    this.stickerNum = todoNum;
    this.myTodo = todo;
    this.StickerColor = "";
    this.currentPosX = startPos.x;
    this.currentPosY = startPos.y;
    this.listNum = 0;

    this.createSticker();
  }

  //스티커 각각에게 번호 부여
  getStickerListNum() {
    this.listNum += 1;
    return this.listNum;
  }

  //랜덤 배경 생성 rgb 값
  changeBackground() {
    const r =
      Math.floor(Math.random() * (COLOR_START - COLOR_END + 1)) + COLOR_START;
    const g =
      Math.floor(Math.random() * (COLOR_START - COLOR_END + 1)) + COLOR_START;
    const b =
      Math.floor(Math.random() * (COLOR_START - COLOR_END + 1)) + COLOR_START;

    return `rgb(${r}, ${g}, ${b})`;
  }

  removeSticker(event) {
    console.log("제거 버튼 클릭", event);
  }

  addDragEvent(event, targetEl) {
    const clinetReact = targetEl.getBoundingClientRect();
    const shiftX = event.clientX - clinetReact.x;
    const shiftY = event.clientY - clinetReact.y;

    const orgZIndex = targetEl.style.zIndex;
    targetEl.style.zIndex = 1000;

    const dragHandler = (event) => {
      targetEl.style.left = `${event.clientX - shiftX}px`;
      targetEl.style.top = `${event.clientY - shiftY}px`;
    };

    document.addEventListener("mousemove", dragHandler);

    const dropHandler = () => {
      targetEl.style.zIndex = orgZIndex;
      document.removeEventListener("mouseup", dropHandler);
      document.removeEventListener("mousemove", dragHandler);
    };

    document.addEventListener("mouseup", dropHandler);
  }

  createSticker() {
    const stickerBoardEl = createEl("div", "stickerBoard");
    const stickerTitleEl = createEl("div", "stickerTitle");
    const listCreateBtn = createEl("button", "listCreateBtn");
    const stickerRemoveBtn = createEl("button", "stickerRemoveBtn");
    const stickerLists = createEl("ul", "stickerLists");

    stickerBoardEl.style.background = this.changeBackground(); //배경색 지정
    stickerBoardEl.style.left = `${this.currentPosX}px`;
    stickerBoardEl.style.top = `${this.currentPosY}px`;
    stickerTitleEl.innerText = `Sticker${this.stickerNum}`;
    listCreateBtn.innerText = "항목 추가";
    stickerRemoveBtn.innerText = "스티커 삭제";

    stickerBoardEl.appendChild(stickerTitleEl);
    stickerBoardEl.appendChild(listCreateBtn);
    stickerBoardEl.appendChild(stickerRemoveBtn);
    stickerBoardEl.appendChild(stickerLists);

    //항목 추가 버튼 클릭 -> 이벤트 위임으로 변경
    listCreateBtn.addEventListener("click", () => {
      console.log("리스트 추가");
      const itemLists = new ItemList(stickerLists, this.getStickerListNum());
    });

    //제거 버튼 클릭 -> 이벤트 위임으로 변경
    stickerRemoveBtn.addEventListener("click", this.removeSticker);

    //스티커에 드래그 이벤트 추가
    stickerBoardEl.addEventListener("mousedown", (event) =>
      this.addDragEvent(event, stickerBoardEl)
    );

    this.myTodo.targetItemLists.appendChild(stickerBoardEl);
  }
}

class ItemList {
  constructor(stickerBoardEl, listNum) {
    this.tatgetstickerBoardEl = stickerBoardEl;
    this.listNum = listNum;
    this.createViewItem();
  }

  removeItemList(event) {
    console.log("제거 버튼 클릭", event);
  }

  createViewItem() {
    const itemlist = createEl("li", "itemList");
    const itemArea = createEl("div", "itemDiv");
    const delBtn = createEl("button", "delBtn");
    const itemText = createEl("div", "itemText");
    itemText.innerText = `sample text ${this.listNum}`;
    delBtn.innerText = `삭제`;

    itemArea.appendChild(itemText);
    itemArea.appendChild(delBtn);

    itemlist.appendChild(itemArea);

    delBtn.addEventListener("click", this.removeItemList);

    this.tatgetstickerBoardEl.appendChild(itemlist);
  }
}
const todo = new Todo(itemLists);

createBtn.addEventListener("click", () => {
  todo.addSticker();
});
