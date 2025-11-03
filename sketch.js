function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Arial');
  noStroke();
  textAlign(CENTER, CENTER); // 所有文字置中

  // UI 按鈕（不在此設定絕對位置，改由 positionButtons() 在題目下方定位）
  exportBtn = createButton('匯出題庫為 CSV');
  exportBtn.mousePressed(exportCSV);

  restartBtn = createButton('重新測驗');
  restartBtn.mousePressed(startQuiz);

  nextBtn = createButton('下一題');
  nextBtn.mousePressed(nextQuestion);
  nextBtn.attribute('disabled', true);

  // 建立題庫（範例題目，可自行擴充）
  questionBank = [
    {id:1, q:'哪一個是鹽的化學式？', choices:['H2O','NaCl','CO2','KCl'], a:1},
    {id:2, q:'食鹽主要成份是？', choices:['鈉、氯','鈣、鎂','氫、氧','鐵、銅'], a:0},
    {id:3, q:'海鹽與岩鹽主要差異為？', choices:['來源不同','化學成分完全不同','有毒性','顏色永遠不同'], a:0},
    {id:4, q:'攝取過多鹽可能導致？', choices:['高血壓','低血糖','近視','牙齒變多'], a:0},
    {id:5, q:'一般成人每日建議攝鹽量大約？', choices:['10公克以上','1毫克','5公克以下','100公克'], a:2},
    {id:6, q:'鹽在烹飪中常作為？', choices:['保鮮劑','調味劑','染色劑','發酵劑'], a:1},
    {id:7, q:'下列哪項食物通常鈉含量較高？', choices:['新鮮水果','加工醃製食品','白米','純水'], a:1},
    {id:8, q:'低鈉鹽通常會以何元素部分替代鈉？', choices:['鉀','氮','碳','氦'], a:0},
    {id:9, q:'鹽的溶點（溶於水）會受何者影響？', choices:['溫度與濃度','聲音','光線','磁場'], a:0},
    {id:10, q:'食鹽的主要功能不包括：', choices:['調味','保存','增加甜味','提供礦物質'], a:2}
  ];

  particles = [];
  startQuiz();
}

let questionBank = [];
let currentSet = [];
let currentIndex = 0;
let selected = -1;
let score = 0;
let finished = false;
let exportBtn, restartBtn, nextBtn;
let particles = [];

function startQuiz() {
  // 每次抽 5 題（若題庫小於5則全抽）
  currentSet = pickRandom(questionBank, min(5, questionBank.length));
  currentIndex = 0;
  selected = -1;
  score = 0;
  finished = false;
  nextBtn.attribute('disabled', true);
  loop();
}

function pickRandom(arr, k) {
  let copy = arr.slice();
  let res = [];
  for (let i=0; i<k; i++) {
    let idx = floor(random(copy.length));
    res.push(copy.splice(idx,1)[0]);
  }
  return res;
}

function draw() {
  // 背景動態：漸層 + 緩慢移動的波紋
  let t = millis() * 0.0002;
  for (let y=0; y<height; y+=10) {
    let c = lerpColor(color(30, 40, 80), color(200, 220, 255), map(y,0,height,0,1));
    fill(hueShift(c, sin(t + y*0.01)*10));
    rect(0,y,width,10);
  }

  // 畫面標題（置中）
  fill(255);
  textSize(22);
  textAlign(CENTER, CENTER);
  text('隨機測驗 - 題目數: ' + currentSet.length + '，目前題號: ' + (currentIndex+1), width/2, 40);

  if (!finished) {
    showQuestion(currentSet[currentIndex]);
  } else {
    showResult();
  }

  // 粒子系統（互動效果）
  for (let i = particles.length-1; i>=0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].isDead()) particles.splice(i,1);
  }
}

