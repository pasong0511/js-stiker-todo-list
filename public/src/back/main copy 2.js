const createStikerBtn = document.querySelector("#createBtn");
const modalEl = document.querySelector("#modal");
const stickerListEl = document.querySelector(".itemLists");

const COLOR_START = 150;
const COLOR_END = 200;

//엘리먼트 생성, 클래스 이름 부여
function createEl(elKind, className = "") {
  const el = document.createElement(elKind);
  el.className = className;

  return el;
}

//현재 엘리먼트 nodeA가 nodeB에 위에 있는 경우 체크
function isAbove(nodeA, nodeB, isVertical = false) {
  const rectA = nodeA.getBoundingClientRect(); //nodeA좌표 찾기
  const rectB = nodeB.getBoundingClientRect(); //nodeB좌표 찾기

  if (isVertical) {
    //nodeA의 높이 보다 nodeB의 높이가 더 큰 경우
    return rectA.top + rectA.height / 2 < rectB.top + rectB.height / 2;
  }
  return rectA.left + rectA.width / 2 < rectB.left + rectB.width / 2;
}

// 드래그 중 엘리먼트, 이미 위치한 엘리먼트 두개의 itemlist를 변경한다.
function swap(nodeA, nodeB) {
  const parentA = nodeA.parentNode;
  const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;

  // //draggable 클래스 이름만 스왑 가능
  // if (
  //   !nodeA.classList.contains("draggable") ||
  //   !nodeB.classList.contains("draggable")
  // ) {
  //   return;
  // }

  //nodeB 전에  nodeA 삽입
  nodeB.parentNode.insertBefore(nodeA, nodeB);

  // Move `nodeB` to before the sibling of `nodeA`
  parentA.insertBefore(nodeB, siblingA);
}

class Draggable {
  constructor(elKind, className) {
    this.element = createEl(elKind, className);
    this.isVertical = true;
    this.placeholder = null;
    this.isDraggingStarted = false;
    this.shiftX = 0; //드래그 엘리먼트의 마우스 현재 포지션 저장
    this.shiftY = 0;

    //this 바인딩 -> Draggable
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
    this.mouseDownHandler = this.mouseDownHandler.bind(this);

    this.element.addEventListener("mousedown", this.mouseDownHandler);
  }

  setVertical(isVertical = true) {
    this.isVertical = isVertical;
    this.element.parentElement.style.flexDirection = isVertical
      ? "column"
      : "row";
  }

  //드래그 + 마우스 움직임
  mouseMoveHandler(event) {
    if (!this.isDraggingStarted) {
      this.isDraggingStarted = true;

      //this.placeholder 생성
      this.placeholder = document.createElement("div");
      this.placeholder.classList.add("placeholder");
      this.placeholder.classList.add("draggable");
      this.placeholder.style.float = this.isVertical ? "" : "left";
      this.element.parentNode.insertBefore(
        this.placeholder,
        this.element.nextSibling
      );
      this.placeholder.style.width = `${this.element.offsetWidth}px`;
      this.placeholder.style.height = `${this.element.offsetHeight}px`;
    }
    //드래그 엘리먼트 위치 조정
    this.element.style.position = "fixed";
    this.element.style.zIndex = 2000;
    this.element.style.top = `${event.pageY - this.shiftY}px`;
    this.element.style.left = `${event.pageX - this.shiftX}px`;

    // 마우스 위에 있는 스티커 무엇인지
    // 그 스티커의 item은 목록을 가져와야함

    const prevEle = this.element.previousElementSibling;
    const nextEle = this.placeholder.nextElementSibling;

    //드래그 엘리먼트가 현재 위치보다 위쪽 쪽으로 가는 경우
    //기존에 있던 항목들은 아래쪽으로 위치 변경
    if (prevEle && isAbove(this.element, prevEle, this.isVertical)) {
      swap(this.placeholder, this.element);
      swap(this.placeholder, prevEle);
      return;
    }

    //드래그 엘리먼트가 현재 위치보다 아래 쪽으로 가는 경우
    //기존에 있던 항목들은 위쪽으로 위치 변경
    if (nextEle && isAbove(nextEle, this.element, this.isVertical)) {
      swap(nextEle, this.placeholder);
      swap(nextEle, this.element);
    }
  }

