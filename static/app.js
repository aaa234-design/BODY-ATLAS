const $ = (s) => document.querySelector(s);
const views = ["overview","organs","systems","quiz"];
let organs = [], quiz = [], questionIndex = 0, score = 0, answered = false;

async function api(path, options={}) {
  const response = await fetch(path, {headers:{"Content-Type":"application/json"}, ...options});
  if (!response.ok) throw new Error("Could not load data. Please refresh and try again.");
  return response.json();
}
function showView(name) {
  views.forEach(v => { $("#"+v+"-view").classList.toggle("active",v===name); });
  document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  const labels={overview:"OVERVIEW",organs:"ORGAN EXPLORER",systems:"BODY SYSTEMS",quiz:"KNOWLEDGE QUIZ"};
  const titles={overview:"Explore the <em>human body.</em>",organs:"Meet your <em>organs.</em>",systems:"One body. Many <em>systems.</em>",quiz:"Learn it. <em>Remember it.</em>"};
  const subs={overview:"A guided journey through the organs and systems that keep you alive.",organs:"Discover where organs are, what they do and why they matter.",systems:"See how specialised systems cooperate to keep the body working.",quiz:"Put your biology knowledge to the test."};
  $("#crumb-current").textContent=labels[name];$("#page-title").innerHTML=titles[name];$("#page-subtitle").textContent=subs[name];
  window.scrollTo({top:0,behavior:"smooth"});
}
function organCard(o){return `<button class="organ-card" data-organ="${o.id}"><span class="organ-emoji">${o.emoji}</span><h3>${o.name}</h3><p>${o.system} system</p></button>`;}
function bindOrganCards(root){root.querySelectorAll("[data-organ]").forEach(card=>card.addEventListener("click",()=>{showView("organs");loadDetail(card.dataset.organ);}));}
async function loadOrgans(){
  organs=await api("/api/organs");
  $("#featured-organs").innerHTML=organs.slice(0,4).map(organCard).join("");bindOrganCards($("#featured-organs"));
  $("#organ-list").innerHTML=organs.map(organCard).join("");bindOrganCards($("#organ-list"));
  const systems=await api("/api/systems");
  $("#system-filter").innerHTML='<option>All</option>'+systems.map(s=>`<option>${s}</option>`).join("");
  $("#result-count").textContent=organs.length+" organs";
  $("#systems-list").innerHTML=systems.map(s=>{
    const items=organs.filter(o=>o.system===s);
    const descriptions={"Circulatory":"Moves blood to deliver oxygen and nutrients and carry away wastes.","Nervous":"Receives information, processes it and coordinates responses throughout the body.","Respiratory":"Brings oxygen into the body and removes carbon dioxide.","Digestive":"Breaks food into nutrients that the body can absorb and use.","Urinary":"Filters blood, removes waste and helps balance water and salts.","Integumentary":"Protects the body and helps regulate temperature and sensation."};
    return `<article class="system-card"><div class="eyebrow">BODY SYSTEM</div><h3>${s} system</h3><p>${descriptions[s]||"A specialised group of organs working together to support the body."}</p><div class="system-organs">FEATURED: ${items.map(o=>o.name).join(" · ")||"Many connected structures"}</div></article>`;
  }).join("");
}
async function loadDetail(id){
 const o=await api("/api/organs/"+id);
 $("#organ-detail").innerHTML=`<div class="detail-kicker">${o.system.toUpperCase()} SYSTEM</div><div class="detail-title">${o.emoji} ${o.name}</div><div class="detail-location">⌖ &nbsp;${o.location}</div><h4>PRIMARY FUNCTION</h4><p>${o.function}</p><h4>KEY FACTS</h4><ul>${o.facts.map(f=>"<li>"+f+"</li>").join("")}</ul><div class="detail-weight">◈ &nbsp; ${o.weight}</div>`;
}
async function filterOrgans(){
 const q=$("#search-input").value.trim(),system=$("#system-filter").value;
 const data=await api("/api/organs?"+new URLSearchParams({q,system}));
 $("#organ-list").innerHTML=data.map(organCard).join("");bindOrganCards($("#organ-list"));
 $("#result-count").textContent=data.length+" matching organ"+(data.length===1?"":"s");
}
async function startQuiz(){
 quiz=await api("/api/quiz");questionIndex=0;score=0;renderQuestion();
}
function renderQuestion(){
 answered=false;const q=quiz[questionIndex];
 $("#quiz-progress").textContent=`QUESTION ${String(questionIndex+1).padStart(2,"0")} / ${String(quiz.length).padStart(2,"0")}`;
 $("#quiz-score").textContent="SCORE "+score;$("#progress-fill").style.width=((questionIndex+1)/quiz.length*100)+"%";
 const organ=organs.find(o=>o.id===q.id);$("#quiz-organ").textContent=(organ?.emoji||"✳")+" "+q.organ.toUpperCase();
 $("#quiz-question").textContent=q.question;$("#quiz-feedback").textContent="";
 $("#next-question").disabled=true;$("#next-question").textContent=questionIndex===quiz.length-1?"See results":"Next question →";
 $("#quiz-options").innerHTML=q.options.map((opt,i)=>`<button class="quiz-option" data-choice="${i}">${String.fromCharCode(65+i)}. &nbsp;${opt}</button>`).join("");
 $("#quiz-options").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>answerQuestion(Number(b.dataset.choice))));
}
async function answerQuestion(choice){
 if(answered)return;answered=true;const q=quiz[questionIndex];
 const result=await api("/api/quiz/check",{method:"POST",body:JSON.stringify({id:q.id,choice})});
 if(result.correct)score++;
 $("#quiz-options").querySelectorAll("button").forEach((b,i)=>{b.disabled=true;if(i===result.correct_index)b.classList.add("correct");else if(i===choice)b.classList.add("wrong");});
 $("#quiz-feedback").textContent=(result.correct?"Correct! ":"Not quite. ")+result.explanation;
 $("#quiz-score").textContent="SCORE "+score;$("#next-question").disabled=false;
}
$("#next-question").addEventListener("click",()=>{if(questionIndex<quiz.length-1){questionIndex++;renderQuestion();}else{$("#quiz-card").innerHTML=`<div class="eyebrow">QUIZ COMPLETE</div><h2>Your score: <em>${score} / ${quiz.length}</em></h2><p class="muted">${score===quiz.length?"Outstanding work! You know your anatomy.":score>=5?"Great effort. Review the organs you missed and try again.":"Good start. Explore the organ cards, then give it another go."}</p><button class="primary-btn" id="retry-quiz">Try again ↻</button>`;$("#retry-quiz").addEventListener("click",startQuiz);}});
document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>{showView(b.dataset.view);if(b.dataset.view==="quiz"&&!quiz.length)startQuiz();}));
$("#explore-btn").addEventListener("click",()=>showView("organs"));$("#all-organs-btn").addEventListener("click",()=>showView("organs"));
$("#search-input").addEventListener("input",filterOrgans);$("#system-filter").addEventListener("change",filterOrgans);
(async()=>{try{await loadOrgans();}catch(e){$("#featured-organs").innerHTML="<p>"+e.message+"</p>";}})();