const fs = require('fs');
const path = require('path');

const questionBank = [
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

function escapeCSVField(s) {
  if (s === null || s === undefined) return '';
  const str = String(s);
  if (/[",\r\n]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function buildCSV(bank) {
  const head = ['id','question','choice1','choice2','choice3','choice4','answerIndex'];
  const lines = [head.join(',')];
  for (const it of bank) {
    const row = [
      it.id,
      escapeCSVField(it.q),
      escapeCSVField(it.choices[0] || ''),
      escapeCSVField(it.choices[1] || ''),
      escapeCSVField(it.choices[2] || ''),
      escapeCSVField(it.choices[3] || ''),
      it.a
    ];
    lines.push(row.join(','));
  }
  return lines.join('\r\n');
}

const outPath = path.join(__dirname, 'question_bank.csv');
fs.writeFileSync(outPath, buildCSV(questionBank), 'utf8');
console.log('已產生 CSV：', outPath);