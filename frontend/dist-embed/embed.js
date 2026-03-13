(function(){"use strict";(function(){const x={chevronLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',chevronRight:'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6 6"/></svg>',externalLink:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',thumbsUp:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>',messageCircle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>',share:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>',close:'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'};function R(e){const t=e.theme==="dark",d=t?"#1f2937":"#ffffff",a=t?"#f3f4f6":"#111827",r=t?"#9ca3af":"#6b7280",n=t?"#374151":"#e5e7eb",i=e.accentColor||"#2563eb",l=e.borderRadius||"0.75rem",s=e.shadow!==!1?"0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)":"none",m=e.shadow!==!1?"0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)":"none";return`
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
        background: ${d}; border: 1px solid ${n}; border-radius: ${l};
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
    `}function F(e){const t=e.theme==="dark",d=t?"#111827":"#ffffff",a=t?"#f3f4f6":"#111827",r=t?"#9ca3af":"#6b7280",n=t?"#374151":"#e5e7eb",i=e.accentColor||"#2563eb",l=e.borderRadius||"0.75rem",s=e.shadow!==!1?"0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)":"none";return`
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
        border-radius: ${l}; overflow: hidden; display: flex; flex-direction: column;
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
    `}function U(e){try{return new Date(e).toLocaleDateString()}catch{return e}}function o(e,t,d){const a=document.createElement(e);return t&&Object.entries(t).forEach(([r,n])=>a.setAttribute(r,n)),d!==void 0&&(a.innerHTML=d),a}function y(e,t){const d=t.prefix||"feeder-card",a=[d];t.fixedHeight&&a.push("fixed-height"),t.clickable&&a.push("clickable");const r=o("div",{class:a.join(" ")}),n=o("div",{class:`${d}-header`});e.author_avatar_url?n.appendChild(o("img",{class:`${d}-avatar`,src:e.author_avatar_url,alt:e.author_name})):n.appendChild(o("div",{class:`${d}-avatar-placeholder`},e.author_name.charAt(0).toUpperCase()));const i=o("div",{class:`${d}-author`});i.appendChild(o("div",{class:`${d}-author-name`},e.author_name)),i.appendChild(o("div",{class:`${d}-author-date`},U(e.published_at))),n.appendChild(i);const l=o("a",{class:`${d}-link`,href:e.post_url,target:"_blank",rel:"noopener noreferrer",title:"View original post"},x.externalLink);l.addEventListener("click",c=>c.stopPropagation()),n.appendChild(l),r.appendChild(n);const s=o("div");if(t.fixedHeight?s.className="feeder-card-body fixed-height":s.className="feeder-card-body",d==="feeder-modal-card"){const c=o("div",{class:`${d}-content`},e.content);if(r.appendChild(c),e.media_url){const f=o("div",{class:`${d}-media`});f.appendChild(o("img",{src:e.media_url,alt:"Post media"})),r.appendChild(f)}}else{const c=t.fixedHeight?"feeder-card-content clamped":"feeder-card-content",f=o("div",{class:c});if(t.fixedHeight,f.textContent=e.content,s.appendChild(f),e.media_url){const v=o("div",{class:"feeder-card-media"}),u=o("img",{src:e.media_url,alt:"Post media",class:t.fixedHeight?"fixed-height":"full-height"});v.appendChild(u),s.appendChild(v)}r.appendChild(s)}const m=d==="feeder-modal-card"?"feeder-modal-card-footer":"feeder-card-footer",g=d==="feeder-modal-card"?"feeder-modal-stat":"feeder-stat",p=o("div",{class:m});return p.appendChild(o("span",{class:g},`${x.thumbsUp} ${e.like_count}`)),p.appendChild(o("span",{class:g},`${x.messageCircle} ${e.comment_count}`)),p.appendChild(o("span",{class:g},`${x.share} ${e.share_count}`)),r.appendChild(p),r}function V(e,t,d){let a=document.getElementById("feeder-modal-styles");a||(a=document.createElement("style"),a.id="feeder-modal-styles",a.textContent=F(d),document.head.appendChild(a));const r=o("div",{class:"feeder-modal-backdrop entering"}),n=o("div",{class:"feeder-modal-overlay"}),i=o("div",{class:"feeder-modal-container"}),l=o("div",{class:"feeder-modal-header"});l.appendChild(o("span",{class:"feeder-modal-title"},"Feed"));const s=o("button",{class:"feeder-modal-close","aria-label":"Close"},x.close);l.appendChild(s),i.appendChild(l);const m=o("div",{class:"feeder-modal-body"});e.forEach(f=>{m.appendChild(y(f,{fixedHeight:!1,prefix:"feeder-modal-card"}))}),i.appendChild(m),r.appendChild(n),r.appendChild(i),document.body.appendChild(r);const g=document.body.style.overflow;document.body.style.overflow="hidden",requestAnimationFrame(()=>{const f=m.children[t];f&&f.scrollIntoView({behavior:"smooth",block:"start"})});function p(){document.body.style.overflow=g,r.remove(),document.removeEventListener("keydown",c)}function c(f){f.key==="Escape"&&p()}n.addEventListener("click",p),s.addEventListener("click",p),i.addEventListener("click",f=>f.stopPropagation()),document.addEventListener("keydown",c)}function D(e,t){const{posts:d,widget:a}=t,r=a.config,n=r.maxPosts||30,i=d.slice(0,n),l=r.autoRotate!==!1,s=(r.rotationSpeed||5)*1e3,m=r.postsVisible||3;if(i.length===0)return;function g(){const h=window.innerWidth;return h<640?1:h<1024?Math.min(2,m):m}let p=g(),c=0,f=!1,v=null;const u=o("div",{class:"feeder-carousel"}),M=o("button",{class:"feeder-nav-btn feeder-nav-prev","aria-label":"Previous"},x.chevronLeft),j=o("button",{class:"feeder-nav-btn feeder-nav-next","aria-label":"Next"},x.chevronRight),S=o("div",{class:"feeder-carousel-track-wrapper"}),$=o("div",{class:"feeder-carousel-track"});i.forEach((h,I)=>{const b=o("div",{class:"feeder-carousel-slide"}),w=y(h,{fixedHeight:!0,clickable:!0});w.addEventListener("click",()=>V(i,I,r)),b.appendChild(w),$.appendChild(b)}),S.appendChild($);const L=o("div",{class:"feeder-dots"});function z(){return Math.max(0,i.length-p)}function k(){const h=z();c>h&&(c=h),$.querySelectorAll(".feeder-carousel-slide").forEach(w=>{w.style.width=`${100/p}%`}),$.style.transform=`translateX(-${c*(100/p)}%)`;const b=i.length>p;if(M.style.display=b?"":"none",j.style.display=b?"":"none",L.style.display=b?"":"none",L.innerHTML="",b){const w=h+1;for(let C=0;C<w;C++){const A=o("button",{class:`feeder-dot${C===c?" active":""}`,"aria-label":`Go to slide ${C+1}`});A.addEventListener("click",()=>{c=C,k(),E()}),L.appendChild(A)}}}function _(){const h=z();c=c>=h?0:c+1,k()}function W(){const h=z();c=c<=0?h:c-1,k()}function B(){!l||i.length<=p||(v=setInterval(()=>{f||_()},s))}function E(){v&&clearInterval(v),B()}M.addEventListener("click",()=>{W(),E()}),j.addEventListener("click",()=>{_(),E()}),u.addEventListener("mouseenter",()=>{f=!0}),u.addEventListener("mouseleave",()=>{f=!1}),u.appendChild(M),u.appendChild(j),u.appendChild(S),u.appendChild(L),e.appendChild(u),k(),B(),window.addEventListener("resize",()=>{const h=g();h!==p&&(p=h,k(),E())})}function T(e,t){const{posts:d,widget:a}=t,r=a.config,n=r.maxPosts||30,i=r.columns||3,l=d.slice(0,n),s=o("div",{class:"feeder-grid"});s.style.gridTemplateColumns=`repeat(${i}, 1fr)`,l.forEach(m=>{s.appendChild(y(m,{fixedHeight:!1}))}),e.appendChild(s)}function H(e,t){const{posts:d,widget:a}=t,n=a.config.maxPosts||30,i=d.slice(0,n),l=o("div",{class:"feeder-list"});i.forEach(s=>{l.appendChild(y(s,{fixedHeight:!1}))}),e.appendChild(l)}function N(e,t){const{posts:d,widget:a}=t,n=a.config.maxPosts||30,i=d.slice(0,n),l=o("div",{class:"feeder-masonry"});i.forEach(s=>{l.appendChild(y(s,{fixedHeight:!1}))}),e.appendChild(l)}function q(){const e=document.querySelectorAll("script[src]");for(let t=e.length-1;t>=0;t--){const d=e[t].src;if(d.includes("embed.js"))try{return new URL(d).origin}catch{}}return window.location.origin}async function O(e){const t=e.getAttribute("data-widget");if(!t)return;const d=q(),a=document.createElement("div");a.setAttribute("data-feeder-widget",t),e.parentNode.insertBefore(a,e.nextSibling);const r=a.attachShadow({mode:"open"});let n;try{const s=await fetch(`${d}/api/widget/${t}`);if(!s.ok){r.innerHTML='<p style="color:#ef4444;font-family:sans-serif;font-size:0.875rem;">Failed to load widget</p>';return}n=await s.json()}catch{r.innerHTML='<p style="color:#ef4444;font-family:sans-serif;font-size:0.875rem;">Failed to load widget</p>';return}const i=document.createElement("style");switch(i.textContent=R(n.widget.config),r.appendChild(i),n.widget.layout){case"carousel":D(r,n);break;case"grid":T(r,n);break;case"list":H(r,n);break;case"masonry":N(r,n);break;default:H(r,n)}}function P(){document.querySelectorAll("script[data-widget]").forEach(t=>{t.getAttribute("data-feeder-initialized")||(t.setAttribute("data-feeder-initialized","true"),O(t))})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",P):P()})()})();
