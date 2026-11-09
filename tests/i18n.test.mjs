import assert from 'node:assert/strict';
import {english} from '../docs/assets/en.mjs';
import {resolveLanguage,tr} from '../docs/assets/i18n.mjs';

assert.equal(resolveLanguage({query:'en',stored:'ko',browser:'ko-KR'}),'en');
assert.equal(resolveLanguage({query:'ko',stored:'en',browser:'en-US'}),'ko');
assert.equal(resolveLanguage({query:'invalid',stored:'ko',browser:'en-US'}),'ko');
assert.equal(resolveLanguage({browser:'ko-KR'}),'ko');
assert.equal(resolveLanguage({browser:'en-US'}),'en');
assert.equal(resolveLanguage({browser:'es-MX'}),'en');
for(const [key,value] of Object.entries(english)){
 assert.ok(value.length,`Empty translation: ${key}`);
 assert.ok(!/[가-힣]/u.test(value),`Untranslated English message: ${key}`);
 assert.deepEqual([...key.matchAll(/\{(\d+)\}/g)].map(x=>x[1]).sort(),[...value.matchAll(/\{(\d+)\}/g)].map(x=>x[1]).sort(),`Placeholder mismatch: ${key}`);
}
assert.equal(tr('한 조각의 넓이 · i = {0}',[3]),'한 조각의 넓이 · i = 3');
assert.equal(english['원점 중심 · 수렴 반지름 R = 1 · 끝점은 따로 확인해.'],'Centered at zero · Radius R = 1 · Check endpoints separately.');
console.log('Language checks passed: URL/storage/browser priority, complete English values and matching interpolation placeholders.');
