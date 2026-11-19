// Shared clay material for the three layout studies: one light from the upper left for every object,
// so rims, contact shadows and cast shadows all agree (the first rule of the reference deck).
document.getElementById('defs').insertAdjacentHTML('beforeend', `
  <filter id="clay" x="-40%" y="-40%" width="200%" height="210%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="16" result="sb"/><feOffset in="sb" dx="20" dy="26" result="so"/>
    <feFlood flood-color="#8A5638" flood-opacity=".26"/><feComposite in2="so" operator="in" result="shadow"/>
    <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="cb"/><feOffset in="cb" dx="4" dy="6" result="co"/>
    <feFlood flood-color="#6E3F25" flood-opacity=".22"/><feComposite in2="co" operator="in" result="contact"/>
    <feGaussianBlur in="SourceAlpha" stdDeviation="9" result="rim"/>
    <feOffset in="rim" dx="-9" dy="-11" result="rimTL"/><feComposite in="SourceAlpha" in2="rimTL" operator="out" result="edgeBR"/>
    <feFlood flood-color="#6B3A22" flood-opacity=".3"/><feComposite in2="edgeBR" operator="in" result="shadeBR"/>
    <feOffset in="rim" dx="9" dy="11" result="rimBR"/><feComposite in="SourceAlpha" in2="rimBR" operator="out" result="edgeTL"/>
    <feFlood flood-color="#FFF8EA" flood-opacity=".62"/><feComposite in2="edgeTL" operator="in" result="lightTL"/>
    <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 .32  0 0 0 0 .2  0 0 0 0 .12  0 0 0 .11 0" result="na"/>
    <feComposite in="na" in2="SourceAlpha" operator="in" result="grain"/>
    <feMerge><feMergeNode in="shadow"/><feMergeNode in="contact"/><feMergeNode in="SourceGraphic"/><feMergeNode in="shadeBR"/><feMergeNode in="lightTL"/><feMergeNode in="grain"/></feMerge>
  </filter>
  <filter id="claySm" x="-60%" y="-60%" width="240%" height="250%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="sb"/><feOffset in="sb" dx="9" dy="12" result="so"/>
    <feFlood flood-color="#8A5638" flood-opacity=".24"/><feComposite in2="so" operator="in" result="shadow"/>
    <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="rim"/>
    <feOffset in="rim" dx="-6" dy="-7" result="rimTL"/><feComposite in="SourceAlpha" in2="rimTL" operator="out" result="edgeBR"/>
    <feFlood flood-color="#6B3A22" flood-opacity=".28"/><feComposite in2="edgeBR" operator="in" result="shadeBR"/>
    <feOffset in="rim" dx="6" dy="7" result="rimBR"/><feComposite in="SourceAlpha" in2="rimBR" operator="out" result="edgeTL"/>
    <feFlood flood-color="#FFF8EA" flood-opacity=".6"/><feComposite in2="edgeTL" operator="in" result="lightTL"/>
    <feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/><feMergeNode in="shadeBR"/><feMergeNode in="lightTL"/></feMerge>
  </filter>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
  <filter id="grain" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080">
    <feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="9"/>
    <feColorMatrix type="matrix" values="0 0 0 0 .45  0 0 0 0 .3  0 0 0 0 .2  0 0 0 -1 .55"/>
  </filter>
  <radialGradient id="gTerra" cx="30%" cy="25%" r="85%"><stop offset="0" stop-color="#F2A585"/><stop offset=".55" stop-color="#DB7C5C"/><stop offset="1" stop-color="#C2624A"/></radialGradient>
  <radialGradient id="gCream" cx="30%" cy="25%" r="90%"><stop offset="0" stop-color="#FFFBF1"/><stop offset="1" stop-color="#EFE2C9"/></radialGradient>
  <radialGradient id="gSage" cx="30%" cy="25%" r="90%"><stop offset="0" stop-color="#C6D8B4"/><stop offset="1" stop-color="#93AE83"/></radialGradient>
  <radialGradient id="gButter" cx="30%" cy="25%" r="90%"><stop offset="0" stop-color="#FCE3A1"/><stop offset="1" stop-color="#EEC264"/></radialGradient>
  <radialGradient id="gPeach" cx="30%" cy="25%" r="90%"><stop offset="0" stop-color="#F9CDB3"/><stop offset="1" stop-color="#E9A283"/></radialGradient>
  <radialGradient id="gSkin" cx="32%" cy="28%" r="85%"><stop offset="0" stop-color="#FCE3D0"/><stop offset="1" stop-color="#EDBE9E"/></radialGradient>
  <radialGradient id="gCork" cx="30%" cy="25%" r="95%"><stop offset="0" stop-color="#EBC9A2"/><stop offset="1" stop-color="#D6A97D"/></radialGradient>
  <linearGradient id="gBase" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3E8D4"/><stop offset="1" stop-color="#DCCBAE"/></linearGradient>
  <linearGradient id="gScreen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DCE7CC"/><stop offset="1" stop-color="#C5D6B4"/></linearGradient>
`);
// clay avatar used by the list in A and B: a round token with a person cut from cream
function token(fillId, ink) {
  return `<g filter="url(#claySm)"><circle cx="52" cy="52" r="50" fill="url(#${fillId})"/></g><circle cx="52" cy="40" r="17" fill="${ink}"/><path d="M22 86 q30 -42 60 0 z" fill="${ink}"/>`;
}
