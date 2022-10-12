const createBtn = document.querySelector("#createBtn");
const ItemListEl = document.querySelector(".itemLists");

const COLOR_START = 150;
const COLOR_END = 200;

// window.addEventListener("mousemove", (e) => {
//   const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
//   console.log(elemBelow);
//   const dropAreaEl = elemBelow.closest(".stickerBoard"); //가이까 가면 dropArea 반환
//   if (!dropAreaEl) {
//     return;
//   }
//   [...document.querySelectorAll(".stickerBoard")].forEach((el) =>
//     el.style.removeProperty("border")
//   );
//   dropAreaEl.style.border = "5px solid red";
// });

//엘리먼트 생성, 클래스 이름 부여
function createEl(elKind, className = "") {
  const el = document.createElement(elKind);
  el.className = className;

  return el;
}

class Trello {
  constructor(ItemListEl) {
    this.dataDic = {};
    this.viewDic = {}; //스티커 하나 통으로 저장
    this.priority = [];

    this.trelloNum = 0;
    this.startPos = {
      x: 0,
      y: 0,
    };

    this.targetItemListEl = ItemListEl;
  }

  setPriority(key) {
    this.priority = this.priority.filter((target) => target !== key);
    this.priority.push(key);
    this.priority.forEach((key, idx) => {
      this.viewDic[key].style.zIndex = idx;
    });
  }

  //전체 트렐로 번호 증가
  getTrelloNum() {
    this.trelloNum += 1;
    return this.trelloNum;
  }

  //생성 시작 좌표 +10 증가
  getStartPos() {
    this.startPos.x += 10;
    this.startPos.y += 10;
  }

  findSticker(x, y) {
    return Object.values(this.viewDic).find((el) => {
      const rect = el.getBoundingClientRect();
      const [x1, y1, x2, y2] = [
        rect.x,
        rect.y,
        rect.x + rect.width,
        rect.y + rect.height,
      ];
      return x1 <= x && x <= x2 && y1 <= y && y <= y2;
    });
  }

  //this.dataDic에 스티커 추가
  addSticker() {
    this.getStartPos();
    const sticker = new Sticker(this.getTrelloNum(), this.startPos, this);
    this.dataDic[this.trelloNum] = sticker;
    this.priority.push(this.trelloNum);
    //console.log("딕셔너리 저장", this.dataDic);
  }
}

class Sticker {
  constructor(trelloNum, startPos, root) {
    this.trelloNum = trelloNum;
    this.rootTrello = root;
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
    console.log("제거 버튼 클릭", event.target.parentNode.parentNode);
  }

  setCurrentPos(posX, posY) {
    this.currentPosX = posX;
    this.currentPosX = posY;

    //console.log("스티커 위치", this.currentPosX, this.currentPosX)
  }

  //드래그 이벤트 등록
  addDragEvent(event, targetEl) {
    const clinetReact = targetEl.getBoundingClientRect();
    const shiftX = event.clientX - clinetReact.x;
    const shiftY = event.clientY - clinetReact.y;
    this.setPriority();
    const dragHandler = (event) => {
      targetEl.style.left = `${event.x - shiftX}px`;
      targetEl.style.top = `${event.y - shiftY}px`;
    };

    document.addEventListener("mousemove", dragHandler);

    const dropHandler = () => {
      this.setCurrentPos(shiftX, shiftY); //스티커 객체 좌표 저장
      document.removeEventListener("mouseup", dropHandler);
      document.removeEventListener("mousemove", dragHandler);
    };

    document.addEventListener("mouseup", dropHandler);
  }

  //스티커 렌더링 -> 한번 클릭할 때마다, 반복문 생성 -> 비효율적
  //리렌더링이나 할때 사용하자
  renderStiker() {
    Object.values(this.rootTrello.viewDic).forEach((item) => {
      this.rootTrello.targetItemListEl.appendChild(item);
    });
  }

