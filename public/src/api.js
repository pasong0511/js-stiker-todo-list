//서버에 있는 데이터 패칭하기
export async function fetchData() {
  const response = await fetch("api/stickers");
  const dataList = await response.json();

  if (!dataList) {
    return dataList;
  }

  return dataList;
}

//클라이언트에서 서버로 데이터 전송
export async function saveData(dataList) {
  //클라이언트에 post
  await fetch("api/stickers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataList),
  });

  console.log("서버 전달 완료 저장완료", dataList);
}
