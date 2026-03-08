import logger from "modules/Logger";

export function initializePermutive(apiKey: string, projectId: string): string {
  return `
  !function(e,o,n,i){if(!e){e=e||{},window.permutive=e,e.q=[];var t=function(){return([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,function(e){return(e^(window.crypto||window.msCrypto).getRandomValues(new Uint8Array(1))[0]&15>>e/4).toString(16)})};e.config=i||{},e.config.apiKey=o,e.config.workspaceId=n,e.config.environment=e.config.environment||"production",(window.crypto||window.msCrypto)&&(e.config.viewId=t());for(var g=["addon","identify","track","trigger","query","segment","segments","ready","on","once","user","consent"],r=0;r<g.length;r++){var w=g[r];e[w]=function(o){return function(){var n=Array.prototype.slice.call(arguments,0);e.q.push({functionName:o,arguments:n})}}(w)}}}(window.permutive,"${apiKey}","${projectId}",{});
  window.googletag=window.googletag||{},window.googletag.cmd=window.googletag.cmd||[],window.googletag.cmd.push(function(){if(0===window.googletag.pubads().getTargeting("permutive").length){var e=window.localStorage.getItem("_pdfps");window.googletag.pubads().setTargeting("permutive",e?JSON.parse(e):[]);var o=window.localStorage.getItem("permutive-id");o&&(window.googletag.pubads().setTargeting("puid",o),window.googletag.pubads().setTargeting("ptime",Date.now().toString())),window.permutive.config.viewId&&window.googletag.pubads().setTargeting("prmtvvid",window.permutive.config.viewId),window.permutive.config.workspaceId&&window.googletag.pubads().setTargeting("prmtvwid",window.permutive.config.workspaceId)}});
  permutive.addon('web', {});
  `
}

export function getPermutiveCDN(apiKey: string, projectId: string): string {
  return `https://${apiKey}.edge.permutive.app/${projectId}-web.js`
}

export const getPermutiveHashedId = async () => {
  const permutiveId = localStorage.getItem('permutive-id');

  if (permutiveId) {
    const data = new TextEncoder().encode(permutiveId);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer)); 
    const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
    return hashHex;
  }

  return;
}

export async function getPermutivePixel() {
  const hashedPermutiveId = await getPermutiveHashedId();

  if (hashedPermutiveId) {

    const permutivePixel = document.createElement('img');
    permutivePixel.height = 1;
    permutivePixel.width = 1;
    permutivePixel.src = `https://pixel.tapad.com/idsync/ex/receive?partner_id=3279&partner_device_id=${hashedPermutiveId}`;
    permutivePixel.alt = "permutive-pixel"
    permutivePixel.id = "permutive-pixel"
    permutivePixel.style.display = "none"; 
    
    return permutivePixel;
  }

  return;
  }

export async function identifyPermutive() {
  const permutiveId = localStorage.getItem('permutive-id');

  if (permutiveId) {
    await window.permutive.identify([{
      "id": permutiveId,
      "tag": "dmpBackupId"
    }]);
  }
}

// This function is used to timeout If promise takes forever to resolve
function awaitWithTimeout(timeout: number, ...args: any[]) {
  function timeOut() {
    return new Promise((res, rej) => setTimeout(rej, timeout, new Error(`Timed out after ${timeout}ms`)));
  }
  return Promise.race([...args, timeOut()]);
}

export async function getPermutiveSegments(){
  let permutiveSegments: any[] | undefined;

  try{
    if (window.permutive.segments) {
      await awaitWithTimeout(1000, window.permutive.segments((segments: any[]) => permutiveSegments = segments));
    } 
    return Array.isArray(permutiveSegments) ? permutiveSegments.slice(0,250).join(',') : undefined;
  } catch(e){
    logger.error('PermutiveSegments', e);
    return permutiveSegments;
  }
}