  //스티커 판 엘리먼트 생성
  createSticker() {
    const stickerBoardEl = createEl("div", "stickerBoard");
    const stickerTopEl = createEl("div", "stickerTop");
    const stickerTitleEl = createEl("div", "stickerTitle");
    const listCreateBtn = createEl("button", "listCreateBtn");
    const stickerRemoveBtn = createEl("button", "stickerRemoveBtn");
    const stickerBottomEl = createEl("ul", "stickerBottom");

    stickerBoardEl.style.background = this.changeBackground(); //배경색 지정
    stickerBoardEl.style.left = `${this.currentPosX}px`;
    stickerBoardEl.style.top = `${this.currentPosY}px`;

    stickerTitleEl.innerText = `Sticker${this.trelloNum}`;
    listCreateBtn.innerText = "항목 추가";
    stickerRemoveBtn.innerText = "스티커 삭제";

    stickerTopEl.appendChild(stickerTitleEl);
    stickerTopEl.appendChild(listCreateBtn);
    stickerTopEl.appendChild(stickerRemoveBtn);

    stickerBoardEl.appendChild(stickerTopEl);
    stickerBoardEl.appendChild(stickerBottomEl);
    // stickerBoardEl.addEventListener("mouseenter", (e) => {
    //   console.log({ e });
    // });
    stickerBoardEl.addEventListener("click", (event) => {
      //console.log("스티커에 이벤트 걸었음", event.target)

      //항목 추가 버튼 클릭
      if (event.target.className === "listCreateBtn") {
        console.log("스티커 내부 항목 추가");
        this.setPriority();
        const ItemListEl = new ItemList(
          this.getStickerListNum(),
          stickerBottomEl,
          this
        );
        return;
      }

      //제거 버튼 클릭
      if (event.target.className === "stickerRemoveBtn") {
        console.log("스티커 삭제");
        this.removeSticker(event);
      }
    });

    //임시 이벤트 제거
    //스티커에 드래그 이벤트 추가
    stickerBoardEl.addEventListener("mousedown", (event) => {
      this.addDragEvent(event, stickerBoardEl);
    });

    this.rootTrello.viewDic[this.trelloNum] = stickerBoardEl;
    this.rootTrello.targetItemListEl.appendChild(stickerBoardEl);
  }
  setPriority() {
    this.rootTrello.setPriority(this.trelloNum);
  }
}

class ItemList {
  constructor(listNum, stickerBottomEl, parentStiker) {
    this.parentStiker = parentStiker; //트렐로 번호

    this.listNum = listNum; //각 리스트 아이템 고유 순서 번호
    this.itemText = null; //각 리스트에 들어갈 아이템 텍스트

    this.parentSticker = stickerBottomEl;
    this.createViewItem();
  }

  removeItemList(event) {
    console.log("제거 버튼 클릭", event.target.parentNode.parentNode);

    //데이터 번호도 제거 해야함
    event.target.parentNode.parentNode.remove(); //엘리먼트 삭제 -> 아이템 객체 리스트도 삭제
  }

  setItemText(text) {
    this.itemText = text;
  }

  modifyItemText(event, targetTextEl) {
    // event.stopPropagation();

    const titleInputEl = document.createElement("input");
    titleInputEl.value = targetTextEl.textContent; //인풋에 있는 값빼오기
    titleInputEl.onblur = () => {
      //값이 있는 경우에만 변경
      if (titleInputEl.value) {
        targetTextEl.textContent = titleInputEl.value;
        this.setItemText(titleInputEl.value);
      }

      titleInputEl.remove();
      targetTextEl.hidden = false;
    };

    targetTextEl.before(titleInputEl);
    titleInputEl.focus(); //포커스
    titleInputEl.select(); //전체 다블록 잡아줌
    targetTextEl.hidden = true; //원본 숨김
  }

