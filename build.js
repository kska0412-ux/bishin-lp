/* index.pre-kinsoku.html（素の原稿）→ ロゴをdata URI化して埋め込み → index.html
   このあと `node kinsoku.js index.html` を実行する */
const fs = require('fs');

const ASSETS = {
  __MARK_INK__ : 'a_mark_ink.png',
  __MARK_GOLD__: 'a_mark_gold.png',
  __WORD_INK__ : 'a_word_ink.png',
  __WORD_GOLD__: 'a_word_gold.png',
  __PH_FV__     : 'ph_fv.jpg',
  __PH_PROF__   : 'ph_prof.jpg',
  __PH_EMPATHY__: 'ph_empathy.jpg',
  __PH_SOL__    : 'ph_sol.jpg',
  __CARD1__     : 'card1.jpg',
  __CARD2__     : 'card2.jpg',
  __CARD3__     : 'card3.jpg',
  __SHOT1__     : 'shot1.jpg',
  __SHOT2__     : 'shot2.jpg',
  __SHOT3__     : 'shot3.jpg',
};

let s = fs.readFileSync('index.pre-kinsoku.html', 'utf8');
let total = 0;
for (const [token, file] of Object.entries(ASSETS)){
  if (!s.includes(token)) throw new Error('トークンが見つからない: ' + token);
  const mime = file.endsWith('.png') ? 'image/png' : 'image/jpeg';
  const uri = 'data:' + mime + ';base64,' + fs.readFileSync(file).toString('base64');
  s = s.split(token).join(uri);
  total += uri.length;
  console.log(token, '←', file, Math.round(uri.length/1024) + 'KB');
}
fs.writeFileSync('index.html', s);
console.log('index.html 書き出し / 画像合計', Math.round(total/1024) + 'KB / 全体', Math.round(s.length/1024) + 'KB');
console.log('残トークン:', (s.match(/__[A-Z_]+__/g) || []).length);
