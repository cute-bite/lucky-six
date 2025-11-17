
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

function randomNumber(){
  return Math.floor(Math.random()*45)+1;
}

function makeCombo(locks){
  const set=new Set();
  locks.forEach(n=>{ if(n>=1 && n<=45) set.add(n); });
  while(set.size<6){
    set.add(randomNumber());
  }
  return [...set].sort((a,b)=>a-b);
}

function loadSaved(){
  return JSON.parse(localStorage.getItem("luckySave")||"[]");
}
function saveSaved(list){
  localStorage.setItem("luckySave",JSON.stringify(list));
}

(function(){
  const count=byId("count");
  const locked=byId("locked");
  const current=byId("current");
  const saved=byId("saved");
  const freqBox=byId("freq-summary");

  const gen=()=>{
    current.innerHTML="";
    const c=Math.min(10,Math.max(1,Number(count.value||1)));
    const locks=(locked.value||"").split(/[ ,]+/).map(n=>+n).filter(n=>n>=1&&n<=45);
    for(let i=0;i<c;i++){
      const nums=makeCombo(locks);
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
    list.forEach((item, idx)=>{
      const row=document.createElement("div");
      row.className="row";
      row.appendChild(renderSet(item.nums));
      const meta=document.createElement("span");
      meta.className="meta";
      meta.textContent=item.t;
      row.appendChild(meta);
      const del=document.createElement("button");
      del.className="btn ghost small";
      del.textContent="삭제";
      del.onclick=()=>{
        const arr=loadSaved();
        arr.splice(idx,1);
        saveSaved(arr);
        renderSaved();
      };
      row.appendChild(del);
      saved.appendChild(row);
    });
  }

  function renderFreqDummy(){
    const top=document.createElement("div");
    top.className="mini";
    const t1=document.createElement("span");
    t1.className="title";
    t1.textContent="TOP5(샘플)";
    top.appendChild(t1);
    [1,2,3,4,5].forEach(n=>{
      const b=document.createElement("span");
      b.className="ball "+ballClass(n);
      b.textContent=n;
      top.appendChild(b);
    });
    const bottom=document.createElement("div");
    bottom.className="mini";
    const t2=document.createElement("span");
    t2.className="title";
    t2.textContent="BOTTOM5(샘플)";
    bottom.appendChild(t2);
    [41,42,43,44,45].forEach(n=>{
      const b=document.createElement("span");
      b.className="ball "+ballClass(n);
      b.textContent=n;
      bottom.appendChild(b);
    });
    freqBox.appendChild(top);
    freqBox.appendChild(bottom);
  }

  renderFreqDummy();
  gen();
  renderSaved();
})();
