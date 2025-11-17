
const byId = id => document.getElementById(id);

function ballClass(n){
  if(n<=10) return "yellow";
  if(n<=20) return "blue";
  if(n<=30) return "red";
  if(n<=40) return "gray";
  return "green";
}

function renderSet(nums){
  const wrap=document.createElement("div");
  wrap.className="set";
  nums.forEach(n=>{
    const b=document.createElement("span");
    b.className="ball "+ballClass(n);
    b.textContent=n;
    wrap.appendChild(b);
  });
  return wrap;
}

function pickPure(k=6){
  const s=new Set();
  while(s.size<k) s.add(Math.floor(Math.random()*45)+1);
  return [...s].sort((a,b)=>a-b);
}

function loadSaved(){
  return JSON.parse(localStorage.getItem("luckySave")||"[]");
}
function saveSaved(list){
  localStorage.setItem("luckySave",JSON.stringify(list));
}

(async function(){
  const mode=byId("mode");
  const count=byId("count");
  const locked=byId("locked");
  const current=byId("current");
  const saved=byId("saved");
  const freqBox=byId("freq-summary");

  const freq={}; for(let i=1;i<=45;i++) freq[i]=1;

  const gen=()=>{
    current.innerHTML="";
    const c=Math.min(10,Math.max(1,Number(count.value||1)));
    const locks=(locked.value||"").split(/[ ,]+/).map(n=>+n).filter(n=>n>=1&&n<=45);
    for(let i=0;i<c;i++){
      let base=pickPure(6-locks.length);
      let nums=[...new Set([...locks, ...base])].slice(0,6).sort((a,b)=>a-b);
      current.appendChild(renderSet(nums));
    }
  };

  byId("btn-generate").onclick=gen;

  byId("btn-save").onclick=()=>{
    const list=loadSaved();
    const sets=[...current.querySelectorAll(".set")];
    const t=new Date().toLocaleString();
    sets.forEach(s=>{
      const nums=[...s.querySelectorAll(".ball")].map(b=>+b.textContent);
      list.push({nums, t});
    });
    saveSaved(list);
    renderSaved();
  };

  byId("btn-clear").onclick=()=>{
    saveSaved([]);
    renderSaved();
  };

  function renderSaved(){
    saved.innerHTML="";
    const list=loadSaved();
    if(!list.length){
      const p=document.createElement("p");
      p.textContent="저장 없음";
      p.style.color="#888";
      saved.appendChild(p);
      return;
    }
    list.forEach(item=>{
      const row=document.createElement("div");
      row.className="row";
      row.appendChild(renderSet(item.nums));
      const meta=document.createElement("span");
      meta.className="meta";
      meta.textContent=item.t;
      row.appendChild(meta);
      saved.appendChild(row);
    });
  }

  function freqSummary(){
    const div=document.createElement("div");
    ["TOP5","BOTTOM5"].forEach(label=>{
      const box=document.createElement("div");
      box.className="mini";
      const t=document.createElement("span");
      t.className="title";
      t.textContent=label;
      box.appendChild(t);      
      for(let i=1;i<=5;i++){
        const b=document.createElement("span");
        b.className="ball yellow";
        b.textContent=i;
        box.appendChild(b);
      }
      div.appendChild(box);
    });
    freqBox.appendChild(div);
  }

  freqSummary();
  gen();
  renderSaved();
})();
