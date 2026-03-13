(function(){"use strict";(function(){const v={chevronLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',chevronRight:'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6 6"/></svg>',externalLink:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',thumbsUp:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>',messageCircle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>',share:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>',close:'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'};function F(e){const t=e.theme==="dark",d=t?"#1f2937":"#ffffff",a=t?"#f3f4f6":"#111827",r=t?"#9ca3af":"#6b7280",n=t?"#374151":"#e5e7eb",i=e.accentColor||"#2563eb",c=e.borderRadius||"0.75rem",s=e.shadow!==!1?"0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)":"none",m=e.shadow!==!1?"0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)":"none";return`
      :host { display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      .feeder-carousel { position: relative; }
      .feeder-carousel-track-wrapper { overflow: hidden; margin: 0 1rem; }
      .feeder-carousel-track {
        display: flex;
        transition: transform 0.5s ease-in-out;
      }
      .feeder-carousel-slide { flex-shrink: 0; padding: 0 0.5rem; }

      .feeder-nav-btn {
        position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
        background: rgba(255,255,255,0.9); border: none; border-radius: 50%;
        width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
        cursor: pointer; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        color: #374151; transition: background 0.2s;
      }
      .feeder-nav-btn:hover { background: #ffffff; }
      .feeder-nav-prev { left: 0; margin-left: -0.75rem; }
      .feeder-nav-next { right: 0; margin-right: -0.75rem; }

      .feeder-dots { display: flex; justify-content: center; gap: 0.5rem; margin-top: 1rem; }
      .feeder-dot {
        width: 10px; height: 10px; border-radius: 50%; border: none;
        cursor: pointer; transition: background 0.2s; background: #d1d5db;
      }
      .feeder-dot.active { background: ${i}; }
      .feeder-dot:hover { background: #9ca3af; }
      .feeder-dot.active:hover { background: ${i}; }

      /* Card */
      .feeder-card {
        background: ${d}; border: 1px solid ${n}; border-radius: ${c};
        overflow: hidden; display: flex; flex-direction: column;
        box-shadow: ${s}; transition: box-shadow 0.2s;
      }
      .feeder-card.clickable { cursor: pointer; }
      .feeder-card.clickable:hover { box-shadow: ${m}; }
      .feeder-card.fixed-height { height: 380px; }

      .feeder-card-header { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1rem 0.5rem; }
      .feeder-card-avatar {
        width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0;
      }
      .feeder-card-avatar-placeholder {
        width: 40px; height: 40px; border-radius: 50%;
        background: ${i}; color: #fff; font-weight: 600; font-size: 0.875rem;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      }
      .feeder-card-author { flex: 1; min-width: 0; }
      .feeder-card-author-name {
        font-weight: 600; font-size: 0.875rem; color: ${a};
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .feeder-card-author-date { font-size: 0.75rem; color: ${r}; }
      .feeder-card-link {
        color: ${i}; flex-shrink: 0; display: flex; align-items: center;
        text-decoration: none;
      }
      .feeder-card-link:hover { opacity: 0.8; }

      .feeder-card-body { flex: 1; min-height: 0; }
      .feeder-card-body.fixed-height { overflow: hidden; }
      .feeder-card-content {
        padding: 0 1rem 0.75rem; font-size: 0.875rem; color: ${a};
        line-height: 1.625; white-space: pre-line;
      }
      .feeder-card-content.clamped {
        display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
      }
      .feeder-card-media {
        padding: 0 1rem 0.75rem;
      }
      .feeder-card-media img {
        width: 100%; border-radius: 0.5rem; object-fit: cover;
      }
      .feeder-card-media img.fixed-height { max-height: 160px; }
      .feeder-card-media img.full-height { max-height: 320px; }

      .feeder-read-more {
        background: none; border: none; color: ${i}; cursor: pointer;
        font-size: 0.875rem; font-weight: 500; padding: 0 1rem 0.5rem;
      }
      .feeder-read-more:hover { text-decoration: underline; }

      .feeder-card-footer {
        display: flex; align-items: center; gap: 1rem;
        padding: 0.75rem 1rem; border-top: 1px solid ${n}; margin-top: auto;
      }
      .feeder-stat {
        display: flex; align-items: center; gap: 0.25rem;
        font-size: 0.75rem; color: ${r};
      }

      /* Grid layout */
      .feeder-grid {
        display: grid; gap: 1rem;
      }

      /* List layout */
      .feeder-list { display: flex; flex-direction: column; gap: 1rem; }

      /* Masonry layout */
      .feeder-masonry { columns: 3; column-gap: 1rem; }
      .feeder-masonry > * { break-inside: avoid; margin-bottom: 1rem; }

      @media (max-width: 1023px) {
        .feeder-masonry { columns: 2; }
      }
      @media (max-width: 639px) {
        .feeder-masonry { columns: 1; }
      }
    `}function U(e){const t=e.theme==="dark",d=t?"#111827":"#ffffff",a=t?"#f3f4f6":"#111827",r=t?"#9ca3af":"#6b7280",n=t?"#374151":"#e5e7eb",i=e.accentColor||"#2563eb",c=e.borderRadius||"0.75rem",s=e.shadow!==!1?"0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)":"none";return`
      .feeder-modal-backdrop {
        position: fixed; inset: 0; z-index: 999999;
        display: flex; align-items: center; justify-content: center; padding: 1rem;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .feeder-modal-backdrop *, .feeder-modal-backdrop *::before, .feeder-modal-backdrop *::after {
        box-sizing: border-box; margin: 0; padding: 0;
      }
      .feeder-modal-overlay {
        position: absolute; inset: 0;
        background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px);
      }
      .feeder-modal-container {
        position: relative; width: 100%; max-width: 42rem; max-height: 90vh;
        background: ${d}; border-radius: 1rem;
        box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
        display: flex; flex-direction: column; overflow: hidden;
      }
      .feeder-modal-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 1rem 1.5rem; border-bottom: 1px solid ${n}; flex-shrink: 0;
      }
      .feeder-modal-title {
        font-weight: 600; font-size: 1rem; color: ${a};
      }
      .feeder-modal-close {
        background: none; border: none; padding: 0.375rem; border-radius: 0.5rem;
        color: ${r}; cursor: pointer; display: flex; align-items: center;
        transition: background 0.2s;
      }
      .feeder-modal-close:hover {
        background: ${t?"#1f2937":"#f3f4f6"};
      }
      .feeder-modal-body {
        flex: 1; overflow-y: auto; padding: 1rem;
        display: flex; flex-direction: column; gap: 1rem;
      }

      /* Card styles duplicated for modal (outside shadow DOM) */
      .feeder-modal-card {
        background: ${t?"#1f2937":"#ffffff"}; border: 1px solid ${n};
        border-radius: ${c}; overflow: hidden; display: flex; flex-direction: column;
        box-shadow: ${s};
      }
      .feeder-modal-card-header { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1rem 0.5rem; }
      .feeder-modal-card-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
      .feeder-modal-card-avatar-placeholder {
        width: 40px; height: 40px; border-radius: 50%;
        background: ${i}; color: #fff; font-weight: 600; font-size: 0.875rem;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      }
      .feeder-modal-card-author { flex: 1; min-width: 0; }
      .feeder-modal-card-author-name {
        font-weight: 600; font-size: 0.875rem; color: ${a};
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .feeder-modal-card-author-date { font-size: 0.75rem; color: ${r}; }
      .feeder-modal-card-link {
        color: ${i}; flex-shrink: 0; display: flex; align-items: center; text-decoration: none;
      }
      .feeder-modal-card-content {
        padding: 0 1rem 0.75rem; font-size: 0.875rem; color: ${a};
        line-height: 1.625; white-space: pre-line;
      }
      .feeder-modal-card-media { padding: 0 1rem 0.75rem; }
      .feeder-modal-card-media img { width: 100%; border-radius: 0.5rem; object-fit: cover; max-height: 320px; }
      .feeder-modal-card-footer {
        display: flex; align-items: center; gap: 1rem;
        padding: 0.75rem 1rem; border-top: 1px solid ${n}; margin-top: auto;
      }
      .feeder-modal-stat {
        display: flex; align-items: center; gap: 0.25rem;
        font-size: 0.75rem; color: ${r};
      }

      .feeder-modal-backdrop.entering { animation: feederFadeIn 0.2s ease-out; }
      @keyframes feederFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `}function V(e){try{return new Date(e).toLocaleDateString()}catch{return e}}function o(e,t,d){const a=document.createElement(e);return t&&Object.entries(t).forEach(([r,n])=>a.setAttribute(r,n)),d!==void 0&&(a.innerHTML=d),a}function k(e,t){const d=t.prefix||"feeder-card",a=[d];t.fixedHeight&&a.push("fixed-height"),t.clickable&&a.push("clickable");const r=o("div",{class:a.join(" ")}),n=o("div",{class:`${d}-header`});e.author_avatar_url?n.appendChild(o("img",{class:`${d}-avatar`,src:e.author_avatar_url,alt:e.author_name})):n.appendChild(o("div",{class:`${d}-avatar-placeholder`},e.author_name.charAt(0).toUpperCase()));const i=o("div",{class:`${d}-author`});i.appendChild(o("div",{class:`${d}-author-name`},e.author_name)),i.appendChild(o("div",{class:`${d}-author-date`},V(e.published_at))),n.appendChild(i);const c=o("a",{class:`${d}-link`,href:e.post_url,target:"_blank",rel:"noopener noreferrer",title:"View original post"},v.externalLink);c.addEventListener("click",f=>f.stopPropagation()),n.appendChild(c),r.appendChild(n);const s=o("div");if(t.fixedHeight?s.className="feeder-card-body fixed-height":s.className="feeder-card-body",d==="feeder-modal-card"){const f=o("div",{class:`${d}-content`},e.content);if(r.appendChild(f),e.media_url){const h=o("div",{class:`${d}-media`});h.appendChild(o("img",{src:e.media_url,alt:"Post media"})),r.appendChild(h)}}else{const f=t.fixedHeight?"feeder-card-content clamped":"feeder-card-content",h=o("div",{class:f});if(t.fixedHeight,h.textContent=e.content,s.appendChild(h),e.media_url){const w=o("div",{class:"feeder-card-media"}),g=o("img",{src:e.media_url,alt:"Post media",class:t.fixedHeight?"fixed-height":"full-height"});w.appendChild(g),s.appendChild(w)}r.appendChild(s)}const m=d==="feeder-modal-card"?"feeder-modal-card-footer":"feeder-card-footer",b=d==="feeder-modal-card"?"feeder-modal-stat":"feeder-stat",p=o("div",{class:m});return p.appendChild(o("span",{class:b},`${v.thumbsUp} ${e.like_count}`)),p.appendChild(o("span",{class:b},`${v.messageCircle} ${e.comment_count}`)),p.appendChild(o("span",{class:b},`${v.share} ${e.share_count}`)),r.appendChild(p),r}function N(e,t,d){let a=document.getElementById("feeder-modal-styles");a||(a=document.createElement("style"),a.id="feeder-modal-styles",a.textContent=U(d),document.head.appendChild(a));const r=o("div",{class:"feeder-modal-backdrop entering"}),n=o("div",{class:"feeder-modal-overlay"}),i=o("div",{class:"feeder-modal-container"}),c=o("div",{class:"feeder-modal-header"});c.appendChild(o("span",{class:"feeder-modal-title"},"Feed"));const s=o("button",{class:"feeder-modal-close","aria-label":"Close"},v.close);c.appendChild(s),i.appendChild(c);const m=o("div",{class:"feeder-modal-body"});e.forEach(h=>{m.appendChild(k(h,{fixedHeight:!1,prefix:"feeder-modal-card"}))}),i.appendChild(m),r.appendChild(n),r.appendChild(i),document.body.appendChild(r);const b=document.body.style.overflow;document.body.style.overflow="hidden",requestAnimationFrame(()=>{const h=m.children[t];h&&h.scrollIntoView({behavior:"smooth",block:"start"})});function p(){document.body.style.overflow=b,r.remove(),document.removeEventListener("keydown",f)}function f(h){h.key==="Escape"&&p()}n.addEventListener("click",p),s.addEventListener("click",p),i.addEventListener("click",h=>h.stopPropagation()),document.addEventListener("keydown",f)}function X(e,t){const{posts:d,widget:a}=t,r=a.config,n=r.maxPosts||30,i=d.slice(0,n),c=r.autoRotate!==!1,s=(r.rotationSpeed||5)*1e3,m=r.postsVisible||3;if(i.length===0)return;function b(){const l=window.innerWidth;return l<640?1:l<1024?Math.min(2,m):m}let p=b(),f=0,h=!1,w=null;const g=o("div",{class:"feeder-carousel"}),z=o("button",{class:"feeder-nav-btn feeder-nav-prev","aria-label":"Previous"},v.chevronLeft),S=o("button",{class:"feeder-nav-btn feeder-nav-next","aria-label":"Next"},v.chevronRight),C=o("div",{class:"feeder-carousel-track-wrapper"}),M=o("div",{class:"feeder-carousel-track"});i.forEach((l,x)=>{const u=o("div",{class:"feeder-carousel-slide"}),y=k(l,{fixedHeight:!0,clickable:!0});y.addEventListener("click",()=>N(i,x,r)),u.appendChild(y),M.appendChild(u)}),C.appendChild(M);const j=o("div",{class:"feeder-dots"});function H(){return Math.max(0,i.length-p)}function $(){const l=H();f>l&&(f=l),M.querySelectorAll(".feeder-carousel-slide").forEach(y=>{y.style.width=`${100/p}%`}),M.style.transform=`translateX(-${f*(100/p)}%)`;const u=i.length>p;if(z.style.display=u?"":"none",S.style.display=u?"":"none",j.style.display=u?"":"none",j.innerHTML="",u){const y=l+1;for(let E=0;E<y;E++){const D=o("button",{class:`feeder-dot${E===f?" active":""}`,"aria-label":`Go to slide ${E+1}`});D.addEventListener("click",()=>{f=E,$(),L()}),j.appendChild(D)}}}function P(){const l=H();f=f>=l?0:f+1,$()}function R(){const l=H();f=f<=0?l:f-1,$()}function T(){!c||i.length<=p||(w=setInterval(()=>{h||P()},s))}function L(){w&&clearInterval(w),T()}z.addEventListener("click",()=>{R(),L()}),S.addEventListener("click",()=>{P(),L()}),g.addEventListener("mouseenter",()=>{h=!0}),g.addEventListener("mouseleave",()=>{h=!1});let _=0,B=0;C.addEventListener("touchstart",l=>{_=l.touches[0].clientX,B=l.touches[0].clientY},{passive:!0}),C.addEventListener("touchmove",l=>{const x=Math.abs(l.touches[0].clientX-_),u=Math.abs(l.touches[0].clientY-B);x>u&&x>10&&l.preventDefault()},{passive:!1}),C.addEventListener("touchend",l=>{const x=l.changedTouches[0].clientX-_,u=Math.abs(l.changedTouches[0].clientY-B);Math.abs(x)>50&&Math.abs(x)>u&&(x<0?P():R(),L())},{passive:!0}),g.appendChild(z),g.appendChild(S),g.appendChild(C),g.appendChild(j),e.appendChild(g),$(),T(),window.addEventListener("resize",()=>{const l=b();l!==p&&(p=l,$(),L())})}function Y(e,t){const{posts:d,widget:a}=t,r=a.config,n=r.maxPosts||30,i=r.columns||3,c=d.slice(0,n),s=o("div",{class:"feeder-grid"});s.style.gridTemplateColumns=`repeat(${i}, 1fr)`,c.forEach(m=>{s.appendChild(k(m,{fixedHeight:!1}))}),e.appendChild(s)}function I(e,t){const{posts:d,widget:a}=t,n=a.config.maxPosts||30,i=d.slice(0,n),c=o("div",{class:"feeder-list"});i.forEach(s=>{c.appendChild(k(s,{fixedHeight:!1}))}),e.appendChild(c)}function q(e,t){const{posts:d,widget:a}=t,n=a.config.maxPosts||30,i=d.slice(0,n),c=o("div",{class:"feeder-masonry"});i.forEach(s=>{c.appendChild(k(s,{fixedHeight:!1}))}),e.appendChild(c)}function O(){const e=document.querySelectorAll("script[src]");for(let t=e.length-1;t>=0;t--){const d=e[t].src;if(d.includes("embed.js"))try{return new URL(d).origin}catch{}}return window.location.origin}async function W(e){const t=e.getAttribute("data-widget");if(!t)return;const d=O(),a=document.createElement("div");a.setAttribute("data-feeder-widget",t),e.parentNode.insertBefore(a,e.nextSibling);const r=a.attachShadow({mode:"open"});let n;try{const s=await fetch(`${d}/api/widget/${t}`);if(!s.ok){r.innerHTML='<p style="color:#ef4444;font-family:sans-serif;font-size:0.875rem;">Failed to load widget</p>';return}n=await s.json()}catch{r.innerHTML='<p style="color:#ef4444;font-family:sans-serif;font-size:0.875rem;">Failed to load widget</p>';return}const i=document.createElement("style");switch(i.textContent=F(n.widget.config),r.appendChild(i),n.widget.layout){case"carousel":X(r,n);break;case"grid":Y(r,n);break;case"list":I(r,n);break;case"masonry":q(r,n);break;default:I(r,n)}}function A(){document.querySelectorAll("script[data-widget]").forEach(t=>{t.getAttribute("data-feeder-initialized")||(t.setAttribute("data-feeder-initialized","true"),W(t))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",A):A()})()})();
