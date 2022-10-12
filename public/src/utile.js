//엘리먼트 생성, 클래스 이름 부여
export default function createEl(elKind, className = "") {
  const el = document.createElement(elKind);
  el.className = className;

  return el;
}
