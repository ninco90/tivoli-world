import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import path from 'node:path';
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1512,height:982},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:5173');await page.waitForFunction(()=>window.tivoli,{timeout:60000});await page.waitForTimeout(1400);
assert.equal((await page.evaluate(()=>window.tivoli.info())).plan,true);await page.screenshot({path:'../../work/future.png',fullPage:true});
await page.click('#mode-current');assert.equal((await page.evaluate(()=>window.tivoli.info())).mode,'current');await page.screenshot({path:'../../work/current.png',fullPage:true});
await page.click('#mode-compare');assert.equal(await page.locator('#compare-labels').isVisible(),true);await page.waitForTimeout(500);await page.screenshot({path:'../../work/compare.png',fullPage:true});
await page.click('#btn-top');await page.waitForTimeout(1300);await page.screenshot({path:'../../work/top.png',fullPage:true});
await page.click('#btn-parking');assert.equal(await page.getAttribute('#btn-parking','aria-pressed'),'true');await page.waitForTimeout(1200);await page.screenshot({path:'../../work/parking.png',fullPage:true});await page.click('#btn-parking');
await page.click('#btn-tour');for(let i=0;i<6;i++)await page.click('#tour-next');assert.match(await page.textContent('#tour-progress'),/7 \/ 7/);await page.click('#tour-next');assert.equal(await page.locator('#tour-panel').isVisible(),false);
await page.click('#btn-labels');assert.equal(await page.locator('.map-label:visible').count(),0);await page.click('#btn-labels');await page.click('#btn-night');assert.equal(await page.getAttribute('#btn-night','aria-pressed'),'true');await page.click('#btn-night');
await page.click('#btn-sources');assert.equal(await page.locator('#sources-dialog').isVisible(),true);assert.equal((await page.request.get('http://127.0.0.1:5173/docs/normas-planos.pdf')).status(),200);await page.keyboard.press('Escape');
for(const id of ['park','commercial','hotel','green','parking','limits','utility']){await page.locator(`[data-zone="${id}"]`).click();assert.equal(await page.getAttribute(`[data-zone="${id}"]`,'aria-pressed'),'true');}
await page.click('#mode-future');await page.click('#btn-reset');await page.setViewportSize({width:390,height:844});await page.waitForTimeout(1600);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:'../../work/mobile.png',fullPage:true});
console.log(JSON.stringify({status:'passed',checks:18,errors,info:await page.evaluate(()=>window.tivoli.info())}));assert.deepEqual(errors,[]);await browser.close();