function showQuestion(item) {
  if (!item) return;
  // 題目框（置中）
  push();
  let boxW = min(900, width - 80);
  let boxH = height * 0.18;
  let boxX = width/2 - boxW/2;
  let boxY = 80;
  fill(0, 120);
  rect(boxX, boxY, boxW, boxH, 8);
  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  // 將題目置於黑色框的正中間（使用框的中心座標，不使用寬高包裝參數）
  text(item.q, boxX + boxW / 2, boxY + boxH / 2);
  pop();

  // 選項（置中）
  let ox = width/2 - (min(700, width - 120))/2;
  let oy = boxY + boxH + 30; // 以畫面高度決定選項起始位置
  let w = min(700, width - 120);
  let h = 64;
  for (let i = 0; i < item.choices.length; i++) {
    let x = ox;
    let y = oy + i * (h + 14);
    let hovering = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
    if (selected === i) {
      fill(80, 200, 120);
    } else if (hovering) {
      fill(120, 160, 220);
    } else {
      fill(255, 220);
    }
    stroke(0, 50);
    rect(x, y, w, h, 8);

    fill(10);
    noStroke();
    textSize(18);
    textAlign(CENTER, CENTER);
    text((i + 1) + '. ' + item.choices[i], width/2, y + h / 2);
  }

  // 將按鈕置於選項下方
  positionButtons(boxY, boxH, oy, h, item.choices.length);

  // 若已選答，顯示回饋並啟用下一題或結束按鈕（置中）
  if (selected !== -1) {
    nextBtn.removeAttribute('disabled');
    let correct = (selected === item.a);
    push();
    textSize(20);
    textAlign(CENTER, CENTER);
    fill(correct ? '#00cc66' : '#ff6666');
    text(correct ? '答對！' : '答錯！ 正確答案: ' + item.choices[item.a], width/2, max(oy + item.choices.length*(h+14) + 40, height - 120));
    pop();
  }
}

// 合併並使用單一 mousePressed（已處理選項位置為置中）
function mousePressed() {
  if (finished) return;
  let ox = width/2 - (min(700, width - 120))/2;
  let oy = 80 + height * 0.18 + 30;
  let w = min(700, width - 120);
  let h = 64;
  let item = currentSet[currentIndex];
  if (!item) return;
  for (let i=0; i<item.choices.length; i++) {
    let x = ox;
    let y = oy + i*(h+14);
    if (mouseX > x && mouseX < x+w && mouseY > y && mouseY < y+h) {
      if (selected === -1) {
        selected = i;
        item.userSelected = i;
        let correct = (selected === item.a);
        if (correct) score++;
        spawnParticles(mouseX, mouseY, correct ? color(0,200,120) : color(255,80,80));
        nextBtn.removeAttribute('disabled');
      }
      return;
    }
  }
}

function nextQuestion() {
  if (selected === -1) return;
  currentIndex++;
  selected = -1;
  nextBtn.attribute('disabled', true);
  if (currentIndex >= currentSet.length) {
    finished = true;
    nextBtn.attribute('disabled', true);
  }
}

function showResult() {
  background(20,40,80,220);
  fill(255);
  textSize(34);
  textAlign(CENTER, CENTER);
  text('測驗完成', width/2, 80);
  textSize(24);
  let percent = floor((score / currentSet.length) * 100);
  text('得分: ' + score + ' / ' + currentSet.length + '   ('+percent+'%)', width/2, 140);

  // 回饋用語
  let feedback = '';
  if (percent === 100) feedback = '太棒了！全部答對！';
  else if (percent >= 80) feedback = '表現很好，繼續保持！';
  else if (percent >= 50) feedback = '不錯，但還有進步空間。';
  else feedback = '建議再複習相關知識，再試一次！';
  textSize(20);
  text(feedback, width/2, 190);

  // 顯示題目回顧（置中）
  textSize(16);
  textAlign(CENTER, TOP);
  let startY = 230;
  for (let i=0; i<currentSet.length; i++) {
    let it = currentSet[i];
    let userAnswerText = '(你的答案: ' + (it.userSelected !== undefined ? it.userSelected+1 : '-') + ')';
    let line = (i+1)+'. '+it.q + '  正確: ' + (it.a+1) + ' ' + it.choices[it.a] + '  ' + userAnswerText;
    text(line, width/2, startY + i*34, width - 120, 34);
  }
  noLoop();
}

