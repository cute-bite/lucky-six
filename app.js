
const byId = id => document.getElementById(id);

function ballClass(n){
  if(n<=10) return "yellow";
  if(n<=20) return "blue";
  if(n<=30) return "red";
  if(n<=40) return "gray";
  return "green";
}

function randomNumber(){ return Math.floor(Math.random()*45)+1; }

function makeSet(locks){
  const s=new Set();
  locks.forEach(n=>{ if(n>=1&&n<=45) s.add(n); });
  while(s.size<6) s.add(randomNumber());
  return [...s].sort((a,b)=>a-b);
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

function loadSaved(){ return JSON.parse(localStorage.getItem("luckySave")||"[]"); }
function saveSaved(data){ localStorage.setItem("luckySave",JSON.stringify(data)); }

(function(){
  const current=byId("current");
  const saved=byId("saved");
  const freqBox=byId("freq-summary");

  function generate(){
    current.innerHTML="";
    const count=Math.max(1,Math.min(10,Number(byId("count").value||1)));
    const locks=(byId("locked").value||"").split(/[ ,]+/).map(n=>+n).filter(n=>n>=1&&n<=45);
    for(let i=0;i<count;i++){
      current.appendChild(renderSet(makeSet(locks)));
    }
  }

  byId("btn-generate").onclick=generate;

  byId("btn-save").onclick=()=>{
    const list=loadSaved();
    [...current.querySelectorAll(".set")].forEach(s=>{
      const nums=[...s.querySelectorAll(".ball")].map(b=>+b.textContent);
      list.push({nums});
    });
    saveSaved(list);
    renderSaved();
  };

  byId("btn-clear").onclick=()=>{ saveSaved([]); renderSaved(); };

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

      const spacer=document.createElement("div");
      spacer.className="spacer";
      row.appendChild(spacer);

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

  function freq(){
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

  generate();
  renderSaved();
  freq();
})();
