import {english} from './en.mjs';

const valid=value=>value==='ko'||value==='en';
export function resolveLanguage({query,stored,browser}={}) {
 if(valid(query))return query;
 if(valid(stored))return stored;
 return String(browser||'ko').toLowerCase().startsWith('ko')?'ko':'en';
}
function preferredLanguage(){
 if(typeof window==='undefined')return 'ko';
 let stored;try{stored=localStorage.getItem('math-lab-language');}catch{}
 return resolveLanguage({query:new URL(location.href).searchParams.get('lang'),stored,browser:navigator.language});
}
export const language=preferredLanguage();
export function tr(source,values=[]){
 const text=language==='en'?(english[source]??source):source;
 return text.replace(/\{(\d+)\}/g,(_,index)=>String(values[Number(index)]??`{${index}}`));
}
const normalize=text=>text.replace(/\s+/g,' ').trim();
function translateStatic(root){
 if(language!=='en')return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){
  if(node.parentElement?.closest('script,style,[data-language-switch]'))continue;
  const key=normalize(node.nodeValue);
  if(english[key])node.nodeValue=node.nodeValue.match(/^\s*/)[0]+english[key]+node.nodeValue.match(/\s*$/)[0];
 }
 for(const el of root.querySelectorAll('[title],[aria-label],[aria-description],[alt],[placeholder],meta[content],optgroup[label]')){
  if(el.closest('[data-language-switch]'))continue;
  for(const name of ['title','aria-label','aria-description','alt','placeholder','content','label']){
   const value=el.getAttribute(name);if(value&&english[normalize(value)])el.setAttribute(name,english[normalize(value)]);
  }
 }
}
export function restoredExperiment(){
 if(typeof window==='undefined')return null;
 const saved=history.state?.mathLabExperiment;
 return saved?.path===location.pathname?saved.data:null;
}
export function initLanguage({snapshot=()=>null}={}){
 document.documentElement.lang=language;
 translateStatic(document.documentElement);
 const meta=document.querySelector('meta[property="og:locale"]');if(meta)meta.content=language==='en'?'en_US':'ko_KR';
 try{localStorage.setItem('math-lab-language',language);}catch{}
 const controls=document.createElement('div');controls.className='language-switch';controls.dataset.languageSwitch='';
 controls.setAttribute('role','group');controls.setAttribute('aria-label',language==='en'?'Language':'언어 선택');
 for(const [code,label] of [['ko','한국어'],['en','English']]){
  const button=document.createElement('button');button.type='button';button.lang=code;button.textContent=label;
  button.dataset.lang=code;button.setAttribute('aria-pressed',String(language===code));
  button.addEventListener('click',()=>{
   if(code===language)return;
   try{localStorage.setItem('math-lab-language',code);}catch{}
   const url=new URL(location.href);url.searchParams.set('lang',code);
   // Reload the localized text while retaining the current experiment and scroll position.
   history.replaceState({...history.state,mathLabExperiment:{path:location.pathname,data:snapshot()},mathLabDetails:[...document.querySelectorAll('details')].map(el=>el.open),mathLabScroll:scrollY},'',url);
   location.reload();
  });controls.append(button);
 }
 document.querySelector('.lab-header').append(controls);
 // Carry the language in internal links, including when browser storage is unavailable.
 for(const link of document.querySelectorAll('a[href]')){
  const href=link.getAttribute('href');if(href.startsWith('#'))continue;
  const target=new URL(href,location.href);
  if(target.origin!==location.origin||!target.pathname.endsWith('/'))continue;
  target.searchParams.set('lang',language);link.href=target.href;
 }
 const saved=history.state||{};
 if(saved.mathLabDetails)document.querySelectorAll('details').forEach((el,index)=>{if(index<saved.mathLabDetails.length)el.open=saved.mathLabDetails[index];});
 if(saved.mathLabScroll!==undefined)requestAnimationFrame(()=>scrollTo(0,saved.mathLabScroll));
 const {mathLabExperiment,mathLabScroll,mathLabDetails,...rest}=saved;
 history.replaceState(rest,'');
}
