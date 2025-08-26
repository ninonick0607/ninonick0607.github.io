document.addEventListener('DOMContentLoaded',()=>{
  const y=document.getElementById('y'); if(y) y.textContent=new Date().getFullYear();
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      const id=a.getAttribute('href').slice(1);
      if(!id) return;
      const el=document.getElementById(id);
      if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth',block:'start'}); }
    });
  });
});