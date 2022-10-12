import { fetchData, saveData } from "./api.js";
import Trello from "./trello.js";

async function init() {
  const defaultData = await fetchData();
  console.log(defaultData);
  const createStikerBtn = document.querySelector("#createBtn");
  const stickerListEl = document.querySelector(".itemLists");

  //값 없으면 트렐로 생성 함수 실행
  const trello = Trello.new(stickerListEl, defaultData, () => {
    saveData(trello.toJson());
  });
  createStikerBtn.addEventListener("click", () => {
    trello.addSticker();
  });
}

//윈도우 열리면 바로 init() 함수 실행
window.addEventListener("DOMContentLoaded", init);
