const body=document.body;
const menuToggle=document.getElementById("menuToggle");
const navLinks=document.getElementById("navLinks");
const progressBar=document.getElementById("scrollProgress");
const backToTop=document.getElementById("backToTop");
const filterButtons=[...document.querySelectorAll(".filter-chip")];
const projectCards=[...document.querySelectorAll(".project-card")];

menuToggle.addEventListener("click",()=>{
  const open=navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded",String(open));
  menuToggle.setAttribute("aria-label",open?"Close navigation":"Open navigation");
});
navLinks.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{
  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded","false");
}));

filterButtons.forEach(button=>button.addEventListener("click",()=>{
  const filter=button.dataset.filter;
  filterButtons.forEach(item=>{
    const active=item===button;
    item.classList.toggle("active",active);
    item.setAttribute("aria-pressed",String(active));
  });
  projectCards.forEach(card=>{
    const categories=(card.dataset.category||"").split(" ");
    card.hidden=filter!=="all"&&!categories.includes(filter);
  });
}));

const fields=["name","email","message"].map(id=>document.getElementById(id));
const feedback=document.getElementById("formFeedback");
fields.forEach(field=>field.addEventListener("input",()=>field.removeAttribute("aria-invalid")));
document.getElementById("contactForm").addEventListener("submit",event=>{
  event.preventDefault();
  feedback.textContent="";
  feedback.classList.remove("error");
  const [name,email,message]=fields;
  const fail=(field,text)=>{
    field.setAttribute("aria-invalid","true");
    feedback.textContent=text;
    feedback.classList.add("error");
    field.focus();
  };
  if(!name.value.trim())return fail(name,"Please enter your name.");
  if(!email.value.trim())return fail(email,"Please enter your email address.");
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))return fail(email,"Please enter a valid email address.");
  if(!message.value.trim())return fail(message,"Please write a message.");
  const subject=encodeURIComponent("Portfolio enquiry from "+name.value.trim());
  const bodyText=encodeURIComponent("Name: "+name.value.trim()+"\nEmail: "+email.value.trim()+"\n\nMessage:\n"+message.value.trim());
  window.location.href="mailto:bstmzk@proton.me?subject="+subject+"&body="+bodyText;
  feedback.textContent="Your email app should open with a draft. Review it and press Send.";
});

function updateScroll(){
  const max=document.documentElement.scrollHeight-window.innerHeight;
  progressBar.style.width=(max>0?window.scrollY/max*100:0)+"%";
  backToTop.classList.toggle("visible",window.scrollY>450);
}
window.addEventListener("scroll",updateScroll,{passive:true});
updateScroll();
backToTop.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
document.getElementById("year").textContent=new Date().getFullYear();

const roles=["CSE STUDENT","AI / ML EXPLORER","WEB DEVELOPER","PYTHON LEARNER"];
const role=document.getElementById("roleRotator");
if(role&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
  let index=0;
  window.setInterval(()=>{
    index=(index+1)%roles.length;
    role.textContent=roles[index];
  },2600);
}