  //드래그 이벤트 시작 -> 마우스 다운
  mouseDownHandler(event) {
    // event.stopPropagation();

    //   //draggable 클래스 이름만 스왑 가능
    // if (
    //   !nodeA.classList.contains("draggable") ||
    //   !nodeB.classList.contains("draggable")
    // ) {
    //   return;
    // }

    console.log("마우스 다운", event.target);

    const clinetReact = this.element.getBoundingClientRect(); //드래그한 엘리먼트 위치 저장
    this.shiftX = event.clientX - clinetReact.x;
    this.shiftY = event.clientY - clinetReact.y;

    document.addEventListener("mousemove", this.mouseMoveHandler);
    document.addEventListener("mouseup", this.mouseUpHandler);
  }

  //드래그 이벤트 종료 -> 마우스 업
  mouseUpHandler() {
    if (this.placeholder) {
      this.placeholder.parentNode.removeChild(this.placeholder); // this.placeholder 제거
    }

    this.element.style.removeProperty("top");
    this.element.style.removeProperty("left");
    this.element.style.removeProperty("position");
    this.element.style.removeProperty("z-index");

    this.shiftX = 0;
    this.shiftY = 0;
    this.isDraggingStarted = false;

    // mousemove, mouseup 이벤트 해제
    document.removeEventListener("mousemove", this.mouseMoveHandler);
    document.removeEventListener("mouseup", this.mouseUpHandler);
  }
}

class Trello {
  constructor(targetEl) {
    this.dataDic = {};
    this.priority = [];
    this.stikerId = 0;
    this.targetStickersEl = targetEl;
  }

  //스티커 아이디 부여
  getStickerId() {
    this.stikerId += 1;
    return this.stikerId;
  }

  addSticker() {
    const sticker = new Sticker(this, this.getStickerId(), this.startPos);
    sticker.createSticker(); //스티커 생성
    this.dataDic[this.stikerId] = sticker;
  }

