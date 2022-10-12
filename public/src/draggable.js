import createEl from "./utile.js";

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
  if (nodeA.parentNode !== nodeB.parentNode) {
    return;
  }
  const parentA = nodeA.parentNode;
  const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;

  //draggable 클래스 이름만 스왑 가능
  if (
    !nodeA.classList.contains("draggable") ||
    !nodeB.classList.contains("draggable")
  ) {
    return;
  }

  //nodeB 전에  nodeA 삽입
  nodeB.parentNode.insertBefore(nodeA, nodeB);

  // Move `nodeB` to before the sibling of `nodeA`
  parentA.insertBefore(nodeB, siblingA);
}

export default class Draggable {
  constructor(elKind, className) {
    this.element = createEl(elKind, className);
    this.isVertical = true;
    this.placeholder = null;
    this.isDraggingStarted = false;
    this.shiftX = 0; //드래그 엘리먼트의 마우스 현재 포지션 저장
    this.shiftY = 0;
    this.lastAction = "";

    //this 바인딩 -> Draggable
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
    this.mouseDownHandler = this.mouseDownHandler.bind(this);

    this.element.addEventListener("mousedown", this.mouseDownHandler);
  }

  //세로형 스타일 지정
  setVertical(isVertical = true) {
    this.isVertical = isVertical;
    this.element.parentElement.style.flexDirection = isVertical
      ? "column"
      : "row";
  }

  deletePlaceholder() {
    if (this.placeholder && this.placeholder.parentNode) {
      this.placeholder.parentNode.removeChild(this.placeholder); // this.placeholder 제거
    }
  }

  createPlaceholder() {
    this.deletePlaceholder();

    //this.placeholder 생성
    this.placeholder = document.createElement("div");
    this.placeholder.classList.add("placeholder");
    this.placeholder.classList.add("draggable");
    this.placeholder.style.float = this.isVertical ? "" : "left";

    //플레이스홀더 인서트
    this.element.parentNode.insertBefore(
      this.placeholder,
      this.element.nextSibling
    );

    this.placeholder.style.width = `${this.element.offsetWidth}px`;
    this.placeholder.style.height = `${this.element.offsetHeight}px`;
  }

  //드래그 + 마우스 움직임
  mouseMoveHandler(event) {
    this.lastAction = "move";
    if (!this.isDraggingStarted) {
      this.isDraggingStarted = true;

      this.createPlaceholder();
    }

    //드래그 엘리먼트 위치 조정
    this.element.style.position = "fixed";
    this.element.style.zIndex = 2000;
    this.element.style.top = `${event.pageY - this.shiftY}px`;
    this.element.style.left = `${event.pageX - this.shiftX}px`;

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
    event.stopPropagation();

    this.lastAction = "down";

    const clinetReact = this.element.getBoundingClientRect(); //드래그한 엘리먼트 위치 저장
    this.shiftX = event.clientX - clinetReact.x;
    this.shiftY = event.clientY - clinetReact.y;

    document.addEventListener("mousemove", this.mouseMoveHandler);
    document.addEventListener("mouseup", this.mouseUpHandler);
  }

  //드래그 이벤트 종료 -> 마우스 업
  mouseUpHandler(event) {
    // mousemove, mouseup 이벤트 해제
    document.removeEventListener("mousemove", this.mouseMoveHandler);
    document.removeEventListener("mouseup", this.mouseUpHandler);
    if (this.lastAction === "down") {
      return this.onClick(event);
    }
    this.lastAction = "";
    this.deletePlaceholder();

    this.element.style.removeProperty("top");
    this.element.style.removeProperty("left");
    this.element.style.removeProperty("position");
    this.element.style.removeProperty("z-index");

    this.shiftX = 0;
    this.shiftY = 0;
    this.isDraggingStarted = false;
    this.update();
  }

  update() {}
}
