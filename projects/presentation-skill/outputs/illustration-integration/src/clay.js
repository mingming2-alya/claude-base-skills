// Shared clay material for the three layout studies: one light from the upper left for every object,
// so rims, contact shadows and cast shadows all agree (the first rule of the reference deck).
// Dark mode (<html data-light="dark">): the same clay in a room with the blinds down and the main light off.
// Lit sides turn warm (desk lamp), shadow sides cool and deep; the rim light dims to lamp colour.
const CLAY_DARK = document.documentElement.dataset.light === 'dark';
const CK = CLAY_DARK ? {
  shadow: ['#0D0605', .5], contact: ['#080403', .45], shade: ['#120806', .42], rim: ['#FFD6A0', .34], rimSm: ['#FFD6A0', .32],
  g: { gTerra: ['#D18158', '#AA4D29', '#802A1C'], gCream: ['#D7CCBA', '#8E8676'], gSage: ['#A7B084', '#4C6948'], gButter: ['#D7B76C', '#95700C'],
       gPeach: ['#D5A482', '#955943'], gSkin: ['#D6B89C', '#946D56'], gCork: ['#C9A172', '#85603E'], gBase: ['#CEBCA0', '#837864'], gScreen: ['#E9F6EA', '#BFE6D2'] },
} : {
  shadow: ['#8A5638', .26], contact: ['#6E3F25', .22], shade: ['#6B3A22', .3], rim: ['#FFF8EA', .62], rimSm: ['#FFF8EA', .6],
  g: { gTerra: ['#F2A585', '#DB7C5C', '#C2624A'], gCream: ['#FFFBF1', '#EFE2C9'], gSage: ['#C6D8B4', '#93AE83'], gButter: ['#FCE3A1', '#EEC264'],
       gPeach: ['#F9CDB3', '#E9A283'], gSkin: ['#FCE3D0', '#EDBE9E'], gCork: ['#EBC9A2', '#D6A97D'], gBase: ['#F3E8D4', '#DCCBAE'], gScreen: ['#DCE7CC', '#C5D6B4'] },
};
document.getElementById('defs').insertAdjacentHTML('beforeend', `
  <filter id="clay" x="-40%" y="-40%" width="200%" height="210%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="16" result="sb"/><feOffset in="sb" dx="20" dy="26" result="so"/>
    <feFlood flood-color="${CK.shadow[0]}" flood-opacity="${CK.shadow[1]}"/><feComposite in2="so" operator="in" result="shadow"/>
    <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="cb"/><feOffset in="cb" dx="4" dy="6" result="co"/>
    <feFlood flood-color="${CK.contact[0]}" flood-opacity="${CK.contact[1]}"/><feComposite in2="co" operator="in" result="contact"/>
    <feGaussianBlur in="SourceAlpha" stdDeviation="9" result="rim"/>
    <feOffset in="rim" dx="-9" dy="-11" result="rimTL"/><feComposite in="SourceAlpha" in2="rimTL" operator="out" result="edgeBR"/>
    <feFlood flood-color="${CK.shade[0]}" flood-opacity="${CK.shade[1]}"/><feComposite in2="edgeBR" operator="in" result="shadeBR"/>
    <feOffset in="rim" dx="9" dy="11" result="rimBR"/><feComposite in="SourceAlpha" in2="rimBR" operator="out" result="edgeTL"/>
    <feFlood flood-color="${CK.rim[0]}" flood-opacity="${CK.rim[1]}"/><feComposite in2="edgeTL" operator="in" result="lightTL"/>
    <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 .32  0 0 0 0 .2  0 0 0 0 .12  0 0 0 .11 0" result="na"/>
    <feComposite in="na" in2="SourceAlpha" operator="in" result="grain"/>
    <feMerge><feMergeNode in="shadow"/><feMergeNode in="contact"/><feMergeNode in="SourceGraphic"/><feMergeNode in="shadeBR"/><feMergeNode in="lightTL"/><feMergeNode in="grain"/></feMerge>
  </filter>
  <filter id="claySm" x="-60%" y="-60%" width="240%" height="250%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="sb"/><feOffset in="sb" dx="9" dy="12" result="so"/>
    <feFlood flood-color="${CK.shadow[0]}" flood-opacity="${CK.shadow[1] - .02}"/><feComposite in2="so" operator="in" result="shadow"/>
    <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="rim"/>
    <feOffset in="rim" dx="-6" dy="-7" result="rimTL"/><feComposite in="SourceAlpha" in2="rimTL" operator="out" result="edgeBR"/>
    <feFlood flood-color="${CK.shade[0]}" flood-opacity="${CK.shade[1] - .02}"/><feComposite in2="edgeBR" operator="in" result="shadeBR"/>
    <feOffset in="rim" dx="6" dy="7" result="rimBR"/><feComposite in="SourceAlpha" in2="rimBR" operator="out" result="edgeTL"/>
    <feFlood flood-color="${CK.rimSm[0]}" flood-opacity="${CK.rimSm[1]}"/><feComposite in2="edgeTL" operator="in" result="lightTL"/>
    <feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/><feMergeNode in="shadeBR"/><feMergeNode in="lightTL"/></feMerge>
  </filter>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
  <filter id="grain" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080">
    <feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="9"/>
    <feColorMatrix type="matrix" values="0 0 0 0 .45  0 0 0 0 .3  0 0 0 0 .2  0 0 0 -1 .55"/>
  </filter>
  <radialGradient id="gTerra" cx="30%" cy="25%" r="85%"><stop offset="0" stop-color="${CK.g.gTerra[0]}"/><stop offset=".55" stop-color="${CK.g.gTerra[1]}"/><stop offset="1" stop-color="${CK.g.gTerra[2]}"/></radialGradient>
  <radialGradient id="gCream" cx="30%" cy="25%" r="90%"><stop offset="0" stop-color="${CK.g.gCream[0]}"/><stop offset="1" stop-color="${CK.g.gCream[1]}"/></radialGradient>
  <radialGradient id="gSage" cx="30%" cy="25%" r="90%"><stop offset="0" stop-color="${CK.g.gSage[0]}"/><stop offset="1" stop-color="${CK.g.gSage[1]}"/></radialGradient>
  <radialGradient id="gButter" cx="30%" cy="25%" r="90%"><stop offset="0" stop-color="${CK.g.gButter[0]}"/><stop offset="1" stop-color="${CK.g.gButter[1]}"/></radialGradient>
  <radialGradient id="gPeach" cx="30%" cy="25%" r="90%"><stop offset="0" stop-color="${CK.g.gPeach[0]}"/><stop offset="1" stop-color="${CK.g.gPeach[1]}"/></radialGradient>
  <radialGradient id="gSkin" cx="32%" cy="28%" r="85%"><stop offset="0" stop-color="${CK.g.gSkin[0]}"/><stop offset="1" stop-color="${CK.g.gSkin[1]}"/></radialGradient>
  <radialGradient id="gCork" cx="30%" cy="25%" r="95%"><stop offset="0" stop-color="${CK.g.gCork[0]}"/><stop offset="1" stop-color="${CK.g.gCork[1]}"/></radialGradient>
  <linearGradient id="gBase" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${CK.g.gBase[0]}"/><stop offset="1" stop-color="${CK.g.gBase[1]}"/></linearGradient>
  <linearGradient id="gScreen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${CK.g.gScreen[0]}"/><stop offset="1" stop-color="${CK.g.gScreen[1]}"/></linearGradient>
`);
// clay avatar used by the list in A and B: a round token with a person cut from cream
function token(fillId, ink) {
  return `<g filter="url(#claySm)"><circle cx="52" cy="52" r="50" fill="url(#${fillId})"/></g><circle cx="52" cy="40" r="17" fill="${ink}"/><path d="M22 86 q30 -42 60 0 z" fill="${ink}"/>`;
}
