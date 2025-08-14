
const CAREERS = [
  { title: "Data Analyst", tags: ["python","excel","sql","data","power bi","tableau","analysis"], description: "Work with data to generate insights, dashboards, and reporting.", learn: ["SQL for Beginners","Data Visualization with Power BI"] },
  { title: "Frontend Developer", tags: ["javascript","react","html","css","ui","web development"], description: "Build interactive user interfaces for web applications.", learn: ["React - Beginner to Pro","Modern CSS Essentials"] },
  { title: "AI Engineer / ML Engineer", tags: ["machine learning","python","tensorflow","pytorch","models","ai"], description: "Design and deploy machine learning models for real-world problems.", learn: ["Intro to Machine Learning","Deep Learning Specialization"] },
  { title: "UI/UX Designer", tags: ["figma","ui","ux","design","wireframing","prototyping"], description: "Design user experiences, prototypes and visually appealing interfaces.", learn: ["UI Design Fundamentals","User Research Basics"] },
  { title: "DevOps Engineer", tags: ["docker","kubernetes","ci/cd","aws","infrastructure","automation"], description: "Automate deployments and maintain infrastructure reliability.", learn: ["Docker & Kubernetes Essentials","CI/CD with Jenkins"] },
  { title: "Digital Marketer", tags: ["seo","content","ads","analytics","marketing","social media"], description: "Plan and execute digital campaigns to grow audiences and sales.", learn: ["SEO Fundamentals","Google Ads Crash Course"] }
];

const skillsInput = document.getElementById("skillsInput");
const interestsInput = document.getElementById("interestsInput");
const goalInput = document.getElementById("goalInput");
const recommendBtn = document.getElementById("recommendBtn");
const resetBtn = document.getElementById("resetBtn");
const resultsSection = document.getElementById("resultsSection");
const resultsCards = document.getElementById("resultsCards");
const livePreview = document.getElementById("livePreview");
const chipEls = document.querySelectorAll(".chip");
const againBtn = document.getElementById("againBtn");
const downloadReport = document.getElementById("downloadReport");
const confidenceBadge = document.getElementById("confidenceBadge");

chipEls.forEach(ch => {
  ch.addEventListener("click", () => {
    const s = skillsInput.value.trim();
    skillsInput.value = s ? s + ", " + ch.dataset.skill : ch.dataset.skill;
    updatePreview();
  });
});

function updatePreview() {
  const s = skillsInput.value.trim();
  const i = interestsInput.value.trim();
  if(!s && !i){
    livePreview.innerHTML = "<i>Enter your skills and interests to see a live preview!</i>";
  } else {
    livePreview.innerHTML = `<strong>Skills:</strong> ${escapeHtml(s || "none")}<br>
                             <strong>Interests:</strong> ${escapeHtml(i || "none")}`;
  }
}
skillsInput.addEventListener("input", updatePreview);
interestsInput.addEventListener("input", updatePreview);
goalInput.addEventListener("input", updatePreview);
updatePreview();

function recommendCareers(skillsText, interestsText, goalText) {
  const skills = splitAndNormalize(skillsText);
  const interests = splitAndNormalize(interestsText);
  const goal = (goalText || "").toLowerCase();

  const scored = CAREERS.map(c => {
    const tags = c.tags.map(t => t.toLowerCase());
    const skillMatches = skills.filter(s => tags.includes(s)).length;
    const interestMatches = interests.filter(i => tags.includes(i)).length;
    const partialMatches = tags.reduce((acc, t) => acc + skills.filter(s => t.includes(s) || s.includes(t)).length, 0);
    const goalBonus = goal ? (c.title.toLowerCase().includes(goal) || tags.includes(goal) ? 1 : 0) : 0;
    const score = skillMatches*3 + interestMatches*2 + partialMatches + goalBonus*2;
    return {...c, score, skillMatches, interestMatches};
  });

  scored.sort((a,b)=> b.score - a.score || a.title.localeCompare(b.title));
  return scored;
}

recommendBtn.addEventListener("click", ()=>{
  const skills = skillsInput.value;
  const interests = interestsInput.value;
  const goal = goalInput.value;
  if(!skills.trim() && !interests.trim()){
    flash("Please add at least one skill or interest.");
    return;
  }
  const recs = recommendCareers(skills, interests, goal);
  renderResults(recs);
});

resetBtn.addEventListener("click", ()=> {
  skillsInput.value = "";
  interestsInput.value = "";
  goalInput.value = "";
  updatePreview();
  resultsSection.classList.add("hide");
  resultsCards.innerHTML="";
});

if(againBtn) againBtn.addEventListener("click", ()=> {
  resultsSection.classList.add("hide");
  resultsCards.innerHTML="";
  window.scrollTo({top:0, behavior:"smooth"});
});

if(downloadReport) downloadReport.addEventListener("click", ()=>{
  const html = resultsCards.innerText || "No results";
  const blob = new Blob([`Career Report\n\n${html}`], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'career-report.txt'; a.click();
  URL.revokeObjectURL(url);
});

function renderResults(list){
  resultsCards.innerHTML = "";
  resultsSection.classList.remove("hide");

  const avgScore = Math.round((list[0].score + list[1]?.score + list[2]?.score)/3 || list[0].score);
  confidenceBadge.innerText = `Top match score: ${list[0].score}`;

  list.slice(0,4).forEach((c, idx) => {
    const div = document.createElement('div');
    div.className = 'career-card';
    div.innerHTML = `
      <div class="career-title">${escapeHtml(c.title)}</div>
      <div class="career-desc">${escapeHtml(c.description)}</div>
      <div style="margin-bottom:8px">
        ${c.tags.slice(0,6).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join('')}
      </div>
      <div style="font-size:13px;color:var(--muted);margin-bottom:8px">
        Score: <strong>${c.score}</strong> · Skills matched: ${c.skillMatches}
      </div>
      <div>
        <button class="btn" onclick="showLearning(${idx})">View Learning Path</button>
      </div>
    `;
    resultsCards.appendChild(div);
  });

  if(list[0].score >= 5) runConfetti();
  window.scrollTo({top:document.body.scrollHeight, behavior:'smooth'});
}

window.showLearning = function(idx){
  const c = CAREERS[idx];
  const html = `${c.title}\n\nRecommended starts:\n- ${c.learn.join('\n- ')}`;
  alert(html);
};

function splitAndNormalize(text){ return text.split(',').map(s => s.trim().toLowerCase()).filter(Boolean); }
function escapeHtml(str){ return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function flash(msg){ const orig = recommendBtn.innerText; recommendBtn.innerText = msg; recommendBtn.disabled=true; setTimeout(()=>{recommendBtn.innerText=orig; recommendBtn.disabled=false},1400); }

function runConfetti(){
  const c = document.getElementById("confetti");
  if(!c) return;
  const ctx = c.getContext("2d");
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  const confs = [];
  for(let i=0;i<120;i++){
    confs.push({x:Math.random()*c.width, y:Math.random()*c.height, r:Math.random()*4+2, dx:Math.random()*2-1, dy:Math.random()*3+2, color:`hsl(${Math.random()*360},100%,60%)`});
  }
  function anim(){
    ctx.clearRect(0,0,c.width,c.height);
    confs.forEach(p=>{
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.x+=p.dx; p.y+=p.dy;
      if(p.y>c.height){p.y=0; p.x=Math.random()*c.width;}
    });
    requestAnimationFrame(anim);
  }
  anim();
}