  createViewItem() {
    const itemlist = createEl("li", "itemList");
    const itemArea = createEl("div", "itemArea");

    const delBtn = createEl("button", "delBtn");
    const itemTitleEl = createEl("span", "itemTitle");

    itemlist.classList.add("draggable");
    itemTitleEl.innerText = `${this.itemText ? this.itemText : this.listNum}`;
    itemlist.style.zIndex = 1;
    delBtn.innerText = `삭제`;

    itemArea.appendChild(itemTitleEl);
    itemArea.appendChild(delBtn);
    itemlist.appendChild(itemArea);

    //---------------- 드래그 새로 등록 ----------------
    let draggingEle;
    let placeholder;
    let isDraggingStarted = false;

    //드래그 엘리먼트의 마우스 현재 포지션 저장
    let shiftX = 0;
    let shiftY = 0;

    // 드래그 중 엘리먼트, 이미 위치한 엘리먼트 두개의 itemlist를 변경한다.
    const swap = (nodeA, nodeB) => {
      const parentA = nodeA.parentNode;
      const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;

      //nodeB 전에  nodeA 삽입
      nodeB.parentNode.insertBefore(nodeA, nodeB);

      // Move `nodeB` to before the sibling of `nodeA`
      parentA.insertBefore(nodeB, siblingA);
    };

    //현재 엘리먼트 nodeA가 nodeB에 위에 있는 경우 체크
    const isAbove = (nodeA, nodeB) => {
      const rectA = nodeA.getBoundingClientRect(); //nodeA좌표 찾기
      const rectB = nodeB.getBoundingClientRect(); //nodeB좌표 찾기

      //nodeA의 높이 보다 nodeB의 높이가 더 큰 경우
      return rectA.top + rectA.height / 2 < rectB.top + rectB.height / 2;
    };

    const test = (callback) => {
      let timeout = null;
      return (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          callback(e);
        }, 500);
      };
    };

    //드래그 + 마우스 움직임
    const mouseMoveHandler = (event) => {
      //---------------------------------------------
      const sticker = this.parentStiker.rootTrello.findSticker(
        event.clientX,
        event.clientY
      );
      if (sticker && sticker !== this.parentSticker.parentNode) {
        console.log(sticker, this.parentSticker);
        const bottom = sticker.querySelector(".stickerBottom");
        bottom.appendChild(itemlist);
        this.parentSticker = bottom;
      }

      //좌표를 구해서 엘리먼트를 구하는 함수
      // let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
      // let parentEl = draggingEle.parentNode.parentNode; //현재 엘리먼트의 스티커

      // if (!elemBelow) {
      //   return;
      // }

      // let dropAreaEl = elemBelow.closest(".stickerBoard"); //가이까 가면 dropArea 반환

      // //드래그한 엘리먼트랑, 새로 찾은 stickerBoard랑 같은 리턴
      // if (parentEl === dropAreaEl) {
      //   return;
      // }

      // console.log("클로즈", dropAreaEl);
      //---------------------------------------------

      const draggingRect = draggingEle.getBoundingClientRect();
      if (!isDraggingStarted) {
        isDraggingStarted = true;

        //placeholder 생성
        placeholder = document.createElement("div");
        placeholder.classList.add("placeholder");
        draggingEle.parentNode.insertBefore(
          placeholder,
          draggingEle.nextSibling
        );
        placeholder.style.width = `${draggingRect.width}px`;
        placeholder.style.height = `${draggingRect.height}px`;
      }
      //드래그 엘리먼트 위치 조정
      draggingEle.style.position = "fixed ";
      draggingEle.style.zIndex = 2000;
      draggingEle.style.left = `${event.pageX - shiftX}px`;
      draggingEle.style.top = `${event.pageY - shiftY}px`;

      // 마우스 위에 있는 스티커 무엇인지
      // 그 스티커의 item은 목록을 가져와야함

      const prevEle = draggingEle.previousElementSibling;
      const nextEle = placeholder.nextElementSibling;

      //드래그 엘리먼트가 현재 위치보다 위쪽 쪽으로 가는 경우
      //기존에 있던 항목들은 아래쪽으로 위치 변경
      if (prevEle && isAbove(draggingEle, prevEle)) {
        swap(placeholder, draggingEle);
        swap(placeholder, prevEle);
        return;
      }

      //드래그 엘리먼트가 현재 위치보다 아래 쪽으로 가는 경우
      //기존에 있던 항목들은 위쪽으로 위치 변경
      if (nextEle && isAbove(nextEle, draggingEle)) {
        swap(nextEle, placeholder);
        swap(nextEle, draggingEle);
      }
    };

    //드래그 이벤트 시작 -> 마우스 다운
    const mouseDownHandler = (event, targetEl) => {
      event.stopPropagation(); //스티커 객체에서 발생하는 이동 이벤트 버블링 방지
      draggingEle = targetEl; //현재 타겟 이벤트
      this.parentStiker.setPriority();
      const clinetReact = draggingEle.getBoundingClientRect(); //드래그한 엘리먼트 위치 저장

      shiftX = event.clientX - clinetReact.x;
      shiftY = event.clientY - clinetReact.y;

      // //좌표를 구해서 엘리먼트를 구하는 함수
      // let elemBelow = document.elementFromPoint(event.clientX, event.clientY);

      // if (!elemBelow) {
      //   return;
      // }

      // console.log("엘리먼트 빌로우", elemBelow);
      // //let dropAreaEl = elemBelow.closest(".itemList"); //가이까 가면 dropArea 반환
      // let dropAreaEl = elemBelow.closest(".stickerBoard"); //가이까 가면 dropArea 반환
      // console.log("클로즈", dropAreaEl);

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    };

    //드래그 이벤트 종료 -> 마우스 업
    const mouseUpHandler = () => {
      placeholder && placeholder.parentNode.removeChild(placeholder); // placeholder 제거

      draggingEle.style.removeProperty("top");
      draggingEle.style.removeProperty("left");
      draggingEle.style.removeProperty("position");
      draggingEle.style.removeProperty("z-index");

      shiftX = null;
      shiftY = null;
      draggingEle = null;
      isDraggingStarted = false;

      // mousemove, mouseup 이벤트 해제
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
    };
    //---------------- 드래그 새로 등록 끝 ----------------

    itemTitleEl.addEventListener("click", (event) => {
      this.modifyItemText(event, itemTitleEl);
    });
    delBtn.addEventListener("click", this.removeItemList);
    itemlist.addEventListener("mousedown", (event) => {
      mouseDownHandler(event, itemlist);
    });
    this.parentSticker.appendChild(itemlist);
  }
}

const trello = new Trello(ItemListEl);

createBtn.addEventListener("click", () => {
  trello.addSticker();
});
