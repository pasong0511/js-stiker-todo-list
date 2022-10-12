import Sticker from "./sticker.js";

export default class Trello {
  static new(targetEl, dataDic = [], onUpdate = () => {}) {
    const trello = new Trello(targetEl);
    dataDic.forEach((data) => trello.add(Sticker.new(trello, data)));
    trello.setUpdate(onUpdate);
    return trello;
  }

  constructor(targetEl) {
    this.dataDic = [];
    this.priority = [];
    this.stikerId = 0;
    this.targetStickersEl = targetEl;
    this.onUpdate = () => {
      console.log(1);
    };
  }

  setUpdate(onUpdate) {
    this.onUpdate = onUpdate;
  }

  update() {
    this.onUpdate();
  }

  //스티커 아이디 부여
  getStickerId() {
    this.stikerId += 1;
    return this.stikerId;
  }

  add(sticker) {
    this.dataDic.push(sticker);
    this.targetStickersEl.scroll(this.targetStickersEl.scrollWidth, 0);

    console.log("딕셔너리", this.dataDic);
    this.update();
  }

  addSticker() {
    const sticker = new Sticker(this, this.getStickerId(), this.startPos);
    sticker.createSticker(); //스티커 생성
    this.add(sticker);
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

  delete(sticker) {
    this.targetStickersEl.removeChild(sticker.element); //스티커 엘리먼트 삭제

    //데이터 갱신
    this.dataDic = Object.values(this.dataDic).filter(
      ({ element }) => element !== sticker.element
    );
    this.update();
    console.log("삭제 후 딕셔너리", this.dataDic);
  }

  // 화면에 보이는 순서로 정렬 -> x좌표로 비교 저장
  toJson() {
    const sort = this.dataDic.sort(
      (a, b) =>
        a.element.getBoundingClientRect().x -
        b.element.getBoundingClientRect().x
    );
    return sort.map((sticker) => sticker.toJson());
  }
}
