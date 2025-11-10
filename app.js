// Lucky Six core
// - Pure random using crypto.getRandomValues
// - Hot/Cold weighted random using historical frequency
// - Save combos to localStorage
// - PWA ready

const range = (n, start=1) => Array.from({length:n}, (_,i)=>i+start);
const SHUFFLE = arr => arr.map(v=>[v,Math.random()]).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);

function cryptoInt(max) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max; // 0..max-1
}

function pickPure(k=6, n=45) {
  const set = new Set();
  while (set.size < k) set.add(cryptoInt(n) + 1);
  return [...set].sort((a,b)=>a-b);
}

function weightedPick(freqMap, mode='hot', k=6, n=45) {
  // Build weights: hot -> weight = freq+epsilon ; cold -> inverse
  const epsilon = 1e-6;
  const freqs = range(n).map(i=>freqMap[i+1] || 0);
  const maxF = Math.max(...freqs);
  const weights = freqs.map(f => {
    if (mode === 'hot') return f + epsilon;
    if (mode === 'cold') return (maxF - f) + 1; // least frequent get bigger weight
    return 1;
  });

  // sample without replacement via weighted reservoir: Gumbel-top-k
  const gumbels = weights.map(w => Math.log(w) - Math.log(-Math.log((Math.random()+1e-12))));
  const items = range(n).map(i=>({num:i+1, score:gumbels[i]}));
  items.sort((a,b)=>b.score - a.score);
  return items.slice(0,k).map(x=>x.num).sort((a,b)=>a-b);
}

const DOM = sel => document.querySelector(sel);
const byId = id => document.getElementById(id);

function ballClass(n){
  if (n>=1 && n<=10) return 'yellow';
  if (n>=11 && n<=20) return 'blue';
  if (n>=21 && n<=30) return 'red';
  if (n>=31 && n<=40) return 'gray';
  return 'green'; // 41-45
}

function renderSet(nums) {
  const wrap = document.createElement('div');
  wrap.className = 'set';
  nums.forEach(n => {
    const b = document.createElement('span');
    b.className = 'ball ' + ballClass(n);
    b.textContent = n;
    wrap.appendChild(b);
  });
  return wrap;
}

function loadSaved() {
  return JSON.parse(localStorage.getItem('luckySixSaved') || '[]');
}
function saveSaved(list) {
  localStorage.setItem('luckySixSaved', JSON.stringify(list));
}

async function loadHistorical() {
  try {
    const res = await fetch('data/historical.json', {cache:'no-store'});
    if (!res.ok) throw new Error('no data');
    const data = await res.json();
    // data: { draws: [ [6 numbers], ... ] }
    const freq = {};
    for (let i=1;i<=45;i++) freq[i]=0;
    for (const draw of data.draws || []) {
      for (const n of draw) freq[n] = (freq[n]||0)+1;
    }
    return freq;
  } catch(e) {
    // fallback: flat weights
    const freq = {};
    for (let i=1;i<=45;i++) freq[i]=1;
    return freq;
  }
}

function summarizeFreq(freq) {
  // Return top5 and bottom5 numbers
  const arr = Object.entries(freq).map(([num,f])=>({num:Number(num), f}));
  arr.sort((a,b)=>b.f - a.f);
  return {top: arr.slice(0,5), bottom: arr.slice(-5)};
}

(async function main(){
  const modeSel = byId('mode');
  const countInput = byId('count');
  const current = byId('current');
  const saved = byId('saved');
  const freqBox = byId('freq-summary');

  const freq = await loadHistorical();
  const summary = summarizeFreq(freq);

  // Render freq summary
  const blocks = [];
  const makeBlock = (title, items) => {
    const s = document.createElement('div');
    s.className = 'set';
    const label = document.createElement('span');
    label.className = 'hint';
    label.textContent = title;
    s.appendChild(label);
    items.forEach(({num,f}) => {
      const b = document.createElement('span');
      b.className = 'ball ' + ballClass(num);
      b.textContent = num;
      s.appendChild(b);
    });
    blocks.push(s);
  };
  makeBlock('자주 나온 번호 TOP5', summary.top);
  makeBlock('덜 나온 번호 BOTTOM5', summary.bottom);
  blocks.forEach(b => freqBox.appendChild(b));

  const gen = () => {
    current.innerHTML = '';
    const cnt = Math.max(1, Math.min(10, Number(countInput.value||1)));
    const mode = modeSel.value;
    for (let i=0;i<cnt;i++) {
      const nums = mode==='pure' ? pickPure() : weightedPick(freq, mode);
      current.appendChild(renderSet(nums));
    }
  };

  byId('btn-generate').addEventListener('click', gen);
  byId('btn-save').addEventListener('click', ()=>{
    const list = loadSaved();
    const sets = Array.from(current.querySelectorAll('.set'));
    if (!sets.length) return;
    const timestamp = new Date().toISOString();
    sets.forEach(set => {
      const nums = Array.from(set.querySelectorAll('.ball')).map(s=>Number(s.textContent));
      list.push({nums, at: timestamp});
    });
    saveSaved(list);
    renderSaved();
  });
  byId('btn-clear').addEventListener('click', ()=>{
    if (confirm('저장된 모든 조합을 삭제할까요?')) {
      saveSaved([]);
      renderSaved();
    }
  });

  function renderSaved() {
    saved.innerHTML = '';
    const list = loadSaved();
    if (!list.length) {
      const p = document.createElement('p');
      p.className = 'hint';
      p.textContent = '아직 없음';
      saved.appendChild(p);
      return;
    }
    list.slice().reverse().forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'row';
      row.appendChild(renderSet(item.nums));
      const meta = document.createElement('span');
      meta.className = 'meta';
      meta.textContent = (new Date(item.at)).toLocaleString();
      row.appendChild(meta);
      const del = document.createElement('button');
      del.className = 'btn secondary';
      del.textContent = '삭제';
      del.addEventListener('click', ()=>{
        const all = loadSaved();
        const realIndex = all.length - 1 - idx;
        all.splice(realIndex,1);
        saveSaved(all);
        renderSaved();
      });
      row.appendChild(del);
      saved.appendChild(row);
    });
  }

  gen();
  renderSaved();
})();