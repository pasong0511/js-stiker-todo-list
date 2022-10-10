const express = require("express");
const app = express();

const PORT = 4000;

//DB 대체
let store = [];

//라우터 사용
app.use(express.static("public"));
app.use(express.json());

app.get("/api/save", (req, res) => {
  res.send(store);
});

// 넘어온 json 데이터 전체를 받아서 전체를 저장
app.post("/api/save", (req, res) => {
  if (!req.body) {
    res.sendStatus(400);
    return;
  }

  store = req.body; //배열에 넣기
  console.log(store);

  //응답
  res.sendStatus(200); //응답코드 200 반환
});

//서버 시작
const handleListenig = () =>
  console.log(`Server listenig on port http://localhost:${PORT} 🚀`);

app.listen(4000, handleListenig);
