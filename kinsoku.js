/* ============================================================
   禁則処理：日本語テキストを文節相当の塊に分け <span class="nb"> で括る
   （.nb は white-space:nowrap ＝ 塊の内部では絶対に改行しない）

   狙い
   - 単語の途中で改行しない（例：「デザイン」の「デ」で折り返さない）
   - 行頭に「を」「と」「は」等の助詞・小書き仮名・長音・閉じ括弧が来ない

   分割してよい位置（primary）
     (a) 直前が 、。！？ などの句読点
     (b) 直前がひらがな／閉じ括弧／ダッシュ かつ 直後が非ひらがな（＝自立語の頭）
   不可：直前が開き括弧、直前が「お」「ご」（接頭辞）、直後が行頭禁則文字。

   塊が MAX を超えたら fallback ルールで細分化する（狭い画面での溢れ防止）。
     fallback: 直後が助詞・行頭禁則文字でなく、かつ
               直前がひらがな/句読点/ダッシュ、または文字種が変わる位置。
   ============================================================ */
const fs = require('fs');

const WJ = '⁠'; // WORD JOINER：タグを跨ぐ位置の禁則に使う

const isHira   = c => /[ぁ-ゟ]/.test(c);
const isKata   = c => /[゠-ヿｦ-ﾟ]/.test(c);
const isKanji  = c => /[一-鿿々〆]/.test(c);
const isLatin  = c => /[0-9A-Za-z０-９Ａ-Ｚａ-ｚ]/.test(c);
const isSentP  = c => '、。，．！？；;：:'.includes(c);
const isCloseBr= c => '」』）】〉》〕｝”’"・…‥'.includes(c);
const isOpenP  = c => '「『（【〈《〔｛“‘'.includes(c);
const isDash   = c => '—―～〜'.includes(c);                     // 分割を許してよい真のダッシュ
const isProlong= c => 'ー－-'.includes(c);                        // 長音符：語の一部。ここでは絶対に割らない
const isCloseP = c => isSentP(c) || isCloseBr(c);
const isNoStart= c => isCloseP(c) || isDash(c) || isProlong(c) || 'ぁぃぅぇぉっゃゅょゎヵヶァィゥェォッャュョ'.includes(c);
const hasJa    = s => /[぀-ヿ一-鿿々〆]/.test(s);

// 行頭に置きたくない助詞・助動詞
const JOSHI = 'をとはがのにへでもやかねよ';
const MAX = 12; // これを超える塊は細分化する

const script = c => isHira(c) ? 'h' : isKata(c) ? 'k' : isKanji(c) ? 'j' : isLatin(c) ? 'l' : 'o';

function canSplitPrimary(p, c){
  if (isOpenP(p) || isNoStart(c)) return false;
  if (p === 'お' || p === 'ご') return false;          // ご質問／お客様 を割らない
  if (isSentP(p)) return true;
  if ((isHira(p) || isCloseBr(p) || isDash(p)) && !isHira(c)) return true;
  return false;
}

function canSplitFallback(p, c){
  if (isOpenP(p) || isNoStart(c)) return false;
  if (JOSHI.includes(c)) return false;                 // 行頭が助詞になる分割は禁止
  if (p === 'お' || p === 'ご') return false;
  if (isHira(p) || isCloseP(p) || isDash(p)) return true;
  return script(p) !== script(c);                      // 文字種の変わり目＝語境界とみなす
}

function subdivide(g){
  if (g.length <= MAX) return [g];
  for (let i = Math.min(MAX, g.length - 1); i >= 2; i--){
    if (canSplitFallback(g[i-1], g[i])) return [g.slice(0, i), ...subdivide(g.slice(i))];
  }
  return [g]; // 安全に割れる位置がない
}

function groups(str){
  const g = [];
  let cur = '';
  for (let i = 0; i < str.length; i++){
    if (i > 0 && canSplitPrimary(str[i-1], str[i])){ g.push(cur); cur = str[i]; }
    else cur += str[i];
  }
  if (cur) g.push(cur);

  // 2文字以下の塊は後ろに合流（「お」＋「客様を」→「お客様を」）
  const merged = [];
  for (let i = 0; i < g.length; i++){
    if (g[i].length <= 2 && i < g.length - 1 && (g[i].length + g[i+1].length) <= MAX) g[i+1] = g[i] + g[i+1];
    else merged.push(g[i]);
  }
  return merged.flatMap(subdivide);
}

function wrapText(str){
  return str.split(/(\s+)/).map(part => {
    if (!part || /^\s+$/.test(part) || !hasJa(part)) return part;
    return groups(part).map(g => g.length > MAX ? g : '<span class="nb">' + g + '</span>').join('');
  }).join('');
}

function run(file){
  const src = fs.readFileSync(file, 'utf8');
  const parts = src.split(/(<!--[\s\S]*?-->|<[^>]+>)/);
  let skip = 0, prevTag = '', out = [];

  for (const part of parts){
    if (part === undefined) continue;
    if (/^<!--/.test(part)){ out.push(part); continue; }
    if (/^<[^>]+>$/.test(part)){
      const m = part.match(/^<\/?\s*([a-zA-Z0-9]+)/);
      const name = m ? m[1].toLowerCase() : '';
      if (['style','script','svg','title'].includes(name)) skip += /^<\//.test(part) ? -1 : 1;
      prevTag = part;
      out.push(part);
      continue;
    }
    if (skip > 0 || !hasJa(part) || part.includes('&')){ out.push(part); continue; }

    // 直前が </b> 等のインライン終了 かつ 助詞で始まるテキスト＝タグ跨ぎで行頭に助詞が出る
    let text = part;
    if (/^<\/(b|em|strong|i|span|a)>$/i.test(prevTag) && JOSHI.includes(text[0])) text = WJ + text;
    out.push(wrapText(text));
  }

  const res = out.join('');
  fs.writeFileSync(file, res);

  // ---------- 検証 ----------
  const plain = s => s.replace(/<!--[\s\S]*?-->/g,'').replace(/<[^>]+>/g,'').split(WJ).join('');
  const ok = plain(src) === plain(res);
  if (!ok){
    const a = plain(src), b = plain(res);
    for (let i = 0; i < Math.max(a.length, b.length); i++)
      if (a[i] !== b[i]){ console.log('差分位置', i, JSON.stringify(a.slice(i-30,i+30)), '→', JSON.stringify(b.slice(i-30,i+30))); break; }
  }
  const chunks = [...res.matchAll(/<span class="nb">([^<]*)<\/span>/g)].map(m => m[1]);
  const bad  = chunks.filter(s => JOSHI.includes(s[0]) || isNoStart(s[0]));
  const body = res.replace(/<style>[\s\S]*?<\/style>/g,"").replace(/<title>[\s\S]*?<\/title>/g,"").replace(/<!--[\s\S]*?-->/g,"");
  const bare = [...body.matchAll(/>([^<]*)</g)].map(m=>m[1]).filter(s => hasJa(s) && s.trim().length > MAX);
  console.log('span数:', chunks.length, '/ 最長:', Math.max(...chunks.map(s=>s.length)), '文字');
  console.log('本文テキスト同一性:', ok ? 'OK' : 'NG');
  console.log('助詞・禁則文字始まりの塊:', bad.length ? bad.join(' / ') : '0件 OK');
  console.log('未保護の長い地の文:', bare.length ? bare.map(s=>s.trim()).join(' / ') : '0件 OK');
  console.log('WORD JOINER:', (res.split(WJ).length - 1), '箇所');
}

run(process.argv[2]);
