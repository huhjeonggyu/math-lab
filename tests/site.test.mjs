import assert from 'node:assert/strict';
import {readdir,readFile,stat} from 'node:fs/promises';
import {resolve,dirname,extname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../docs');
async function walk(dir){let result=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())result.push(...await walk(path));else result.push(path);}return result;}
const files=await walk(root);
for(const path of files){
 if(!['.html','.css','.mjs','.svg'].includes(extname(path)))continue;
 const text=await readFile(path,'utf8');
 assert.ok(!text.includes('chatgpt.site'),`Old hosting link in ${path}`);
 assert.ok(!text.includes('appgprj_'),`Hosting identity in ${path}`);
 const refs=[];
 if(path.endsWith('.html'))for(const match of text.matchAll(/(?:src|href)="([^"]+)"/g))refs.push(match[1]);
 if(path.endsWith('.mjs'))for(const match of text.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g))refs.push(match[1]);
 for(const ref of refs){
  if(/^(https?:|data:|#)/.test(ref))continue;
  assert.ok(!ref.startsWith('/'),`Root-relative link would break project Pages: ${ref}`);
  let target=resolve(dirname(path),ref.split(/[?#]/)[0]);
  assert.ok(target.startsWith(root),`Link escapes docs: ${ref}`);
  if((await stat(target)).isDirectory())target=join(target,'index.html');
  assert.ok((await stat(target)).isFile(),`Missing target ${target}`);
 }
}
assert.ok(files.some(p=>p.endsWith('.nojekyll')));
console.log('Site checks passed: relative links and assets resolve; no legacy hosting IDs or URLs.');