  //스티커 시작 x y 좌표, 너비, 높이 받아서 this.dataDic안의 객체 값 반환
  findSticker(x, y) {
    return Object.values(this.dataDic).find(({ element }) => {
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

  // setPriority(key) {
  //   console.log("우선순위");
  //   this.priority = this.priority.filter((target) => target !== key);
  //   this.priority.push(key);
  //   this.priority.forEach((key, idx) => {
  //     this.dataDic[key].element.style.zIndex = idx;
  //   });
  // }
}

class Sticker extends Draggable {
  constructor(root, stikerId) {
    super("li", "stickerBoard"); //상속받는 constructor를 호출
    this.root = root;
    this.stikerId = stikerId;
    this.stikerTitle = null;
    this.StickerColor = "";
    this.todoList = [];
  }
  // save() {
  //   return {
  //     postition: this.getPosition(),
  //   };
  // }
  // getPosition() {
  //   const rect = this.element.getClientRects();
  //   return [rect.x, rect.y];
  // }

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

  updatePriority() {
    //this.root.setPriority(this.stikerId);
  }

  //스티커 타이틀 텍스트 갱신
  setStikerTitle(text) {
    this.stikerTitle = text;
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
    event.target.parentNode.parentNode.remove(); //스티커 엘리먼트 삭제
    //스티커 root 데이터 딕셔너리에서 삭제
    this.root.dataDic = Object.values(this.root.dataDic).filter(
      ({ element }) => element !== event.target.parentNode.parentNode
    );
  }

  //스티커 엘리먼트 생성
  createSticker() {
    const stickerTopEl = createEl("div", "stickerTop");
    const stickerTitleEl = createEl("div", "stickerTitle");
    const listCreateBtn = createEl("button", "listCreateBtn");
    const stickerRemoveBtn = createEl("button", "stickerRemoveBtn");
    const stickerBottomEl = createEl("ul", "stickerBottom");

    this.element.classList.add("draggable");
    this.element.style.background = this.changeBackground(); //배경색 지정

    stickerTitleEl.innerText = !this.stikerTitle
      ? `Sticker${this.stikerId}`
      : this.stikerTitle;
    listCreateBtn.innerText = "항목 추가";
    stickerRemoveBtn.innerText = "스티커 삭제";

    stickerTopEl.appendChild(stickerTitleEl);
    stickerTopEl.appendChild(listCreateBtn);
    stickerTopEl.appendChild(stickerRemoveBtn);

    this.element.appendChild(stickerTopEl);
    this.element.appendChild(stickerBottomEl);

    this.root.targetStickersEl.insertBefore(
      this.element,
      this.root.targetStickersEl.lastChild.previousElementSibling
    );
    this.root.dataDic[this.stikerId] = this.element;
    this.root.targetStickersEl.scroll(
      this.root.targetStickersEl.scrollWidth,
      0
    );

    stickerTitleEl.addEventListener("click", (event) => {
      this.modifyTitleText(event, stickerTitleEl);
    });

    //엘리먼트에 이벤트
    this.element.addEventListener("click", (event) => {
      if (event.target.className === "listCreateBtn") {
        const todoItem = new Todo(this);
        todoItem.createTodoItem();
        this.todoList.push(todoItem); //객체 배열에 추가
        this.updatePriority();
        return;
      }

      //제거 버튼 클릭
      if (event.target.className === "stickerRemoveBtn") {
        this.deleteSticker(event);
      }
    });
    this.setVertical(false);
  }
}

class Todo extends Draggable {
  constructor(parent) {
    super("li", "todoItem", true); //상속받는 constructor를 호출

    this.parent = parent; //Sticker
    this.itemText = null;
  }

  setItemText(text) {
    this.itemText = text;
  }

  mouseMoveHandler(event) {
    //내 스티커, 이동하는 스티커 좌표 체크 오버라이딩
    const newSticker = this.parent.root.findSticker(
      event.clientX,
      event.clientY
    ).element;

    // console.log("스티커 ", newSticker);

    const mySicker = this.parent.element;

    if (newSticker && newSticker !== mySicker) {
      const bottom = newSticker.querySelector(".stickerBottom");
      bottom.appendChild(this.element);
    }

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

    modalArea.addEventListener("click", (e) => {
      e.stopPropagation();
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
    event.target.parentNode.parentNode.remove(); //투투 아이템 엘리먼트 삭제

    //스티커의 투두 리스트 데이터 배열에서 삭제
    this.parent.todoList = this.parent.todoList.filter(
      ({ element }) => element !== event.target.parentNode.parentNode
    );
  }

  createTodoItem() {
    const itemArea = createEl("div", "itemArea");

    const delBtn = createEl("button", "delBtn");
    const itemTitleEl = createEl("span", "itemTitle");

    this.element.classList.add("draggable");
    itemTitleEl.innerText = `${this.itemText ? this.itemText : "기본"}`;
    delBtn.innerText = `삭제`;

    itemArea.appendChild(itemTitleEl);
    itemArea.appendChild(delBtn);
    this.element.appendChild(itemArea);
    this.parent.element.lastChild.appendChild(this.element);

    this.element.addEventListener("click", (event) => {
      if (event.target.className === "itemTitle") {
        modalEl.classList.add("isActive");
        this.modifyTodoText(event, itemTitleEl);
        return;
      }
      if (event.target.className === "delBtn") {
        this.deleteTodoItem(event);
      }
    });
  }
}

const trello = new Trello(stickerListEl);

createStikerBtn.addEventListener("click", () => {
  trello.addSticker();
});
