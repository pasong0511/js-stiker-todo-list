const createBtn = document.querySelector("#createBtn");
const ItemListEl = document.querySelector(".itemLists");

const COLOR_START = 150;
const COLOR_END = 200;

//엘리먼트 생성, 클래스 이름 부여
function createEl(elKind, className = "") {
  const el = document.createElement(elKind);
  el.className = className;

  return el;
}

class Trello {
  constructor(ItemListEl) {
    this.dataDic = {};
    this.viewDic = {};    //스티커 하나 통으로 저장

    this.trelloNum = 0;
    this.startPos = {
      x: 0,
      y: 0,
    };

    this.targetItemListEl = ItemListEl;
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

  //this.dataDic에 스티커 추가 
  addSticker() {
    this.getStartPos();
    const sticker = new Sticker(this.getTrelloNum(), this.startPos, this);
    this.dataDic[this.trelloNum] = sticker;

    console.log("딕셔너리 저장", this.dataDic)
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
    console.log("제거 버튼 클릭", event);
  }

  //드래그 이벤트 등록
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

  //스티커 렌더링 -> 한번 클릭할 때마다, 반복문 생성 -> 비효율적
  //리렌더링이나 할때 사용하자
  renderStiker() {
    Object.values(this.rootTrello.viewDic).forEach((item) => {
      this.rootTrello.targetItemListEl.appendChild(item)
    })
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

    //항목 추가 버튼 클릭 -> 이벤트 위임으로 변경
    listCreateBtn.addEventListener("click", () => {
      const ItemListEl = new ItemList(stickerBottomEl, this.getStickerListNum());
    });

    //제거 버튼 클릭 -> 이벤트 위임으로 변경
    stickerRemoveBtn.addEventListener("click", this.removeSticker);

    //스티커에 드래그 이벤트 추가
    stickerBoardEl.addEventListener("mousedown", (event) =>
      this.addDragEvent(event, stickerBoardEl)
    );

    this.rootTrello.viewDic[this.trelloNum] = stickerBoardEl;
    this.rootTrello.targetItemListEl.appendChild(stickerBoardEl);
    //this.renderStiker();
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
const trello = new Trello(ItemListEl);

createBtn.addEventListener("click", () => {
  trello.addSticker();
});