// 匯出 CSV 功能：把題庫輸出為 CSV 檔案
function exportCSV() {
  let lines = [];
  // CSV 標頭
  lines.push('id,question,choice1,choice2,choice3,choice4,answerIndex');
  for (let i=0;i<questionBank.length;i++) {
    let it = questionBank[i];
    // 用雙引號處理可能有逗號的欄位
    let row = [
      it.id,
      '"' + it.q.replace(/"/g,'""') + '"',
      '"' + it.choices[0].replace(/"/g,'""') + '"',
      '"' + it.choices[1].replace(/"/g,'""') + '"',
      '"' + (it.choices[2]||'').replace(/"/g,'""') + '"',
      '"' + (it.choices[3]||'').replace(/"/g,'""') + '"',
      it.a
    ];
    lines.push(row.join(','));
  }
  // 使用 p5.js 內建 saveStrings 進行下載
  saveStrings(lines, 'question_bank.csv');
}

// 粒子產生器
function spawnParticles(x,y,col) {
  for (let i=0;i<30;i++) {
    particles.push(new Particle(x, y, col));
  }
}

class Particle {
  constructor(x,y,col){
    this.pos = createVector(x,y);
    let ang = random(TWO_PI);
    let sp = random(1,6);
    this.vel = p5.Vector.fromAngle(ang).mult(sp);
    this.acc = createVector(0,0.15);
    this.life = random(40,90);
    this.r = random(3,6);
    this.col = col;
    this.age = 0;
  }
  update(){
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.age++;
  }
  draw(){
    push();
    noStroke();
    let alpha = map(this.age,0,this.life,255,0);
    fill(red(this.col), green(this.col), blue(this.col), alpha);
    ellipse(this.pos.x, this.pos.y, this.r);
    pop();
  }
  isDead(){ return this.age > this.life; }
}

// 小工具：色相微調（回傳 p5.Color）
function hueShift(c, amt){
  let hcol = color(red(c), green(c), blue(c));
  // 簡單透過 tint改亮度: 這裡回傳原色（維持簡單）
  return hcol;
}

// 新增：依題目選項位置動態定位按鈕（置中，置於選項下方）
function positionButtons(boxY, boxH, optionsY, optionH, optionCount) {
  // 若畫面上沒有按鈕或在結果頁面，仍嘗試定位於畫面底部對齊
  let gap = 18;
  let totalHeight = optionCount * (optionH + 14) - 14;
  let buttonsY = optionsY + totalHeight + 24; // 按鈕起始 Y
  // 如果 buttonsY 太接近畫面底部，向上調整
  if (buttonsY + 40 > height - 40) buttonsY = height - 80;

  // 三個按鈕水平置中排列
  let btnW = 140;
  let spacing = 20;
  let totalW = btnW * 3 + spacing * 2;
  let startX = width/2 - totalW/2;

  if (restartBtn) restartBtn.position(startX, buttonsY).style('font-size', '14px');
  if (nextBtn) nextBtn.position(startX + (btnW + spacing), buttonsY).style('font-size', '14px');
  if (exportBtn) exportBtn.position(startX + 2*(btnW + spacing), buttonsY).style('font-size', '14px');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 按鈕位置由 positionButtons 處理，若目前在題目頁面，呼叫一次重新定位
  // 若 currentSet 與 currentIndex 有值，就嘗試計算並定位
  if (currentSet && currentSet[currentIndex]) {
    // 重複計算同 showQuestion 使用的參數
    let boxH = height * 0.18;
    let boxY = 80;
    let ox = width/2 - (min(700, width - 120))/2;
    let oy = boxY + boxH + 30;
    let h = 64;
    positionButtons(boxY, boxH, oy, h, currentSet[currentIndex].choices.length);
  } else {
    // 否則把按鈕置中底部
    let y = height - 80;
    if (restartBtn) restartBtn.position(width/2 - 160, y);
    if (nextBtn) nextBtn.position(width/2 - 10, y);
    if (exportBtn) exportBtn.position(width/2 + 140, y);
  }
}