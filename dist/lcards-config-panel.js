/*! For license information please see lcards-config-panel.js.LICENSE.txt */
(()=>{"use strict";const e=globalThis,t=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),a=new WeakMap;class i{constructor(e,t,a){if(this._$cssResult$=!0,a!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const r=this.t;if(t&&void 0===e){const t=void 0!==r&&1===r.length;t&&(e=a.get(r)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&a.set(r,e))}return e}toString(){return this.cssText}}const s=(e,...t)=>{const a=1===e.length?e[0]:t.reduce((t,r,a)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+e[a+1],e[0]);return new i(a,e,r)},o=(r,a)=>{if(t)r.adoptedStyleSheets=a.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const t of a){const a=document.createElement("style"),i=e.litNonce;void 0!==i&&a.setAttribute("nonce",i),a.textContent=t.cssText,r.appendChild(a)}},l=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const r of e.cssRules)t+=r.cssText;return(e=>new i("string"==typeof e?e:e+"",void 0,r))(t)})(e):e,{is:n,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,g=globalThis,m=g.trustedTypes,b=m?m.emptyScript:"",v=g.reactiveElementPolyfillSupport,f=(e,t)=>e,y={toAttribute(e,t){switch(t){case Boolean:e=e?b:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let r=e;switch(t){case Boolean:r=null!==e;break;case Number:r=null===e?null:Number(e);break;case Object:case Array:try{r=JSON.parse(e)}catch(e){r=null}}return r}},_=(e,t)=>!n(e,t),x={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:_};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;class w extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=x){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const r=Symbol(),a=this.getPropertyDescriptor(e,r,t);void 0!==a&&d(this.prototype,e,a)}}static getPropertyDescriptor(e,t,r){const{get:a,set:i}=c(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:a,set(t){const s=a?.call(this);i?.call(this,t),this.requestUpdate(e,s,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??x}static _$Ei(){if(this.hasOwnProperty(f("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(f("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f("properties"))){const e=this.properties,t=[...h(e),...p(e)];for(const r of t)this.createProperty(r,e[r])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,r]of t)this.elementProperties.set(e,r)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const r=this._$Eu(e,t);void 0!==r&&this._$Eh.set(r,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const r=new Set(e.flat(1/0).reverse());for(const e of r)t.unshift(l(e))}else void 0!==e&&t.push(l(e));return t}static _$Eu(e,t){const r=t.attribute;return!1===r?void 0:"string"==typeof r?r:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const r of t.keys())this.hasOwnProperty(r)&&(e.set(r,this[r]),delete this[r]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return o(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,r){this._$AK(e,r)}_$ET(e,t){const r=this.constructor.elementProperties.get(e),a=this.constructor._$Eu(e,r);if(void 0!==a&&!0===r.reflect){const i=(void 0!==r.converter?.toAttribute?r.converter:y).toAttribute(t,r.type);this._$Em=e,null==i?this.removeAttribute(a):this.setAttribute(a,i),this._$Em=null}}_$AK(e,t){const r=this.constructor,a=r._$Eh.get(e);if(void 0!==a&&this._$Em!==a){const e=r.getPropertyOptions(a),i="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:y;this._$Em=a;const s=i.fromAttribute(t,e.type);this[a]=s??this._$Ej?.get(a)??s,this._$Em=null}}requestUpdate(e,t,r,a=!1,i){if(void 0!==e){const s=this.constructor;if(!1===a&&(i=this[e]),r??=s.getPropertyOptions(e),!((r.hasChanged??_)(i,t)||r.useDefault&&r.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(s._$Eu(e,r))))return;this.C(e,t,r)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:r,reflect:a,wrapped:i},s){r&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,s??t??this[e]),!0!==i||void 0!==s)||(this._$AL.has(e)||(this.hasUpdated||r||(t=void 0),this._$AL.set(e,t)),!0===a&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,r]of e){const{wrapped:e}=r,a=this[t];!0!==e||this._$AL.has(t)||void 0===a||this.C(t,void 0,r,a)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}}w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[f("elementProperties")]=new Map,w[f("finalized")]=new Map,v?.({ReactiveElement:w}),(g.reactiveElementVersions??=[]).push("2.1.2");const $=globalThis,k=e=>e,C=$.trustedTypes,A=C?C.createPolicy("lit-html",{createHTML:e=>e}):void 0,S="$lit$",T=`lit$${Math.random().toFixed(9).slice(2)}$`,M="?"+T,V=`<${M}>`,E=document,H=()=>E.createComment(""),P=e=>null===e||"object"!=typeof e&&"function"!=typeof e,L=Array.isArray,z="[ \t\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,N=/-->/g,O=/>/g,U=RegExp(`>|${z}(?:([^\\s"'>=/]+)(${z}*=${z}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),D=/'/g,F=/"/g,I=/^(?:script|style|textarea|title)$/i,B=e=>(t,...r)=>({_$litType$:e,strings:t,values:r}),j=B(1),q=B(2),W=(B(3),Symbol.for("lit-noChange")),G=Symbol.for("lit-nothing"),Y=new WeakMap,Q=E.createTreeWalker(E,129);function K(e,t){if(!L(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(t):t}const Z=(e,t)=>{const r=e.length-1,a=[];let i,s=2===t?"<svg>":3===t?"<math>":"",o=R;for(let t=0;t<r;t++){const r=e[t];let l,n,d=-1,c=0;for(;c<r.length&&(o.lastIndex=c,n=o.exec(r),null!==n);)c=o.lastIndex,o===R?"!--"===n[1]?o=N:void 0!==n[1]?o=O:void 0!==n[2]?(I.test(n[2])&&(i=RegExp("</"+n[2],"g")),o=U):void 0!==n[3]&&(o=U):o===U?">"===n[0]?(o=i??R,d=-1):void 0===n[1]?d=-2:(d=o.lastIndex-n[2].length,l=n[1],o=void 0===n[3]?U:'"'===n[3]?F:D):o===F||o===D?o=U:o===N||o===O?o=R:(o=U,i=void 0);const h=o===U&&e[t+1].startsWith("/>")?" ":"";s+=o===R?r+V:d>=0?(a.push(l),r.slice(0,d)+S+r.slice(d)+T+h):r+T+(-2===d?t:h)}return[K(e,s+(e[r]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),a]};class J{constructor({strings:e,_$litType$:t},r){let a;this.parts=[];let i=0,s=0;const o=e.length-1,l=this.parts,[n,d]=Z(e,t);if(this.el=J.createElement(n,r),Q.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(a=Q.nextNode())&&l.length<o;){if(1===a.nodeType){if(a.hasAttributes())for(const e of a.getAttributeNames())if(e.endsWith(S)){const t=d[s++],r=a.getAttribute(e).split(T),o=/([.?@])?(.*)/.exec(t);l.push({type:1,index:i,name:o[2],strings:r,ctor:"."===o[1]?ae:"?"===o[1]?ie:"@"===o[1]?se:re}),a.removeAttribute(e)}else e.startsWith(T)&&(l.push({type:6,index:i}),a.removeAttribute(e));if(I.test(a.tagName)){const e=a.textContent.split(T),t=e.length-1;if(t>0){a.textContent=C?C.emptyScript:"";for(let r=0;r<t;r++)a.append(e[r],H()),Q.nextNode(),l.push({type:2,index:++i});a.append(e[t],H())}}}else if(8===a.nodeType)if(a.data===M)l.push({type:2,index:i});else{let e=-1;for(;-1!==(e=a.data.indexOf(T,e+1));)l.push({type:7,index:i}),e+=T.length-1}i++}}static createElement(e,t){const r=E.createElement("template");return r.innerHTML=e,r}}function X(e,t,r=e,a){if(t===W)return t;let i=void 0!==a?r._$Co?.[a]:r._$Cl;const s=P(t)?void 0:t._$litDirective$;return i?.constructor!==s&&(i?._$AO?.(!1),void 0===s?i=void 0:(i=new s(e),i._$AT(e,r,a)),void 0!==a?(r._$Co??=[])[a]=i:r._$Cl=i),void 0!==i&&(t=X(e,i._$AS(e,t.values),i,a)),t}class ee{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:r}=this._$AD,a=(e?.creationScope??E).importNode(t,!0);Q.currentNode=a;let i=Q.nextNode(),s=0,o=0,l=r[0];for(;void 0!==l;){if(s===l.index){let t;2===l.type?t=new te(i,i.nextSibling,this,e):1===l.type?t=new l.ctor(i,l.name,l.strings,this,e):6===l.type&&(t=new oe(i,this,e)),this._$AV.push(t),l=r[++o]}s!==l?.index&&(i=Q.nextNode(),s++)}return Q.currentNode=E,a}p(e){let t=0;for(const r of this._$AV)void 0!==r&&(void 0!==r.strings?(r._$AI(e,r,t),t+=r.strings.length-2):r._$AI(e[t])),t++}}class te{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,r,a){this.type=2,this._$AH=G,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=r,this.options=a,this._$Cv=a?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=X(this,e,t),P(e)?e===G||null==e||""===e?(this._$AH!==G&&this._$AR(),this._$AH=G):e!==this._$AH&&e!==W&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>L(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==G&&P(this._$AH)?this._$AA.nextSibling.data=e:this.T(E.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:r}=e,a="number"==typeof r?this._$AC(e):(void 0===r.el&&(r.el=J.createElement(K(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===a)this._$AH.p(t);else{const e=new ee(a,this),r=e.u(this.options);e.p(t),this.T(r),this._$AH=e}}_$AC(e){let t=Y.get(e.strings);return void 0===t&&Y.set(e.strings,t=new J(e)),t}k(e){L(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let r,a=0;for(const i of e)a===t.length?t.push(r=new te(this.O(H()),this.O(H()),this,this.options)):r=t[a],r._$AI(i),a++;a<t.length&&(this._$AR(r&&r._$AB.nextSibling,a),t.length=a)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class re{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,r,a,i){this.type=1,this._$AH=G,this._$AN=void 0,this.element=e,this.name=t,this._$AM=a,this.options=i,r.length>2||""!==r[0]||""!==r[1]?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=G}_$AI(e,t=this,r,a){const i=this.strings;let s=!1;if(void 0===i)e=X(this,e,t,0),s=!P(e)||e!==this._$AH&&e!==W,s&&(this._$AH=e);else{const a=e;let o,l;for(e=i[0],o=0;o<i.length-1;o++)l=X(this,a[r+o],t,o),l===W&&(l=this._$AH[o]),s||=!P(l)||l!==this._$AH[o],l===G?e=G:e!==G&&(e+=(l??"")+i[o+1]),this._$AH[o]=l}s&&!a&&this.j(e)}j(e){e===G?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ae extends re{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===G?void 0:e}}class ie extends re{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==G)}}class se extends re{constructor(e,t,r,a,i){super(e,t,r,a,i),this.type=5}_$AI(e,t=this){if((e=X(this,e,t,0)??G)===W)return;const r=this._$AH,a=e===G&&r!==G||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,i=e!==G&&(r===G||a);a&&this.element.removeEventListener(this.name,this,r),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class oe{constructor(e,t,r){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(e){X(this,e)}}const le=$.litHtmlPolyfillSupport;le?.(J,te),($.litHtmlVersions??=[]).push("3.3.2");const ne=globalThis;class de extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,r)=>{const a=r?.renderBefore??t;let i=a._$litPart$;if(void 0===i){const e=r?.renderBefore??null;a._$litPart$=i=new te(t.insertBefore(H(),e),e,void 0,r??{})}return i._$AI(e),i})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return W}}de._$litElement$=!0,de.finalized=!0,ne.litElementHydrateSupport?.({LitElement:de});const ce=ne.litElementPolyfillSupport;ce?.({LitElement:de}),(ne.litElementVersions??=[]).push("4.2.2"),JSON.parse('{"rE":"2026.02.01-alpha"}').rE;let he="info";function pe(e){["error","warn","info","debug","trace"].includes(e)||(console.warn("🟡 LCARdS|WARN: Invalid log level:",e,'Using "info" instead'),e="info"),he=e,console.log("🔵 LCARdS|INFO: Setting LCARdS global log level to:",e)}window.lcards=window.lcards||{},window.lcards.setGlobalLogLevel=pe,window.lcards.getGlobalLogLevel=function(){return he},["error","warn","info","debug","trace"].forEach(e=>{window.lcards.setGlobalLogLevel[e]=()=>pe(e)});const ue={info:"background: linear-gradient(45deg, #37a6d1, #4db8e8);",warn:"background: linear-gradient(45deg, #ff6753, #ff8570);",error:"background: linear-gradient(45deg, #ef1d10, #ff453a);",debug:"background: linear-gradient(45deg, #8e44ad, #a569bd);",trace:"background: linear-gradient(45deg, #5a6c7d, #718a9e);"};function ge(e){const t={error:0,warn:1,info:2,debug:3,trace:4};return(t[e]??2)<=(t[he]??2)}function me(e,t,...r){return[`%c LCARdS|${e} `,`${ue[e]} color: white; padding: 2px 6px; border-radius: 15px; font-weight: bold;`,t,...r]}const be=(...e)=>function(e,...t){ge("info")&&console.log(...me("info",e,...t))}(...e),ve=(...e)=>function(e,...t){ge("warn")&&console.warn(...me("warn",e,...t))}(...e),fe=(...e)=>function(e,...t){ge("error")&&console.error(...me("error",e,...t))}(...e),ye=(...e)=>function(e,...t){ge("debug")&&console.debug(...me("debug",e,...t))}(...e),_e=(...e)=>function(e,...t){ge("trace")&&console.debug(...me("trace",e,...t))}(...e);function xe(e,t){if(!e||"object"!=typeof e||!t)return e;const r=Array.isArray(e)?[...e]:{...e};for(const[e,a]of Object.entries(r))if("string"==typeof a){if(a.startsWith("theme:")){const i=a.substring(6),s=t.getToken(i,a);s!==a?(r[e]=xe(s,t),_e(`[resolveThemeTokensRecursive] Resolved theme token: ${a} -> ${r[e]}`)):ve(`[resolveThemeTokensRecursive] Theme token not found: '${a}' - using as literal value`)}else if(a.includes("(")&&/^(alpha|darken|lighten|saturate|desaturate|mix)\(/.test(a))try{const i=t.resolver.resolve(a,a);i!==a&&(r[e]=i,_e(`[resolveThemeTokensRecursive] Resolved computed token: ${a} -> ${i}`))}catch(e){ve(`[resolveThemeTokensRecursive] Failed to resolve computed token: ${a}`,e)}}else a&&"object"==typeof a&&(r[e]=xe(a,t));return r}new Map([["cb-lcars_antonio","lcards_antonio"],["cb-lcars_bajoran_ancient","lcards_bajoran_ancient"],["cb-lcars_bajoran_ideogram","lcards_bajoran_ideogram"],["cb-lcars_binar","lcards_binar"],["cb-lcars_borg","lcards_borg"],["cb-lcars_cardassian","lcards_cardassian"],["cb-lcars_changeling","lcards_changeling"],["cb-lcars_context_ultra_condensed","lcards_context_ultra_condensed"],["cb-lcars_crillee","lcards_crillee"],["cb-lcars_dominion","lcards_dominion"],["cb-lcars_eurostile","lcards_eurostile"],["cb-lcars_eurostile_oblique","lcards_eurostile_oblique"],["cb-lcars_fabrini","lcards_fabrini"],["cb-lcars_federation","lcards_federation"],["cb-lcars_ferengi_left","lcards_ferengi_left"],["cb-lcars_ferengi_right","lcards_ferengi_right"],["cb-lcars_galaxy","lcards_galaxy"],["cb-lcars_handel_gothic","lcards_handel_gothic"],["cb-lcars_jeffries","lcards_jeffries"],["cb-lcars_klingon","lcards_klingon"],["cb-lcars_microgramma","lcards_microgramma"],["cb-lcars_microgramma_regular","lcards_microgramma_regular"],["cb-lcars_millenium_extended_bold","lcards_millenium_extended_bold"],["cb-lcars_romulan","lcards_romulan"],["cb-lcars_sonic","lcards_sonic"],["cb-lcars_sqaure_721","lcards_sqaure_721"],["cb-lcars_stellar","lcards_stellar"],["cb-lcars_swiss_911","lcards_swiss_911"],["cb-lcars_tellarite","lcards_tellarite"],["cb-lcars_tholian","lcards_tholian"],["cb-lcars_trekarrowcaps","lcards_trekarrowcaps"],["cb-lcars_trill","lcards_trill"],["cb-lcars_tungsten","lcards_tungsten"],["cb-lcars_vulcan","lcards_vulcan"]]);class we{static darken(e,t=.2){if(this._isCssVariable(e)){const r=Math.round(100*t);return`color-mix(in srgb, ${e} ${100-r}%, black ${r}%)`}const r=this._parseColor(e);if(!r)return"string"!=typeof e||!e.includes(".")||e.startsWith("#")||e.startsWith("rgb")||ve(`[ColorUtils] darken() received what appears to be an unresolved token: '${e}' - returning unchanged`),e;const a=r.map(e=>Math.max(0,Math.floor(e*(1-t))));return this._rgbToHex(a[0],a[1],a[2])}static lighten(e,t=.2){if(this._isCssVariable(e)){const r=Math.round(100*t);return`color-mix(in srgb, ${e} ${100-r}%, white ${r}%)`}const r=this._parseColor(e);if(!r)return"string"!=typeof e||!e.includes(".")||e.startsWith("#")||e.startsWith("rgb")||ve(`[ColorUtils] lighten() received what appears to be an unresolved token: '${e}' - returning unchanged`),ye("[ColorUtils.lighten] Unable to parse color, returning unchanged:",e),e;const a=r.map(e=>Math.min(255,Math.floor(e+(255-e)*t)));return this._rgbToHex(a[0],a[1],a[2])}static alpha(e,t=1){if(this._isCssVariable(e))return`color-mix(in srgb, ${e} ${Math.round(100*t)}%, transparent)`;const r=this._parseColor(e);return r?`rgba(${r.join(", ")}, ${t})`:("string"!=typeof e||!e.includes(".")||e.startsWith("#")||e.startsWith("rgb")||ve(`[ColorUtils] alpha() received what appears to be an unresolved token: '${e}' - returning unchanged`),e)}static saturate(e,t=.2){if(this._isCssVariable(e))return ve("[ColorUtils] saturate() with CSS variables not yet supported, returning original"),e;const r=this._rgbToHsl(this._parseColor(e));return r?(r[1]=Math.min(100,r[1]+100*t),this._hslToRgbHex(r)):e}static desaturate(e,t=.2){if(this._isCssVariable(e))return ve("[ColorUtils] desaturate() with CSS variables not yet supported, returning original"),e;const r=this._rgbToHsl(this._parseColor(e));return r?(r[1]=Math.max(0,r[1]-100*t),this._hslToRgbHex(r)):e}static mix(e,t,r=.5){if(this._isCssVariable(e)||this._isCssVariable(t)){const a=Math.round(100*r);return`color-mix(in srgb, ${e} ${a}%, ${t} ${100-a}%)`}const a=this._parseColor(e),i=this._parseColor(t);if(!a||!i)return e;const s=a.map((e,t)=>Math.floor(e*r+i[t]*(1-r)));return this._rgbToHex(s[0],s[1],s[2])}static resolveCssVariable(e,t="#000000"){if(Array.isArray(e))return e.map(e=>this.resolveCssVariable(e,t));if(!e||"string"!=typeof e)return e;if(e.includes("var(")){const r=e.match(/var\(([^,)]+)(?:,\s*(.+))?\)/);if(r){const a=r[1].trim(),i=r[2]?.trim();try{const t=getComputedStyle(document.documentElement).getPropertyValue(a).trim();if(t)return _e(`[ColorUtils] ✅ Resolved CSS variable: ${e} → ${t}`),t}catch(e){_e(`[ColorUtils] ⚠️ Error getting computed style for ${a}:`,e.message)}return i?this.resolveCssVariable(i,t):(_e(`[ColorUtils] ⚠️ Using default for ${e}: ${t}`),t)}{const r=e.match(/var\(([^,)]+)/);if(r)try{const e=getComputedStyle(document.documentElement).getPropertyValue(r[1].trim()).trim();if(e)return e}catch(e){}return t}}return e}static parseColor(e){return this._parseColor(e)}static rgbToHex(e,t,r){return this._rgbToHex(e,t,r)}static rgbToHsl(e,t,r){return this._rgbToHsl([e,t,r])}static hslToRgb(e,t,r){return this._hslToRgbHex([e,t,r])}static hsToRgb(e,t,r=255){e/=360,t/=100;const a=r/255;let i,s,o;const l=Math.floor(6*e),n=6*e-l,d=a*(1-t),c=a*(1-n*t),h=a*(1-(1-n)*t);switch(l%6){case 0:i=a,s=h,o=d;break;case 1:i=c,s=a,o=d;break;case 2:i=d,s=a,o=h;break;case 3:i=d,s=c,o=a;break;case 4:i=h,s=d,o=a;break;case 5:i=a,s=d,o=c}return[Math.round(255*i),Math.round(255*s),Math.round(255*o)]}static luminance(e){const t=this._parseColor(e);if(!t)return.5;const[r,a,i]=t.map(e=>(e/=255)<=.03928?e/12.92:Math.pow((e+.055)/1.055,2.4));return.2126*r+.7152*a+.0722*i}static contrastColor(e){return this.luminance(e)>.5?"black":"white"}static _isCssVariable(e){return"string"==typeof e&&e.includes("var(")}static _parseColor(e){if(!e)return null;if((e=e.trim()).startsWith("#")){const t=e.slice(1);if(3===t.length)return[parseInt(t[0]+t[0],16),parseInt(t[1]+t[1],16),parseInt(t[2]+t[2],16)];if(4===t.length)return[parseInt(t[0]+t[0],16),parseInt(t[1]+t[1],16),parseInt(t[2]+t[2],16)];if(6===t.length)return[parseInt(t.slice(0,2),16),parseInt(t.slice(2,4),16),parseInt(t.slice(4,6),16)];if(8===t.length)return[parseInt(t.slice(0,2),16),parseInt(t.slice(2,4),16),parseInt(t.slice(4,6),16)]}const t=e.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);return t?[parseInt(t[1]),parseInt(t[2]),parseInt(t[3])]:null}static _rgbToHex(e,t,r){return"#"+[e,t,r].map(e=>{const t=Math.max(0,Math.min(255,e)).toString(16);return 1===t.length?"0"+t:t}).join("")}static _rgbToHsl(e){if(!e)return null;let[t,r,a]=e;t/=255,r/=255,a/=255;const i=Math.max(t,r,a),s=Math.min(t,r,a);let o,l;const n=(i+s)/2;if(i===s)o=l=0;else{const e=i-s;switch(l=n>.5?e/(2-i-s):e/(i+s),i){case t:o=((r-a)/e+(r<a?6:0))/6;break;case r:o=((a-t)/e+2)/6;break;case a:o=((t-r)/e+4)/6}}return[360*o,100*l,100*n]}static _hslToRgbHex(e){if(!e)return"#000000";let t,r,a,[i,s,o]=e;if(i/=360,s/=100,o/=100,0===s)t=r=a=o;else{const e=(e,t,r)=>(r<0&&(r+=1),r>1&&(r-=1),r<1/6?e+6*(t-e)*r:r<.5?t:r<2/3?e+(t-e)*(2/3-r)*6:e),l=o<.5?o*(1+s):o+s-o*s,n=2*o-l;t=e(n,l,i+1/3),r=e(n,l,i),a=e(n,l,i-1/3)}return this._rgbToHex(Math.round(255*t),Math.round(255*r),Math.round(255*a))}}const $e={green_alert:{hueShift:0,hueStrength:0,saturationMultiplier:1,lightnessMultiplier:1,hueAnchor:null},red_alert:{hueShift:0,hueStrength:.8,saturationMultiplier:1.4,lightnessMultiplier:.9,hueAnchor:{centerHue:0,range:60,strength:.9}},blue_alert:{hueShift:210,hueStrength:.85,saturationMultiplier:1.5,lightnessMultiplier:1,hueAnchor:{centerHue:210,range:60,strength:.9}},yellow_alert:{hueShift:45,hueStrength:.9,saturationMultiplier:1.5,lightnessMultiplier:1.05,hueAnchor:{centerHue:45,range:50,strength:.9}},gray_alert:{hueShift:0,hueStrength:0,saturationMultiplier:0,lightnessMultiplier:1,hueAnchor:null},black_alert:{hueShift:0,hueStrength:0,saturationMultiplier:0,lightnessMultiplier:.3,hueAnchor:null,contrastEnhancement:{enabled:!0,threshold:50,darkMultiplier:.6,lightMultiplier:1.4}}};let ke={};function Ce(e){const t=$e[e],r=ke[e];return t?r?{...t,...r,hueAnchor:r.hueAnchor?{...t.hueAnchor,...r.hueAnchor}:t.hueAnchor,contrastEnhancement:r.contrastEnhancement?{...t.contrastEnhancement,...r.contrastEnhancement}:t.contrastEnhancement}:{...t}:(ve(`[AlertModeTransform] Unknown mode: ${e}`),null)}function Ae(e,t,r){$e[e]?(ke[e]||(ke[e]={}),ke[e][t]=r,ye(`[AlertModeTransform] Set ${e}.${t} = ${JSON.stringify(r)}`)):ve(`[AlertModeTransform] Cannot set param for unknown mode: ${e}`)}function Se(e,t){let r=t-e;return r>180&&(r-=360),r<-180&&(r+=360),r}function Te(e,t){const r=Ce(t);if(!r)return ve(`[AlertModeTransform] Unknown mode: ${t}`),e;if(!e||"transparent"===e||"inherit"===e||"none"===e)return e;let a=null;e.startsWith("#")&&9===e.length&&(a=e.slice(7,9));const i=we.parseColor(e);if(!i)return e;const s=we.rgbToHsl(i[0],i[1],i[2]);if(!s)return e;let[o,l,n]=s;if(r.hueStrength>0&&(o+=Se(o,r.hueShift)*r.hueStrength,o=(o%360+360)%360),r.hueAnchor&&(o=function(e,t){if(!t)return e;const{centerHue:r,range:a,strength:i}=t;if(void 0===r||void 0===a||void 0===i)return e;let s=Se(r,e);return Math.abs(s)>a&&(s+=(Math.sign(s)*a-s)*i),(r+s+360)%360}(o,r.hueAnchor)),l=Math.max(0,Math.min(100,l*r.saturationMultiplier)),n=Math.max(0,Math.min(100,n*r.lightnessMultiplier)),r.contrastEnhancement?.enabled){const{threshold:e,darkMultiplier:t,lightMultiplier:a}=r.contrastEnhancement;n=n<e?Math.max(0,n*t):Math.min(100,n*a)}let d=we.hslToRgb(o,l,n);return a&&(d+=a),d}const Me={green_alert:{"orange-darkest":"#d91604","orange-dark":"#ef1d10","orange-medium-dark":"#e7442a",orange:"#ff6753","orange-medium":"#ff6753","orange-medium-light":"#ff8470","orange-light":"#ff977b","orange-lightest":"#ffb399","gray-darkest":"#1e2229","gray-dark":"#2f3749","gray-medium-dark":"#52596e",gray:"#6d748c","gray-medium":"#6d748c","gray-medium-light":"#9ea5ba","gray-light":"#d2d5df","gray-lightest":"#f3f4f7",moonlight:"#dfe1e8","blue-darkest":"#002241","blue-dark":"#1c3c55","blue-medium-dark":"#2a7193",blue:"#37a6d1","blue-medium":"#37a6d1","blue-medium-light":"#67caf0","blue-light":"#93e1ff","blue-lightest":"#00eeee","green-darkest":"#0c2a15","green-dark":"#083717","green-medium-dark":"#095320",green:"#266239","green-medium":"#266239","green-medium-light":"#458359","green-light":"#80bb93","green-lightest":"#b8e0c1","yellow-darkest":"#70602c","yellow-dark":"#ac943b","yellow-medium-dark":"#d2bf50",yellow:"#f9ef97","yellow-medium":"#f9ef97","yellow-medium-light":"#fffac9","yellow-light":"#e7e6de","yellow-lightest":"#f5f5dc"},red_alert:{"orange-darkest":"#8b0000","orange-dark":"#a52a2a","orange-medium-dark":"#b22222",orange:"#dc143c","orange-medium":"#dc143c","orange-medium-light":"#ff0000","orange-light":"#ff4500","orange-lightest":"#ff6347","gray-darkest":"#8b0000","gray-dark":"#a52a2a","gray-medium-dark":"#b22222",gray:"#dc143c","gray-medium":"#dc143c","gray-medium-light":"#ff0000","gray-light":"#ff4500","gray-lightest":"#ff7f50",moonlight:"#ff6347","blue-darkest":"#cd5c5c","blue-dark":"#f08080","blue-medium-dark":"#e9967a",blue:"#fa8072","blue-medium":"#fa8072","blue-medium-light":"#ffa07a","blue-light":"#ff6347","blue-lightest":"#ff4500","green-darkest":"#dc143c","green-dark":"#b22222","green-medium-dark":"#a52a2a",green:"#8b0000","green-medium":"#8b0000","green-medium-light":"#ff0000","green-light":"#ff4500","green-lightest":"#ff6347","yellow-darkest":"#8b0000","yellow-dark":"#a52a2a","yellow-medium-dark":"#b22222",yellow:"#dc143c","yellow-medium":"#dc143c","yellow-medium-light":"#ff0000","yellow-light":"#ff4500","yellow-lightest":"#ff6347"},blue_alert:{"orange-darkest":"#00008b","orange-dark":"#0000cd","orange-medium-dark":"#4169e1",orange:"#4682b4","orange-medium":"#4682b4","orange-medium-light":"#5f9ea0","orange-light":"#87ceeb","orange-lightest":"#b0e0e6","gray-darkest":"#1c1c3c","gray-dark":"#2a2a5a","gray-medium-dark":"#3a3a7a",gray:"#4a4a9a","gray-medium":"#4a4a9a","gray-medium-light":"#5a5ab4","gray-light":"#6a6ad4","gray-lightest":"#7a7af4",moonlight:"#5a5ab4","blue-darkest":"#00008b","blue-dark":"#0000cd","blue-medium-dark":"#4169e1",blue:"#4682b4","blue-medium":"#4682b4","blue-medium-light":"#5f9ea0","blue-light":"#87ceeb","blue-lightest":"#b0e0e6","green-darkest":"#1c1c3c","green-dark":"#2a2a5a","green-medium-dark":"#3a3a7a",green:"#4a4a9a","green-medium":"#4a4a9a","green-medium-light":"#5a5ab4","green-light":"#6a6ad4","green-lightest":"#7a7af4","yellow-darkest":"#1c1c3c","yellow-dark":"#2a2a5a","yellow-medium-dark":"#3a3a7a",yellow:"#4a4a9a","yellow-medium":"#4a4a9a","yellow-medium-light":"#5a5ab4","yellow-light":"#6a6ad4","yellow-lightest":"#7a7af4"},yellow_alert:{"orange-darkest":"#8b4513","orange-dark":"#d2691e","orange-medium-dark":"#ff8c00",orange:"#ffa500","orange-medium":"#ffa500","orange-medium-light":"#ffb84d","orange-light":"#ffd700","orange-lightest":"#ffec8b","gray-darkest":"#4b4b00","gray-dark":"#6b6b00","gray-medium-dark":"#8b8b00",gray:"#abab00","gray-medium":"#abab00","gray-medium-light":"#cbcb00","gray-light":"#ebeb00","gray-lightest":"#fbfb00",moonlight:"#cbcb00","blue-darkest":"#4b4b00","blue-dark":"#6b6b00","blue-medium-dark":"#8b8b00",blue:"#abab00","blue-medium":"#abab00","blue-medium-light":"#cbcb00","blue-light":"#ebeb00","blue-lightest":"#fbfb00","green-darkest":"#4b4b00","green-dark":"#6b6b00","green-medium-dark":"#8b8b00",green:"#abab00","green-medium":"#abab00","green-medium-light":"#cbcb00","green-light":"#ebeb00","green-lightest":"#fbfb00","yellow-darkest":"#8b4513","yellow-dark":"#d2691e","yellow-medium-dark":"#ff8c00",yellow:"#ffa500","yellow-medium":"#ffa500","yellow-medium-light":"#ffb84d","yellow-light":"#ffd700","yellow-lightest":"#ffec8b"},gray_alert:{"orange-darkest":"#2b2b2b","orange-dark":"#3b3b3b","orange-medium-dark":"#4b4b4b",orange:"#5b5b5b","orange-medium":"#5b5b5b","orange-medium-light":"#6b6b6b","orange-light":"#7b7b7b","orange-lightest":"#8b8b8b","gray-darkest":"#2b2b2b","gray-dark":"#3b3b3b","gray-medium-dark":"#4b4b4b",gray:"#5b5b5b","gray-medium":"#5b5b5b","gray-medium-light":"#6b6b6b","gray-light":"#7b7b7b","gray-lightest":"#8b8b8b",moonlight:"#6b6b6b","blue-darkest":"#2b2b2b","blue-dark":"#3b3b3b","blue-medium-dark":"#4b4b4b",blue:"#5b5b5b","blue-medium":"#5b5b5b","blue-medium-light":"#6b6b6b","blue-light":"#7b7b7b","blue-lightest":"#8b8b8b","green-darkest":"#2b2b2b","green-dark":"#3b3b3b","green-medium-dark":"#4b4b4b",green:"#5b5b5b","green-medium":"#5b5b5b","green-medium-light":"#6b6b6b","green-light":"#7b7b7b","green-lightest":"#8b8b8b","yellow-darkest":"#2b2b2b","yellow-dark":"#3b3b3b","yellow-medium-dark":"#4b4b4b",yellow:"#5b5b5b","yellow-medium":"#5b5b5b","yellow-medium-light":"#6b6b6b","yellow-light":"#7b7b7b","yellow-lightest":"#8b8b8b"},black_alert:{"orange-darkest":"#0d0d0d","orange-dark":"#1a1a1a","orange-medium-dark":"#333333",orange:"#4d4d4d","orange-medium":"#4d4d4d","orange-medium-light":"#666666","orange-light":"#808080","orange-lightest":"#999999","gray-darkest":"#0d0d0d","gray-dark":"#1a1a1a","gray-medium-dark":"#333333",gray:"#4d4d4d","gray-medium":"#4d4d4d","gray-medium-light":"#666666","gray-light":"#808080","gray-lightest":"#999999",moonlight:"#666666","blue-darkest":"#0d0d0d","blue-dark":"#1a1a1a","blue-medium-dark":"#333333",blue:"#4d4d4d","blue-medium":"#4d4d4d","blue-medium-light":"#666666","blue-light":"#808080","blue-lightest":"#999999","green-darkest":"#0d0d0d","green-dark":"#1a1a1a","green-medium-dark":"#333333",green:"#4d4d4d","green-medium":"#4d4d4d","green-medium-light":"#666666","green-light":"#808080","green-lightest":"#999999","yellow-darkest":"#0d0d0d","yellow-dark":"#1a1a1a","yellow-medium-dark":"#333333",yellow:"#4d4d4d","yellow-medium":"#4d4d4d","yellow-medium-light":"#666666","yellow-light":"#808080","yellow-lightest":"#999999"}};let Ve=null;function Ee(e=null){const t=e||document.documentElement,r=getComputedStyle(t),a={};let i=0;for(let e=0;e<r.length;e++){const t=r[e];if(t.startsWith("--lcars-")&&!t.startsWith("--lcards-")){const e=r.getPropertyValue(t).trim();e&&e.match(/^#|^rgb|^hsl/i)&&(a[t]=e,i++)}}const s=["--success-color","--warning-color","--error-color"];for(const e of s){const t=r.getPropertyValue(e).trim();t&&t.match(/^#|^rgb|^hsl/i)&&(a[e]=t,i++)}return Ve=a,ye(`[PaletteInjector] Captured ${i} original color values (--lcars-* + HA state colors)`),a}const He=s`
    :host {
        display: block;
        padding: 0;
        background: var(--card-background-color, #fff);
    }

    .editor-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .tab-bar {
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        margin-bottom: 12px;
    }

    .tab-content {
        padding: 8px 0;
        min-height: 400px;
    }

    /* HA tab group styling */
    ha-tab-group {
        display: block;
        margin-bottom: 0;
        padding: 12px 0;
    }

    ha-tab-panel {
        padding: 0px;
        min-height: 400px;
    }

    /* Expansion panel styling */
    ha-expansion-panel {
        margin-bottom: var(--lcards-section-spacing, 16px);
        border-radius: var(--ha-card-border-radius, 12px);
    }

    ha-expansion-panel[outlined] {
        border: 2px solid var(--divider-color);
    }

    ha-expansion-panel[expanded] {
        background-color: var(--secondary-background-color);
    }

    /* Form field spacing */
    .form-field {
        margin-bottom: var(--lcards-section-spacing, 16px);
    }

    /* Common tab content container (used in Effects tabs, etc.) */
    .tab-content-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    /* Section spacing with CSS variables for density control */
    .section {
        margin-bottom: var(--lcards-section-spacing, 16px);
    }

    .section-header {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 12px;
        color: var(--primary-text-color, #212121);
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        padding-bottom: 8px;
    }

    .section-description {
        font-size: 14px;
        color: var(--secondary-text-color, #727272);
        margin-bottom: 12px;
        line-height: 1.5;
    }

    .form-row {
        margin-bottom: var(--lcards-section-spacing, 16px);
        display: grid;
        grid-template-columns: 100%;
        grid-gap: 8px;
    }

    .form-row.two-controls {
        grid-template-columns: 50% 50%;
    }

    .form-row-group {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: var(--lcards-section-spacing, 16px);
    }

    .form-row label {
        font-weight: 500;
        color: var(--primary-text-color, #212121);
        font-size: 14px;
        display: block;
        padding: 2px 8px;
    }

    .form-control {
        padding: 2px 8px;
        border-radius: 10px;
        box-sizing: border-box;
    }

    .helper-text {
        font-size: 12px;
        color: var(--secondary-text-color, #727272);
        margin-top: 4px;
        line-height: 1.4;
        padding: 0 8px;
    }

    .error-message {
        color: var(--error-color, #f44336);
        background: var(--error-background-color, rgba(244, 67, 54, 0.1));
        padding: 8px 12px;
        border-radius: 4px;
        margin: 8px 0;
        font-size: 14px;
    }

    .error-message ul {
        margin: 8px 0 0 0;
        padding-left: 20px;
    }

    .error-message li {
        margin: 4px 0;
    }

    .warning-message {
        color: var(--warning-color, #ff9800);
        background: var(--warning-background-color, rgba(255, 152, 0, 0.1));
        padding: 8px 12px;
        border-radius: 4px;
        margin: 8px 0;
        font-size: 14px;
    }

    .info-message {
        color: var(--info-color, #2196f3);
        background: var(--info-background-color, rgba(33, 150, 243, 0.1));
        padding: 8px 12px;
        border-radius: 4px;
        margin: 8px 0;
        font-size: 14px;
    }

    /* Info card - standardized launcher card for tabs (Theme Browser, Provenance, Templates) */
    .info-card {
        background: var(--primary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: var(--ha-card-border-radius, 12px);
        padding: 24px;
        margin-bottom: var(--lcards-section-spacing, 16px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .info-card h3 {
        margin: 0 0 12px 0;
        color: var(--primary-text-color);
        font-size: 18px;
        font-weight: 500;
    }

    .info-card p {
        margin: 8px 0;
        color: var(--secondary-text-color);
        line-height: 1.5;
    }

    .info-card code {
        background: var(--secondary-background-color);
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Roboto Mono', monospace;
        font-size: 13px;
    }

    .info-card-content {
        margin-bottom: 16px;
    }

    .info-card-actions {
        display: flex;
        justify-content: flex-end;
        padding-top: 8px;
        border-top: 1px solid var(--divider-color);
        gap: 8px;
    }

    ha-textfield,
    ha-selector,
    ha-entity-picker {
        width: 100%;
    }

    /* Expansion panel styling to match legacy */
    ha-expansion-panel {
        margin-bottom: 10px;
        border-radius: var(--ha-card-border-radius, 24px);
    }

    ha-expansion-panel[outlined] {
        border: 2px solid var(--chip-background-color, #e0e0e0);
    }

    ha-expansion-panel[expanded] {
        background-color: var(--chip-background-color, #f5f5f5);
    }

    /* Icon spacing in headers - increased padding */
    h1 ha-icon,
    h2 ha-icon,
    h3 ha-icon,
    h4 ha-icon,
    h5 ha-icon,
    h6 ha-icon {
        margin-right: var(--lcards-icon-spacing, 12px);
        vertical-align: middle;
    }

    .button-group {
        display: flex;
        gap: 8px;
        margin-top: 16px;
    }

    .button-group mwc-button {
        flex: 1;
    }

    /* Monaco editor container */
    .monaco-container {
        height: 500px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        overflow: hidden;
    }

    /* Horizontal rule styling */
    hr {
        width: 95%;
        border: 1px solid var(--chip-background-color, #e0e0e0);
        margin: 16px auto;
    }

    /* YAML Editor Validation Errors */
    .validation-errors {
        margin-top: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .validation-errors ha-alert {
        margin: 0;
    }

    /* Density Variants */

    /* Nested Section Spacing - tighter spacing for nested sections */
    lcards-form-section lcards-form-section {
        margin-bottom: 8px;
    }

    /* Section Content Variants */
    .section-content.nested {
        padding: 8px;
    }

    .section-content.compact {
        padding: 8px;
    }

    /* Compact Form Field Variant */
    .form-field.compact {
        margin-bottom: 8px;
        gap: 6px;
    }

    /* Form Row Variants */
    .form-row.compact {
        margin-bottom: 8px;
    }

    .form-row.nested {
        margin-bottom: 8px;
    }

    /* Responsive design */
    @media (max-width: 768px) {
        :host {
            padding: 12px;
        }

        .form-row-group,
        .form-row.two-controls {
            grid-template-columns: 1fr;
        }
    }
`;customElements.define("lcards-collapsible-section",class extends de{static get properties(){return{title:{type:String},count:{type:Number},totalCount:{type:Number,attribute:"total-count"},expanded:{type:Boolean},countLabel:{type:String,attribute:"count-label"}}}constructor(){super(),this.title="",this.count=0,this.totalCount=null,this.expanded=!1,this.countLabel="items"}static get styles(){return s`
      :host {
        display: block;
      }

      .section-wrapper {
        margin-bottom: 12px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        overflow: hidden;
        background: var(--card-background-color);
        transition: border 0.2s ease;
      }

      /* Dashed border when collapsed */
      :host(:not([expanded])) .section-wrapper {
        border: 2px dashed var(--divider-color);
      }

      .section-header {
        position: sticky;
        top: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        z-index: 1;
        cursor: pointer;
        user-select: none;
        transition: all 0.2s ease;
      }

      .section-header:hover {
        background: var(--divider-color);
        border-color: var(--primary-color);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .section-header:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .actions-slot {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .section-chevron {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        font-size: 18px;
        color: var(--primary-color);
        transition: transform 0.2s ease;
        flex-shrink: 0;
      }

      :host([expanded]) .section-chevron {
        transform: rotate(90deg);
      }

      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .section-content {
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        transition: max-height 0.3s ease, opacity 0.2s ease;
        border-top: 1px solid transparent;
      }

      :host([expanded]) .section-content {
        max-height: 100000px; /* Large enough for any content */
        opacity: 1;
        border-top-color: var(--divider-color);
      }
    `}render(){return j`
      <div class="section-wrapper">
        <div
          class="section-header"
          @click=${this._toggleExpanded}
          @keydown=${this._handleKeyDown}
          tabindex="0"
          role="button"
          aria-expanded=${this.expanded}
          aria-controls="section-content">
          <div class="header-left">
            <span class="section-chevron" aria-hidden="true">▶</span>
            <span class="section-title">${this.title}</span>
          </div>
          <div class="header-right">
            <div class="actions-slot" @click=${e=>e.stopPropagation()}>
              <slot name="actions"></slot>
            </div>
            <ha-assist-chip
              .label=${null!==this.totalCount?`${this.count} / ${this.totalCount}`:`${this.count} ${this.countLabel}`}
              .filled=${!0}
              style="
                --ha-assist-chip-filled-container-color: ${null!==this.totalCount?this.count===this.totalCount?"var(--success-color)":"var(--warning-color)":"var(--primary-color)"};
                --md-assist-chip-label-text-color: white;
                --md-sys-color-on-surface: white;
              "
            >
            </ha-assist-chip>
          </div>
        </div>
        <div class="section-content" id="section-content" role="region">
          <slot></slot>
        </div>
      </div>
    `}_toggleExpanded(){this.expanded=!this.expanded,this.dispatchEvent(new CustomEvent("toggle",{detail:{expanded:this.expanded},bubbles:!0,composed:!0}))}_handleKeyDown(e){"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._toggleExpanded())}}),customElements.define("lcards-form-section",class extends de{static get properties(){return{header:{type:String},description:{type:String},expanded:{type:Boolean},outlined:{type:Boolean},leftChevron:{type:Boolean},icon:{type:String},headerLevel:{type:Number},secondary:{type:String},noCollapse:{type:Boolean},compact:{type:Boolean},nested:{type:Boolean}}}constructor(){super(),this.header="",this.description="",this.expanded=!1,this.outlined=!0,this.leftChevron=!1,this.icon="",this.headerLevel=4,this.secondary="",this.noCollapse=!1,this.compact=!1,this.nested=!1}static get styles(){return s`
            :host {
                display: block;
                margin-bottom: var(--lcards-section-spacing, 16px);
            }

            ha-expansion-panel {
                border-radius: var(--ha-card-border-radius, 24px);
                --expansion-panel-summary-padding: 0 8px 0 16px;
                background-color: rgba(60, 60, 60, 0.5);
            }

            ha-expansion-panel[outlined] {
                border: 2px solid var(--chip-background-color, #e0e0e0);
            }

            ha-expansion-panel[expanded] {
                background-color: rgba(60, 60, 60, 0.5);
            }

            /* Override focused state background */
            ha-expansion-panel:focus-within,
            ha-expansion-panel.focused {
                background-color: rgba(60, 60, 60, 0.7);
                --input-fill-color: rgba(60, 60, 60, 0.7);
            }

            .section-content {
                padding: 12px; /* Reduced from 16px for denser layout */
            }

            .section-content.compact,
            .section-content.nested {
                padding: 8px; /* Tighter spacing for nested/compact variants */
            }

            .section-description {
                font-size: 14px;
                color: var(--secondary-text-color, #727272);
                margin-bottom: 12px; /* Reduced from 16px for consistency */
                line-height: 1.5;
            }

            ::slotted(*) {
                display: block;
            }

            /* Add spacing between ha-selector elements to prevent cramping when helper text is present */
            ::slotted(ha-selector) {
                margin-bottom: 16px;
            }

            /* Icon spacing in headers */
            h1 ha-icon,
            h2 ha-icon,
            h3 ha-icon,
            h4 ha-icon,
            h5 ha-icon,
            h6 ha-icon {
                margin-right: 8px;
                vertical-align: middle;
            }
        `}render(){const e=["section-content"];return this.compact&&e.push("compact"),this.nested&&e.push("nested"),j`
            <ha-expansion-panel
                .header=${this.header}
                ?expanded=${this.expanded}
                ?outlined=${this.outlined}
                ?leftChevron=${this.leftChevron}
                .noCollapse=${this.noCollapse}
                .secondary=${this.secondary}
                @expanded-changed=${this._handleExpandedChange}>
                ${this.icon||this.secondary?j`
                    <div slot="header">
                        ${this.icon?j`<ha-icon icon="${this.icon}"></ha-icon>`:""}
                        <span>${this.header}</span>
                        ${this.secondary?j`<span slot="secondary">${this.secondary}</span>`:""}
                    </div>
                `:""}
                <div class="${e.join(" ")}">
                    ${this.description?j`
                        <div class="section-description">${this.description}</div>
                    `:""}
                    <slot></slot>
                </div>
            </ha-expansion-panel>
        `}_handleExpandedChange(e){e.stopPropagation(),this.expanded=e.detail.expanded,this.dispatchEvent(new CustomEvent("expanded-changed",{detail:{expanded:this.expanded},bubbles:!1,composed:!1}))}}),customElements.define("lcards-message",class extends de{static get properties(){return{type:{type:String},title:{type:String},message:{type:String}}}constructor(){super(),this.type="info",this.title="",this.message=""}static get styles(){return s`
            :host {
                display: block;
                margin-bottom: 12px;
            }

            .form-control {
                padding: 2px 8px;
            }
        `}render(){return j`
            <div class="form-control">
                <ha-alert alert-type="${this.type}" .title="${this.title||""}">
                    ${this.message}
                    <slot></slot>
                </ha-alert>
            </div>
        `}});class Pe extends de{static properties={originalColors:{type:Array},transformedColors:{type:Array},anchorConfig:{type:Object},hueShift:{type:Number},showLabels:{type:Boolean},showArrows:{type:Boolean},hiddenVariables:{type:Set,state:!0}};constructor(){super(),this.hiddenVariables=new Set}static styles=s`
    :host {
      display: block;
      width: 100%;
    }

    .color-wheel-container {
      width: 100%;
      max-width: 500px;
      margin: 0 auto;
      aspect-ratio: 1;
    }

    svg {
      width: 100%;
      height: 100%;
    }

    .hsl-wheel-segment {
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .hsl-wheel-segment:hover {
      opacity: 1;
      filter: brightness(1.1);
    }

    .anchor-range {
      fill: rgba(255, 255, 255, 0.15);
      stroke: rgba(255, 255, 255, 0.4);
      stroke-width: 2;
      stroke-dasharray: 5, 5;
    }

    .hue-shift-indicator {
      stroke: rgba(255, 255, 255, 0.8);
      stroke-width: 3;
      fill: none;
      marker-end: url(#arrowhead);
    }

    .original-dot {
      stroke: rgba(0, 0, 0, 0.8);
      stroke-width: 1;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .original-dot:hover {
      stroke-width: 2;
      filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5));
      transform-origin: center;
    }

    .transformed-dot {
      stroke: rgba(255, 255, 255, 0.9);
      stroke-width: 1;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .transformed-dot:hover {
      stroke-width: 2;
      filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.8));
    }

    .transform-arrow {
      stroke: rgba(255, 255, 255, 0.5);
      stroke-width: 1.5;
      fill: none;
      marker-end: url(#transform-arrowhead);
    }

    .wheel-label {
      font-size: 8px;
      fill: var(--primary-text-color);
      text-anchor: middle;
      pointer-events: none;
    }

    .legend {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 8px 12px;
      margin-top: 16px;
      font-size: 12px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;
      border: 1px solid transparent;
    }

    .legend-item:hover {
      background: var(--secondary-background-color);
      border-color: var(--divider-color);
    }

    .legend-item.hidden {
      opacity: 0.4;
      text-decoration: line-through;
    }

    .legend-shapes {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .legend-circle {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.8);
      flex-shrink: 0;
    }

    .legend-square {
      width: 8px;
      height: 8px;
      border: 1px solid rgba(255, 255, 255, 0.9);
      flex-shrink: 0;
    }

    .legend-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `;render(){return j`
      <div class="color-wheel-container">
        <svg viewBox="-130 -130 260 260" xmlns="http://www.w3.org/2000/svg">
          <!-- Define arrow markers -->
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="rgba(255, 255, 255, 0.8)" />
            </marker>
            <marker
              id="transform-arrowhead"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="2.5"
              orient="auto">
              <polygon points="0 0, 8 2.5, 0 5" fill="rgba(255, 255, 255, 0.5)" />
            </marker>
          </defs>

          <!-- Background HSL wheel -->
          ${this._renderHSLWheel()}

          <!-- Anchor range (if configured) -->
          ${this.anchorConfig?this._renderAnchorRange():""}

          <!-- Hue shift target indicator -->
          ${null!==this.hueShift&&void 0!==this.hueShift?this._renderHueShiftTarget():""}

          <!-- Transformation arrows -->
          ${this.showArrows?this._renderTransformationArrows():""}

          <!-- Original color positions -->
          ${this._renderOriginalDots()}

          <!-- Transformed color positions -->
          ${this._renderTransformedDots()}

          <!-- Center circle for reference -->
          <circle cx="0" cy="0" r="20" fill="none" stroke="var(--divider-color)" stroke-width="1" />
        </svg>
      </div>

      ${this._renderInteractiveLegend()}
    `}_renderInteractiveLegend(){return this.originalColors&&0!==this.originalColors.length?j`
      <div class="legend">
        ${this.originalColors.map((e,t)=>{const r=this.hiddenVariables.has(e.varName),a=this.transformedColors[t];return j`
            <div
              class="legend-item ${r?"hidden":""}"
              @click="${()=>this._toggleVariable(e.varName)}"
              title="${r?"Click to show":"Click to hide"}"
            >
              <div class="legend-shapes">
                <div class="legend-circle" style="background-color: ${e.color};"></div>
                <div class="legend-square" style="background-color: ${a?.color||e.color};"></div>
              </div>
              <span class="legend-label" title="${e.varName}">${e.name}</span>
            </div>
          `})}
      </div>
    `:j``}_toggleVariable(e){this.hiddenVariables.has(e)?this.hiddenVariables.delete(e):this.hiddenVariables.add(e),this.hiddenVariables=new Set(this.hiddenVariables),this.requestUpdate()}_renderHSLWheel(){return q`
      <g class="hsl-wheel">
        ${Array.from({length:36}).map((e,t)=>{const r=360*t/36,a=360*(t+1)/36,i=(r+a)/2,s=this._hslToRgb(i,70,60);return q`
            <path
              class="hsl-wheel-segment"
              d="${this._createArcPath(25,100,r,a)}"
              fill="${s}"
            />
          `})}
      </g>
    `}_renderAnchorRange(){const{centerHue:e,range:t}=this.anchorConfig,r=(e-t+360)%360,a=(e+t)%360;return q`
      <path
        class="anchor-range"
        d="${this._createArcPath(95,115,r,a)}"
      />
      <text
        x="0"
        y="-110"
        class="wheel-label"
        style="font-weight: 600;">
        Anchor Range
      </text>
    `}_renderHueShiftTarget(){const e=this.hueShift*Math.PI/180,t=105*Math.cos(e-Math.PI/2),r=105*Math.sin(e-Math.PI/2),a=125*Math.cos(e-Math.PI/2),i=125*Math.sin(e-Math.PI/2);return q`
      <line
        class="hue-shift-indicator"
        x1="${t}"
        y1="${r}"
        x2="${a}"
        y2="${i}"
      />
      <text
        x="${1.1*a}"
        y="${1.1*i}"
        class="wheel-label"
        style="font-weight: 600;">
        Target Hue: ${this.hueShift}°
      </text>
    `}_renderTransformationArrows(){return this.originalColors.length!==this.transformedColors.length?"":q`
      <g class="transform-arrows">
        ${this.originalColors.filter(e=>!this.hiddenVariables.has(e.varName)).map((e,t)=>{const r=this.originalColors.indexOf(e),a=this.transformedColors[r],i=this._colorToPosition(e.color),s=this._colorToPosition(a.color);return Math.sqrt(Math.pow(s.x-i.x,2)+Math.pow(s.y-i.y,2))<2?"":q`
              <line
                class="transform-arrow"
                x1="${i.x}"
                y1="${i.y}"
                x2="${s.x}"
                y2="${s.y}"
              />
            `})}
      </g>
    `}_renderOriginalDots(){return q`
      <g class="original-dots">
        ${this.originalColors.filter(e=>!this.hiddenVariables.has(e.varName)).map(e=>{const t=this._colorToPosition(e.color);return q`
              <circle
                class="original-dot"
                cx="${t.x}"
                cy="${t.y}"
                r="5"
                fill="${e.color}"
                stroke="#000000"
                stroke-width="1"
                @mouseenter="${e=>this._handleDotHover(e,!0)}"
                @mouseleave="${e=>this._handleDotHover(e,!1)}"
              >
                <title>Original: ${e.name||e.varName||"Color"}
${e.color}</title>
              </circle>
            `})}
      </g>
    `}_renderTransformedDots(){return q`
      <g class="transformed-dots">
        ${this.transformedColors.filter((e,t)=>!this.hiddenVariables.has(this.originalColors[t]?.varName)).map(e=>{const t=this._colorToPosition(e.color);return q`
              <rect
                class="transformed-dot"
                x="${t.x-4.5}"
                y="${t.y-4.5}"
                width="${9}"
                height="${9}"
                fill="${e.color}"
                stroke="#ffffff"
                stroke-width="1"
                @mouseenter="${e=>this._handleDotHover(e,!0)}"
                @mouseleave="${e=>this._handleDotHover(e,!1)}"
              >
                <title>Transformed: ${e.name||"Color"}
${e.color}</title>
              </rect>
            `})}
      </g>
    `}_handleDotHover(e,t){const r=e.target;if(t){if("circle"===r.tagName)r.setAttribute("r","7");else{const e=parseFloat(r.getAttribute("x")),t=parseFloat(r.getAttribute("y")),a=13,i=(a-parseFloat(r.getAttribute("width")))/2;r.setAttribute("x",e-i),r.setAttribute("y",t-i),r.setAttribute("width",a),r.setAttribute("height",a)}r.setAttribute("stroke-width","2")}else{if("circle"===r.tagName)r.setAttribute("r","5");else{const e=parseFloat(r.getAttribute("x")),t=parseFloat(r.getAttribute("y")),a=9,i=(parseFloat(r.getAttribute("width"))-a)/2;r.setAttribute("x",e+i),r.setAttribute("y",t+i),r.setAttribute("width",a),r.setAttribute("height",a)}r.setAttribute("stroke-width","1")}}_colorToPosition(e){const t=this._parseHSL(e);if(!t)return{x:0,y:0};const{hue:r,saturation:a}=t,i=r*Math.PI/180-Math.PI/2,s=25+a/100*75;return{x:Math.cos(i)*s,y:Math.sin(i)*s}}_createArcPath(e,t,r,a){const i=(r-90)*Math.PI/180,s=(a-90)*Math.PI/180,o=a-r>180?1:0;return`\n      M ${Math.cos(i)*e} ${Math.sin(i)*e}\n      A ${e} ${e} 0 ${o} 1 ${Math.cos(s)*e} ${Math.sin(s)*e}\n      L ${Math.cos(s)*t} ${Math.sin(s)*t}\n      A ${t} ${t} 0 ${o} 0 ${Math.cos(i)*t} ${Math.sin(i)*t}\n      Z\n    `}_parseHSL(e){if(!e)return null;if(e.startsWith("hsl")){const t=e.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);if(t)return{hue:parseInt(t[1]),saturation:parseInt(t[2]),lightness:parseInt(t[3])}}const t=this._parseRGB(e);return t?this._rgbToHsl(t.r,t.g,t.b):null}_parseRGB(e){const t=we.parseColor(e);return t?{r:t[0],g:t[1],b:t[2]}:null}_rgbToHsl(e,t,r){const[a,i,s]=we.rgbToHsl(e,t,r);return{hue:Math.round(a),saturation:Math.round(i),lightness:Math.round(s)}}_hslToRgb(e,t,r){return we.hslToRgb(e,t,r)}}customElements.define("alert-mode-color-wheel",Pe);class Le{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,r){this._$Ct=e,this._$AM=t,this._$Ci=r}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}class ze extends Le{constructor(e){if(super(e),this.it=G,2!==e.type)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===G||null==e)return this._t=void 0,this.it=e;if(e===W)return e;if("string"!=typeof e)throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}}ze.directiveName="unsafeHTML",ze.resultType=1;const Re=(e=>(...t)=>({_$litDirective$:e,values:t}))(ze),Ne=s`
  .theme-preview,
  .preset-preview,
  .animation-preview,
  .svg-preview {
    background: rgba(60,60,60,0.5);
    border: 1px solid var(--divider-color);
    border-radius: var(--ha-card-border-radius, 12px);
    padding: 16px;
    margin: 12px 0;
  }

  .preview-label {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--primary-text-color);
  }

  .preview-note {
    font-size: 13px;
    color: var(--secondary-text-color);
    margin-bottom: 12px;
  }

  .preview-placeholder {
    background: rgba(255,255,255,0.5);
    border: 2px dashed var(--divider-color);
    border-radius: var(--ha-card-border-radius, 12px);
    padding: 24px;
    text-align: center;
    color: var(--secondary-text-color);
    font-style: italic;
  }

  .animation-details {
    font-size: 13px;
    line-height: 1.6;
  }

  .animation-details div {
    margin: 4px 0;
  }

  .animation-details strong {
    color: var(--primary-text-color);
  }
`;customElements.define("lcards-pack-explorer-tab",class extends de{static get properties(){return{hass:{type:Object},_inlineMode:{type:Boolean,state:!0},_selectedNode:{type:Object,state:!0},_expandedNodes:{state:!0,attribute:!1},_treeData:{type:Array,state:!0},_loadingSvg:{type:Boolean,state:!0},_svgContent:{type:String,state:!0}}}constructor(){super(),this._inlineMode=!1,this._selectedNode=null,this._expandedNodes=new Set,this._treeData=[],this._loadingSvg=!1,this._svgContent=null}static get styles(){return[Ne,s`
      :host {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        overflow: hidden;
      }

      /* Studio Layout Container */
      .studio-layout {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background: var(--primary-background-color);
        min-height: 0;
        border-radius: var(--ha-card-border-radius, 12px);
        padding: 16px;
      }

      .content-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }

      .header {
        flex-shrink: 0;
        padding-bottom: 12px;
        border-bottom: 2px solid var(--divider-color);
      }

      .header h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      /* Split pane layout */
      .split-pane-container {
        display: grid;
        grid-template-columns: 35% 65%;
        grid-template-rows: minmax(0, 1fr);
        gap: 12px;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }

      /* Tree pane */
      .tree-pane {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-right: 1px solid var(--divider-color);
        min-height: 0;
      }

      .tree-pane-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 24px;
        border-bottom: 1px solid var(--divider-color);
        background: rgba(60,60,60,0.5);
        flex-shrink: 0;
        border-top-left-radius: var(--ha-card-border-radius, 12px);
      }

      .tree-pane-header span {
        font-weight: 500;
        font-size: 18px;
        color: var(--primary-text-color);
      }

      .tree-container {
        flex: 1;
        overflow-y: auto;
        padding: 12px;
        background: rgba(60,60,60,0.5);
        border-bottom-left-radius: var(--ha-card-border-radius, 12px);
      }

      /* Tree nodes */
      .tree-node {
        margin-left: calc(var(--node-level, 0) * 16px);
        margin-bottom: 4px;
      }

      .tree-node-content {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s;
        user-select: none;
      }

      .tree-node-content:hover {
        background: var(--secondary-background-color);
      }

      .tree-node-content.selected {
        background: var(--primary-color);
        color: var(--text-primary-color, white);
      }

      .tree-expander {
        width: 16px;
        text-align: center;
        font-size: 12px;
        transition: transform 0.2s;
      }

      .tree-expander.leaf {
        opacity: 0;
      }

      .tree-expander.expanded {
        transform: rotate(0deg);
      }

      .node-label {
        flex: 1;
        font-size: 14px;
      }

      /* Detail pane */
      .detail-pane {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-height: 0;
      }

      .detail-pane-content {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding-left: 8px;
      }

      .detail-panel-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--secondary-text-color);
        gap: 12px;
      }

      .detail-panel-empty ha-icon {
        --mdc-icon-size: 64px;
        opacity: 0.3;
      }

      .detail-panel {
        height: 100%;
      }

      .detail-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        margin-bottom: 12px;
      }

      .detail-header h3 {
        margin: 0;
        flex: 1;
        font-size: 18px;
      }

      .detail-type {
        padding: 4px 12px;
        background: var(--primary-color);
        color: var(--text-primary-color, white);
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
      }

      .detail-content {
        padding: 0 16px;
      }

      .detail-section {
        margin-bottom: 8px;
      }

      .detail-section h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .detail-grid {
        display: grid;
        gap: 6px;
      }

      .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 10px;
      }

      .detail-label {
        font-weight: 500;
        color: var(--secondary-text-color);
      }

      .detail-value {
        font-family: 'Courier New', monospace;
        color: var(--primary-text-color);
        text-align: right;
      }

      .empty-state {
        padding: 48px 16px;
        text-align: center;
        color: var(--secondary-text-color);
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
        gap: 8px;
        margin-bottom: 16px;
      }

      .stat-card {
        background: var(--primary-color);
        padding: 10px 8px;
        border-radius: 6px;
        text-align: center;
        color: var(--primary-text-color, white);
        opacity: 0.9;
        transition: opacity 0.15s;
      }

      .stat-card.zero {
        opacity: 0.35;
      }

      .stat-card .stat-icon {
        font-size: 18px;
        line-height: 1;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 22px;
        font-weight: 600;
        line-height: 1;
      }

      .stat-label {
        font-size: 11px;
        color: var(--secondary-text-color);
        margin-top: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .svg-preview-container {
        background: rgba(60,60,60,0.5);
        border-radius: var(--ha-card-border-radius, 12px);
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        max-height: 600px;
        overflow: auto;
      }

      .svg-preview-container svg {
        max-width: 100%;
        max-height: 550px;
        height: auto;
      }

      .preview-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px;
        gap: 12px;
      }

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid var(--divider-color);
        border-top-color: var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .preview-placeholder {
        background: rgba(60,60,60,0.5);
        border: 2px dashed var(--divider-color);
        border-radius: var(--ha-card-border-radius, 12px);
        padding: 24px;
        text-align: center;
      }

      .preview-note {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-top: 8px;
      }

      .load-preview-button {
        padding: 10px 20px;
        background: var(--primary-color);
        color: var(--text-primary-color, white);
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: opacity 0.2s;
      }

      .load-preview-button:hover {
        opacity: 0.9;
      }

      .font-preview-container {
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 24px;
      }

      .font-sample {
        font-size: 16px;
        line-height: 1.8;
        color: var(--primary-text-color);
        margin: 0;
      }

      .audio-preview-container {
        background: rgba(60,60,60,0.5);
        border-radius: var(--ha-card-border-radius, 12px);
        padding: 16px;
        display: flex;
        justify-content: center;
      }

      .audio-preview-container audio {
        width: 100%;
        max-width: 400px;
      }

      .preset-preview-container {
        background: rgba(60,60,60,0.5);
        border: 1px solid var(--divider-color);
        border-radius: var(--ha-card-border-radius, 12px);
        padding: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100px;
      }

      @media (max-width: 768px) {
        .split-pane-container {
          grid-template-columns: 1fr;
          height: auto;
        }

        .tree-pane {
          border-right: none;
          border-bottom: 1px solid var(--divider-color);
          max-height: 300px;
        }

        .detail-pane {
          padding-left: 0;
        }
      }
    `]}connectedCallback(){super.connectedCallback(),this._buildTreeData()}updated(e){super.updated(e),e.has("hass")&&this.hass&&this._buildTreeData()}_buildTreeData(){const e=window.lcards?.core;if(!e)return ve("[PackExplorer] LCARdS core not available"),void(this._treeData=[]);const t=[];(e.packManager?.getLoadedPacks()||[]).forEach(r=>{const a={id:`pack_${r.id}`,type:"pack",label:r.id,icon:"📦",data:r,children:[]};if(r.themeCount>0){const t={id:`${a.id}_themes`,type:"category",label:`🎨 Themes (${r.themeCount})`,icon:"🎨",data:{category:"themes",packId:r.id},children:[]};(e.themeManager?.getThemesByPack(r.id)||[]).forEach(e=>{t.children.push({id:`theme_${e.id}`,type:"theme",label:e.name||e.id,icon:"🎨",data:e})}),a.children.push(t)}if(r.presetCount>0){const t={id:`${a.id}_presets`,type:"category",label:`🎛️ Presets (${r.presetCount})`,icon:"🎛️",data:{category:"presets",packId:r.id},children:[]},i=e.packManager?.getPackMetadata(r.id);i?.presets&&Object.entries(i.presets).forEach(([e,i])=>{const s={id:`${a.id}_presets_${e}`,type:"preset-type",label:`${e} (${i.length})`,icon:"🎛️",data:{presetType:e,packId:r.id},children:[]};i.forEach(t=>{s.children.push({id:`preset_${e}_${t.id}`,type:"preset",label:t.id,icon:"🎛️",data:t})}),t.children.push(s)}),a.children.push(t)}const i=this._getComponentsForPack(r.id);if(i.length>0){const e={id:`${a.id}_components`,type:"category",label:`🧩 Components (${i.length})`,icon:"🧩",data:{category:"components",packId:r.id},children:[]};i.forEach(t=>{const a=t.definition?.presets?Object.keys(t.definition.presets):[],i={id:`component_${t.name}`,type:"component",label:t.name,icon:"🧩",data:t,children:a.map(e=>({id:`component_${t.name}_preset_${e}`,type:"component-preset",label:e,icon:"🎛️",data:{componentName:t.name,presetName:e,preset:t.definition.presets[e],pack:r.id}}))};e.children.push(i)}),a.children.push(e)}const s=(e.animationRegistry?.getAnimationsWithMetadata()||[]).filter(e=>e.pack===r.id);if(s.length>0){const e={id:`${a.id}_animations`,type:"category",label:`🎬 Animations (${s.length})`,icon:"🎬",data:{category:"animations",packId:r.id},children:[]};s.forEach(t=>{e.children.push({id:`animation_${t.id}`,type:"animation",label:t.name,icon:"🎬",data:t})}),a.children.push(e)}const o=this._getAssetsForPack("svg",r.id);if(o.length>0){const e={id:`${a.id}_svg_assets`,type:"category",label:`🖼️ SVG Assets (${o.length})`,icon:"🖼️",data:{category:"svg_assets",packId:r.id},children:[]};o.forEach(t=>{e.children.push({id:`svg_${t.key}`,type:"svg_asset",label:t.key,icon:"🖼️",data:t})}),a.children.push(e)}const l=this._getAssetsForPack("font",r.id);if(l.length>0){const e={id:`${a.id}_font_assets`,type:"category",label:`🔤 Font Assets (${l.length})`,icon:"🔤",data:{category:"font_assets",packId:r.id},children:[]};l.forEach(t=>{e.children.push({id:`font_${t.key}`,type:"font_asset",label:t.key,icon:"🔤",data:t})}),a.children.push(e)}const n=this._getAssetsForPack("audio",r.id);if(n.length>0){const e={id:`${a.id}_audio_assets`,type:"category",label:`🔊 Audio Assets (${n.length})`,icon:"🔊",data:{category:"audio_assets",packId:r.id},children:[]};n.forEach(t=>{e.children.push({id:`audio_${t.key}`,type:"audio_asset",label:t.key,icon:"🔊",data:t})}),a.children.push(e)}t.push(a)}),this._treeData=t,ye("[PackExplorer] Tree data built:",t)}_getAssetCountForPack(e){return this._getAssetsForPack("svg",e).length+this._getAssetsForPack("font",e).length+this._getAssetsForPack("audio",e).length}_getComponentsForPack(e){const t=window.lcards?.core?.componentManager;return t?t.getAllComponentNames().map(e=>({name:e,definition:t.getComponent(e)})).filter(({definition:t})=>(t?.pack||t?.metadata?.pack||"core")===e).map(({name:t,definition:r})=>({name:t,definition:r,pack:e})):[]}_getAssetsForPack(e,t){const r=window.lcards?.core;if(!r?.assetManager)return[];try{const a=r.assetManager.getRegistry(e),i=[];return a.assets.forEach((e,r)=>{(e.metadata?.pack||e.pack)===t&&i.push({key:r,...e.metadata,hasContent:!!e.content,url:e.url})}),i}catch(r){return ve(`[PackExplorer] Failed to get ${e} assets for pack ${t}:`,r),[]}}_handleNodeClick(e){this._selectedNode=e,this._svgContent=null,this._loadingSvg=!1,e.children&&e.children.length>0&&(this._expandedNodes.has(e.id)?this._expandedNodes.delete(e.id):this._expandedNodes.add(e.id),this.requestUpdate())}_renderTreeNode(e,t=0){const r=this._expandedNodes.has(e.id),a=this._selectedNode?.id===e.id,i=e.children&&e.children.length>0;return j`
      <div class="tree-node" style="--node-level: ${t}">
        <div
          class="tree-node-content ${a?"selected":""}"
          @click=${()=>this._handleNodeClick(e)}>
          <span class="tree-expander ${i?r?"expanded":"":"leaf"}">
            ${i?"▶":""}
          </span>
          <span class="node-label">${e.label}</span>
        </div>
      </div>
      ${i&&r?e.children.map(e=>this._renderTreeNode(e,t+1)):""}
    `}_renderTreeNodes(e){return e.map(e=>this._renderTreeNode(e))}_renderDetailPanel(){if(!this._selectedNode)return j`
        <div class="detail-panel-empty">
          <ha-icon icon="mdi:package-variant"></ha-icon>
          <p>Select an item from the tree to view details</p>
        </div>
      `;const e=this._selectedNode;return j`
      <div class="detail-panel">
        <div class="detail-header">
          <h3>${e.label}</h3>
          <span class="detail-type">${e.type}</span>
        </div>
        <div class="detail-content">
          ${this._renderDetailContent(e)}
        </div>
      </div>
    `}_renderDetailContent(e){switch(e.type){case"pack":return this._renderPackDetail(e.data);case"theme":return this._renderThemeDetail(e.data);case"preset":return this._renderPresetDetail(e.data);case"component":return this._renderComponentDetail(e.data);case"component-preset":return this._renderComponentPresetDetail(e.data);case"animation":return this._renderAnimationDetail(e.data);case"svg_asset":return this._renderSvgAssetDetail(e.data);case"font_asset":return this._renderFontAssetDetail(e.data);case"audio_asset":return this._renderAudioAssetDetail(e.data);case"category":return this._renderCategoryDetail(e);default:return j`
          <div class="detail-section">
            <h4>Information</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Type:</span>
                <span class="detail-value">${e.type}</span>
              </div>
            </div>
          </div>
        `}}_renderCategoryDetail(e){const t=e.children?.length||0;return j`
      <div class="detail-section">
        <h4>Category Information</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Category:</span>
            <span class="detail-value">${e.data?.category||"Unknown"}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Items:</span>
            <span class="detail-value">${t}</span>
          </div>
        </div>
      </div>
    `}_renderPackDetail(e){return j`
      <div class="detail-section">
        <h4>Pack Information</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">ID:</span>
            <span class="detail-value">${e.id}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Description:</span>
            <span class="detail-value">${e.description||"No description available"}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Version:</span>
            <span class="detail-value">${e.version||"Unknown"}</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h4>Statistics</h4>
        <div class="stats-grid">
          ${this._renderStatCard("🎨",e.themeCount||0,"Themes")}
          ${this._renderStatCard("🎛️",e.presetCount||0,"Presets")}
          ${this._renderStatCard("🧩",this._getComponentsForPack(e.id).length,"Components")}
          ${this._renderStatCard("📋",e.ruleCount||0,"Rules")}
          ${this._renderStatCard("🎬",this._getAnimationCountForPack(e.id),"Animations")}
          ${this._renderStatCard("🖼️",this._getAssetsForPack("svg",e.id).length,"SVG")}
          ${this._renderStatCard("🔤",this._getAssetsForPack("font",e.id).length,"Fonts")}
          ${this._renderStatCard("🔊",this._getAssetsForPack("audio",e.id).length,"Audio")}
        </div>
      </div>
    `}_renderStatCard(e,t,r){return j`
      <div class="stat-card ${0===t?"zero":""}">
        <div class="stat-icon">${e}</div>
        <div class="stat-value">${t}</div>
        <div class="stat-label">${r}</div>
      </div>
    `}_getAnimationCountForPack(e){return(window.lcards?.core?.animationRegistry?.getAnimationsWithMetadata()||[]).filter(t=>t.pack===e).length}_renderThemeDetail(e){return j`
      <div class="detail-section">
        <h4>Theme Information</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">ID:</span>
            <span class="detail-value">${e.id}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Name:</span>
            <span class="detail-value">${e.name||e.id}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Description:</span>
            <span class="detail-value">${e.description||"No description available"}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Pack:</span>
            <span class="detail-value">${e.pack||"unknown"}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Version:</span>
            <span class="detail-value">${e.version||"Unknown"}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Token Count:</span>
            <span class="detail-value">${e.tokenCount||0}</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h4>Preview</h4>
        ${function(e){return j`
    <div class="theme-preview">
      <div class="preview-label">Theme Preview</div>
      <div class="preview-note">
        Theme contains ${e.tokenCount||0} design tokens.
        ${e.hasCssFile?"Includes custom CSS file.":""}
      </div>
    </div>
  `}(e)}
      </div>
    `}_renderPresetDetail(e){return j`
      <div class="detail-section">
        <h4>Preset Information</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">ID:</span>
            <span class="detail-value">${e.id}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Description:</span>
            <span class="detail-value">${e.description||"No description available"}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Type:</span>
            <span class="detail-value">${e.presetType||e.type}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Pack:</span>
            <span class="detail-value">${e.pack||"unknown"}</span>
          </div>
          ${e.extends?j`
            <div class="detail-item">
              <span class="detail-label">Extends:</span>
              <span class="detail-value">${e.extends}</span>
            </div>
          `:""}
        </div>
      </div>

      <div class="detail-section">
        <h4>Live Preview</h4>
        ${this._renderPresetLivePreview(e)}
      </div>
    `}_renderPresetLivePreview(e){const t=e.presetType||e.type;let r,a;if("button"===t||t?.includes("button"))r="lcards-button",a="light.demo";else{if("slider"!==t&&!t?.includes("slider"))return j`<div class="preview-placeholder">Preview not available for this preset type</div>`;r="lcards-slider",a="sensor.demo"}const i={type:`custom:${r}`,entity:a,preset:e.id,label:{content:"Preview"},show_icon:!0,icon:"light.demo"===a?"mdi:lightbulb":"mdi:thermometer"},s=document.createElement(r);s.hass=this._createMockHass();try{s.setConfig(i)}catch(e){return fe("[PackExplorer] Failed to set config on preview card:",e),j`<div class="preview-placeholder">Error creating preview: ${e.message}</div>`}return j`
      <div class="preset-preview-container">
        ${s}
      </div>
    `}_createMockHass(){return{states:{"sensor.demo":{entity_id:"sensor.demo",state:"42",attributes:{friendly_name:"Demo Sensor",unit_of_measurement:"°C"},last_changed:(new Date).toISOString()},"light.demo":{entity_id:"light.demo",state:"on",attributes:{friendly_name:"Demo Light",brightness:128},last_changed:(new Date).toISOString()}},config:{unit_system:{temperature:"°C"}},language:"en",themes:{default_theme:"default"},selectedTheme:null,user:{name:"Demo User"},callService:()=>Promise.resolve(),callWS:()=>Promise.resolve()}}_renderComponentDetail(e){const t=e.definition||{},r=t.svg?.length||0,a=t.features&&t.features.length>0;return j`
      <div class="detail-section">
        <h4>Component Information</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Name:</span>
            <span class="detail-value">${e.name}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Pack:</span>
            <span class="detail-value">${e.pack||"unknown"}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Orientation:</span>
            <span class="detail-value">${t.orientation||"auto"}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">SVG Size:</span>
            <span class="detail-value">${r} characters</span>
          </div>
          ${a?j`
            <div class="detail-item">
              <span class="detail-label">Features:</span>
              <span class="detail-value">${t.features.join(", ")}</span>
            </div>
          `:""}
        </div>
      </div>

      ${t.svg?j`
        <div class="detail-section">
          <h4>SVG Preview</h4>
          <div class="svg-preview-container">
            ${Re(t.svg)}
          </div>
        </div>
      `:""}
    `}_renderComponentPresetDetail(e){const{componentName:t,presetName:r,preset:a,pack:i}=e,s=a?.segments?Object.keys(a.segments):[],o=a?.text&&Object.keys(a.text).length>0,l=a?.animations&&a.animations.length>0;return j`
      <div class="detail-section">
        <h4>Component Preset</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Preset:</span>
            <span class="detail-value">${r}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Component:</span>
            <span class="detail-value">${t}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Pack:</span>
            <span class="detail-value">${i}</span>
          </div>
          ${s.length?j`
            <div class="detail-item">
              <span class="detail-label">Segments:</span>
              <span class="detail-value">${s.join(", ")}</span>
            </div>
          `:""}
          ${l?j`
            <div class="detail-item">
              <span class="detail-label">Animations:</span>
              <span class="detail-value">${a.animations.map(e=>e.id).join(", ")}</span>
            </div>
          `:""}
          ${o?j`
            <div class="detail-item">
              <span class="detail-label">Text overrides:</span>
              <span class="detail-value">${Object.keys(a.text).join(", ")}</span>
            </div>
          `:""}
        </div>
      </div>

      <div class="detail-section">
        <h4>Usage</h4>
        <div class="code-block">component: ${t}\npreset: ${r}</div>
      </div>
    `}_renderAnimationDetail(e){return j`
      <div class="detail-section">
        <h4>Animation Information</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Name:</span>
            <span class="detail-value">${e.name}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">ID:</span>
            <span class="detail-value">${e.id}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Pack:</span>
            <span class="detail-value">${e.pack||"core"}</span>
          </div>
          ${e.preset?j`
            <div class="detail-item">
              <span class="detail-label">Preset:</span>
              <span class="detail-value">${e.preset}</span>
            </div>
          `:""}
          ${e.duration?j`
            <div class="detail-item">
              <span class="detail-label">Duration:</span>
              <span class="detail-value">${e.duration}ms</span>
            </div>
          `:""}
          ${e.easing?j`
            <div class="detail-item">
              <span class="detail-label">Easing:</span>
              <span class="detail-value">${e.easing}</span>
            </div>
          `:""}
          ${void 0!==e.loop?j`
            <div class="detail-item">
              <span class="detail-label">Loop:</span>
              <span class="detail-value">${e.loop?"Yes":"No"}</span>
            </div>
          `:""}
        </div>
      </div>

      ${e.description?j`
        <div class="detail-section">
          <h4>Description</h4>
          <p>${e.description}</p>
        </div>
      `:""}
    `}_renderSvgAssetDetail(e){return j`
      <div class="detail-section">
        <h4>SVG Asset Information</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Key:</span>
            <span class="detail-value">${e.key}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Loaded:</span>
            <span class="detail-value">${e.hasContent?"Yes":"Not yet"}</span>
          </div>
          ${e.url?j`
            <div class="detail-item">
              <span class="detail-label">URL:</span>
              <span class="detail-value">${e.url}</span>
            </div>
          `:""}
          ${e.ship?j`
            <div class="detail-item">
              <span class="detail-label">Ship:</span>
              <span class="detail-value">${e.ship}</span>
            </div>
          `:""}
          ${e.registry?j`
            <div class="detail-item">
              <span class="detail-label">Registry:</span>
              <span class="detail-value">${e.registry}</span>
            </div>
          `:""}
          ${e.class?j`
            <div class="detail-item">
              <span class="detail-label">Class:</span>
              <span class="detail-value">${e.class}</span>
            </div>
          `:""}
          ${e.era?j`
            <div class="detail-item">
              <span class="detail-label">Era:</span>
              <span class="detail-value">${e.era}</span>
            </div>
          `:""}
          ${e.approximate_size?j`
            <div class="detail-item">
              <span class="detail-label">Size:</span>
              <span class="detail-value">${e.approximate_size}</span>
            </div>
          `:""}
        </div>
      </div>

      ${e.description?j`
        <div class="detail-section">
          <h4>Description</h4>
          <p>${e.description}</p>
        </div>
      `:""}

      <div class="detail-section">
        <h4>Preview</h4>
        ${this._renderSvgPreview(e)}
      </div>

      ${e.author||e.license?j`
        <div class="detail-section">
          <h4>Attribution</h4>
          <div class="detail-grid">
            ${e.author?j`
              <div class="detail-item">
                <span class="detail-label">Author:</span>
                <span class="detail-value">${e.author}</span>
              </div>
            `:""}
            ${e.license?j`
              <div class="detail-item">
                <span class="detail-label">License:</span>
                <span class="detail-value">${e.license}</span>
              </div>
            `:""}
          </div>
        </div>
      `:""}
    `}_renderSvgPreview(e){if(e.hasContent){const t=window.lcards?.core;t?.assetManager&&t.assetManager.get("svg",e.key).then(e=>{e&&e!==this._svgContent&&(this._svgContent=e,this._loadingSvg=!1,this.requestUpdate())}).catch(e=>{fe("[PackExplorer] Failed to load SVG:",e),this._loadingSvg=!1,this.requestUpdate()})}return this._loadingSvg?j`
        <div class="preview-loading">
          <div class="loading-spinner"></div>
          <p>Loading SVG preview...</p>
        </div>
      `:this._svgContent?j`
        <div class="svg-preview-container">
          ${Re(this._svgContent)}
        </div>
      `:e.url?j`
        <div class="preview-placeholder">
          <button class="load-preview-button" @click=${()=>this._loadSvgPreview(e)}>
            Load Preview
          </button>
          <p class="preview-note">Click to load ${e.approximate_size||"SVG"}</p>
        </div>
      `:j`
      <div class="preview-placeholder">
        <p>No preview available</p>
      </div>
    `}async _loadSvgPreview(e){const t=window.lcards?.core;if(t?.assetManager){this._loadingSvg=!0,this._svgContent=null,this.requestUpdate();try{const r=await t.assetManager.get("svg",e.key);this._svgContent=r,this._loadingSvg=!1,this.requestUpdate()}catch(e){fe("[PackExplorer] Failed to load SVG preview:",e),this._loadingSvg=!1,this.requestUpdate()}}}_renderFontAssetDetail(e){return j`
      <div class="detail-section">
        <h4>Font Asset Information</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Key:</span>
            <span class="detail-value">${e.key}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Loaded:</span>
            <span class="detail-value">${e.hasContent?"Yes":"Not yet"}</span>
          </div>
          ${e.url?j`
            <div class="detail-item">
              <span class="detail-label">URL:</span>
              <span class="detail-value">${e.url}</span>
            </div>
          `:""}
          ${e.family?j`
            <div class="detail-item">
              <span class="detail-label">Family:</span>
              <span class="detail-value">${e.family}</span>
            </div>
          `:""}
          ${e.weight?j`
            <div class="detail-item">
              <span class="detail-label">Weight:</span>
              <span class="detail-value">${e.weight}</span>
            </div>
          `:""}
          ${e.style?j`
            <div class="detail-item">
              <span class="detail-label">Style:</span>
              <span class="detail-value">${e.style}</span>
            </div>
          `:""}
        </div>
      </div>

      ${e.family?j`
        <div class="detail-section">
          <h4>Preview</h4>
          <div class="font-preview-container">
            <p class="font-sample" style="font-family: '${e.family}', sans-serif;">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>
              abcdefghijklmnopqrstuvwxyz<br>
              0123456789
            </p>
          </div>
        </div>
      `:""}
    `}_renderAudioAssetDetail(e){return j`
      <div class="detail-section">
        <h4>Audio Asset Information</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Key:</span>
            <span class="detail-value">${e.key}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Loaded:</span>
            <span class="detail-value">${e.hasContent?"Yes":"Not yet"}</span>
          </div>
          ${e.url?j`
            <div class="detail-item">
              <span class="detail-label">URL:</span>
              <span class="detail-value">${e.url}</span>
            </div>
          `:""}
        </div>
      </div>

      ${e.description?j`
        <div class="detail-section">
          <h4>Description</h4>
          <p>${e.description}</p>
        </div>
      `:""}

      ${e.url?j`
        <div class="detail-section">
          <h4>Preview</h4>
          <div class="audio-preview-container">
            <audio controls src="${e.url}">
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      `:""}
    `}render(){return j`
      <div class="studio-layout">
        <div class="content-container">
          ${this._inlineMode?"":j`
            <div class="header">
              <h2>📦 Pack Explorer</h2>
            </div>
          `}

          <div class="split-pane-container">
            <!-- Left Pane: Tree View -->
            <div class="tree-pane">
              <div class="tree-pane-header">
                <span>Packs (${this._treeData.length})</span>
              </div>
              <div class="tree-container">
                ${0===this._treeData.length?j`<p class="empty-state">No packs loaded</p>`:this._renderTreeNodes(this._treeData)}
              </div>
            </div>

            <!-- Right Pane: Detail View -->
            <div class="detail-pane">
              <div class="detail-pane-content">
                ${this._renderDetailPanel()}
              </div>
            </div>
          </div>
        </div>
      </div>
    `}}),customElements.define("lcards-pack-explorer-dialog",class extends de{static get properties(){return{hass:{type:Object},open:{type:Boolean}}}constructor(){super(),this.open=!1}static get styles(){return s`
      :host {
        display: block;
      }

      /* Dialog styles */
      ha-dialog {
        --mdc-dialog-min-width: 90vw;
        --mdc-dialog-max-width: 1400px;
        --mdc-dialog-min-height: 80vh;
        --mdc-dialog-max-height: 80vh;
      }
    `}_handleClose(){this.dispatchEvent(new CustomEvent("closed",{bubbles:!0,composed:!0}))}render(){return this.open?j`
      <ha-dialog
        open
        @closed=${this._handleClose}
        .heading=${"Pack Explorer"}>
        <lcards-pack-explorer-tab
          .hass=${this.hass}
          ._inlineMode=${!0}
        ></lcards-pack-explorer-tab>

        <ha-button
          slot="primaryAction"
          variant="brand"
          appearance="accent"
          @click=${this._handleClose}
          dialogAction="close">
          Close
        </ha-button>
      </ha-dialog>
    `:j``}}),customElements.define("lcards-theme-token-browser-tab",class extends de{static get properties(){return{editor:{type:Object},config:{type:Object},hass:{type:Object},_inlineMode:{type:Boolean},_tokens:{type:Array,state:!0},_filteredTokens:{type:Array,state:!0},_searchQuery:{type:String,state:!0},_selectedCategory:{type:String,state:!0},_isLoading:{type:Boolean,state:!0},_activeTheme:{type:Object,state:!0},_dialogOpen:{type:Boolean,state:!0},_sortColumn:{type:String,state:!0},_sortDirection:{type:String,state:!0},_activeView:{type:String,state:!0},_cssVariables:{type:Array,state:!0},_filteredCssVars:{type:Array,state:!0},_haThemeName:{type:String,state:!0},_allCssVariables:{type:Array,state:!0},_filteredAllVars:{type:Array,state:!0},_selectedAllVarsCategory:{type:String,state:!0},_alertModePreview:{type:Boolean,state:!0},_selectedAlertMode:{type:String,state:!0},_alertLabParams:{type:Object,state:!0},_livePreviewEnabled:{type:Boolean,state:!0},_originalLcarsColors:{type:Object,state:!0},_showFullPreview:{type:Boolean,state:!0},_activeVizTab:{type:String,state:!0},_packExplorerOpen:{type:Boolean,state:!0},_helperSaveMessage:{type:Object,state:!0}}}constructor(){super(),this._tokens=[],this._filteredTokens=[],this._searchQuery="",this._selectedCategory="all",this._isLoading=!1,this._activeTheme=null,this._dialogOpen=!1,this._sortColumn="path",this._sortDirection="asc",this._activeView="alert-lab",this._cssVariables=[],this._filteredCssVars=[],this._haThemeName="Unknown",this._allCssVariables=[],this._filteredAllVars=[],this._selectedAllVarsCategory="all",this._expandedCategories=new Set,this._expandedTokenCategories=new Set,this._alertModePreview=!1,this._selectedAlertMode="red_alert",this._alertLabParams={},this._livePreviewEnabled=!1,this._originalLcarsColors=null,this._showFullPreview=!1,this._activeVizTab="preview",this._packExplorerOpen=!1,this._helperSaveMessage=null,this._handleKeydown=this._handleKeydown.bind(this)}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._handleKeydown,!0),this._inlineMode&&this._initializeInlineMode()}_initializeInlineMode(){ye("[ThemeTokenBrowser] Initializing inline mode"),this._scanCssVariables(),this._scanAllCssVariables(),this._detectHaTheme(),this._applyFilters(),this._originalLcarsColors=Ee(document.documentElement),window.lcards?.getAlertMode&&(this._selectedAlertMode=window.lcards.getAlertMode(),ye("[AlertLab] Initialized with current mode:",this._selectedAlertMode))}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this._handleKeydown,!0)}_handleKeydown(e){if(this._dialogOpen){if((e.ctrlKey||e.metaKey)&&"f"===e.key){e.preventDefault(),e.stopPropagation();const t=this.shadowRoot?.querySelector(".dialog-search");return void(t&&t.focus())}return"Escape"===e.key?(e.preventDefault(),e.stopPropagation(),void this._closeDialog()):void 0}}static get styles(){return[He,s`
        :host {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        /* Studio Layout Container */
        .studio-layout {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--primary-background-color);
          min-height: 0;
          border-radius: var(--ha-card-border-radius, 12px);
          padding: 16px;
        }

        /* Dialog styles */
        ha-dialog {
          --mdc-dialog-min-width: 90vw;
          --mdc-dialog-max-width: 1400px;
          --mdc-dialog-min-height: 80vh;
          --mdc-dialog-max-height: 80vh;
        }

      .dialog-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;

      .tabs-container {
        display: flex;
        overflow-x: auto;
        overflow-y: hidden;
        flex-wrap: nowrap;
        scroll-behavior: smooth;
        scrollbar-width: thin;
        border-bottom: 2px solid var(--divider-color);
        margin-bottom: 0;
      }

      .tabs-container::-webkit-scrollbar {
        height: 4px;
      }

      .tabs-container::-webkit-scrollbar-thumb {
        background: var(--primary-color);
        border-radius: 2px;
      }

      /* HA native tab styling (Issue #82) */
      ha-tab-group {
        display: block;
        margin-bottom: 12px;
        padding: 0;
      }

      .theme-info {
        display: flex;
        gap: 12px;
        padding: 12px 24px;
        border-bottom: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
      }

      .theme-info-badge {
        padding: 8px 16px;
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        font-size: 13px;
        font-weight: 500;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .theme-info-badge strong {
        color: var(--secondary-text-color);
        font-weight: normal;
      }

      .theme-info-badge .theme-name {
        color: var(--primary-color);
        font-weight: 600;
      }

      .search-container {
        padding: 12px 24px;
        border-bottom: 1px solid var(--divider-color);
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .search-wrapper {
        flex: 1;
        position: relative;
        min-width: 400px;
      }

      .dialog-search {
        width: 100%;
      }

      .search-clear {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        --mdc-icon-button-size: 32px;
      }

      .search-result-count {
        color: var(--secondary-text-color);
        font-size: 13px;
        white-space: nowrap;
        padding: 0 8px;
      }

      .category-filters {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        padding: 16px 24px;
        border-bottom: 1px solid var(--divider-color);
      }

      .category-chip {
        appearance: none;
        border: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .category-chip:hover {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .category-chip.selected {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .dialog-body {
        flex: 1;
        overflow: auto;
        padding: 0;
      }

      /* Alert Lab: dialog-body becomes flex container without scroll */
      .dialog-body:has(.alert-lab-container) {
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .css-vars-columns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0;
        height: 100%;
      }

      .css-vars-column {
        overflow: auto;
        border-right: 1px solid var(--divider-color);
      }

      .css-vars-column:last-child {
        border-right: none;
      }

      .css-vars-column h4 {
        position: sticky;
        top: 0;
        background: var(--primary-background-color);
        padding: 16px 24px 8px;
        margin: 0;
        color: var(--primary-text-color);
        border-bottom: 2px solid var(--divider-color);
        z-index: 1;
      }

      .token-table {
        width: 100%;
        border-collapse: collapse;
        background: var(--primary-background-color);
      }

      .token-table thead {
        position: sticky;
        top: 0;
        background: var(--primary-background-color);
        z-index: 1;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .token-table th {
        text-align: left;
        padding: 12px 16px;
        font-weight: 600;
        color: var(--primary-text-color);
        border-bottom: 2px solid var(--divider-color);
        cursor: pointer;
        user-select: none;
      }

      .token-table th:hover {
        background: var(--secondary-background-color);
      }

      .token-table th .sort-indicator {
        margin-left: 4px;
        font-size: 10px;
        color: var(--secondary-text-color);
      }

      .token-table td {
        padding: 12px 16px;
        border-bottom: 1px solid var(--divider-color);
        vertical-align: middle;
      }

      .token-table tbody tr:hover {
        background: var(--secondary-background-color);
      }

      .token-path-cell {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        color: var(--primary-color);
        word-break: break-all;
        max-width: 300px;
      }

      .token-value-cell {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        color: var(--secondary-text-color);
        word-break: break-all;
        max-width: 300px;
      }

      .token-resolution {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .raw-value {
        color: var(--secondary-text-color);
        font-size: 11px;
        opacity: 0.8;
      }

      .resolution-arrow {
        color: var(--primary-color);
        font-size: 10px;
        font-weight: bold;
        padding: 2px 0;
      }

      .resolved-value {
        color: var(--primary-text-color);
        font-weight: 500;
        font-size: 12px;
      }

      .token-preview-cell {
        width: 60px;
        text-align: center;
      }

      .color-preview {
        width: 32px;
        height: 32px;
        border-radius: 4px;
        border: 2px solid var(--divider-color);
        display: inline-block;
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
      }

      /* Alert mode preview swatches */
      .alert-mode-swatches {
        display: flex;
        gap: 3px;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: flex-start;
      }

      .alert-swatch {
        width: 22px;
        height: 22px;
        border-radius: 3px;
        border: 1px solid var(--divider-color);
        cursor: pointer;
        transition: transform 0.1s ease;
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
        position: relative;
        flex-shrink: 0;
      }

      .alert-swatch:hover {
        transform: scale(1.3);
        z-index: 10;
      }

      .alert-swatch.active-mode {
        border: 2px solid var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.3);
      }

      /* Alert mode toggle button in header */
      .alert-mode-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: var(--secondary-background-color);
        border-radius: 8px;
        cursor: pointer;
        user-select: none;
        transition: background 0.2s ease;
      }

      .alert-mode-toggle:hover {
        background: var(--divider-color);
      }

      .alert-mode-toggle.active {
        background: var(--primary-color);
        color: var(--text-primary-color);
      }

      .alert-mode-toggle ha-icon {
        --mdc-icon-size: 20px;
      }

      .alert-mode-toggle-label {
        font-size: 13px;
        font-weight: 500;
      }

      .alert-mode-info {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .hsl-formula-info {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: var(--secondary-background-color);
        border-radius: 6px;
      }

      /* HSL Formula Table */
      .hsl-formula-table {
        margin-top: 12px;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid var(--divider-color);
      }

      .hsl-formula-table table {
        width: 100%;
        border-collapse: collapse;
      }

      .hsl-formula-table th,
      .hsl-formula-table td {
        padding: 8px 12px;
        text-align: left;
        border-bottom: 1px solid var(--divider-color);
        font-size: 13px;
      }

      .hsl-formula-table th {
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .hsl-formula-table td {
        font-family: 'Courier New', monospace;
        color: var(--secondary-text-color);
      }

      .hsl-formula-table tr:last-child td {
        border-bottom: none;
      }

      .hsl-formula-table .mode-name {
        font-weight: 500;
        color: var(--primary-text-color);
        font-family: inherit;
      }

      .hsl-formula-table .mode-icon {
        margin-right: 6px;
      }

      /* Alert mode swatch legend */
      .alert-mode-legend {
        display: flex;
        gap: 3px;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: flex-start;
        margin-top: 2px;
      }

      .alert-legend-label {
        width: 22px;
        height: 12px;
        font-size: 9px;
        text-align: center;
        color: var(--secondary-text-color);
        flex-shrink: 0;
        line-height: 12px;
        font-weight: 600;
        font-size: 12px;
        color: var(--secondary-text-color);
        border: 1px solid var(--divider-color);
      }

      .hsl-formula-info code {
        background: var(--secondary-background-color);
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Roboto Mono', monospace;
        font-size: 11px;
        color: var(--primary-text-color);
      }

      .hsl-formula-info strong {
        color: var(--primary-text-color);
      }

      .token-actions-cell {
        width: 100px;
        text-align: right;
      }

      .token-actions {
        display: flex;
        gap: 4px;
        justify-content: flex-end;
      }

      .token-actions ha-icon-button {
        --mdc-icon-button-size: 36px;
        --mdc-icon-size: 20px;
        color: var(--primary-text-color);
      }

      .token-actions ha-icon-button:hover {
        color: var(--primary-color);
      }

      .text-preview {
        font-family: var(--token-font-family, inherit);
        font-size: var(--token-font-size, 14px);
        font-weight: var(--token-font-weight, normal);
        line-height: 1.5;
        padding: 4px 8px;
        background: var(--secondary-background-color);
        border-radius: 4px;
        display: inline-block;
      }

      .empty-state {
        text-align: center;
        padding: 48px 24px;
        color: var(--secondary-text-color);
      }

      .loading-state {
        text-align: center;
        padding: 48px 24px;
      }

      /* Alert Mode Lab Styles */
      .alert-lab-container {
        padding: 20px;
        display: grid;
        grid-template-columns: 450px 1fr;
        gap: 32px;
        min-height: 0;
        flex: 1;
      }

      @media (max-width: 1200px) {
        .alert-lab-container {
          grid-template-columns: 1fr;
        }
      }

      .alert-lab-left-column {
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-self: start;
        overflow-y: auto;
        overflow-x: hidden;
        max-height: 100%;
      }

      .alert-lab-right-column {
        display: flex;
        flex-direction: column;
        min-height: 0;
        flex: 1;
        overflow: hidden;
      }

      /* Alert Lab: HA native tab styling for visualization tabs (Issue #82) */
      .alert-lab-right-column ha-tab-group {
        display: block;
        margin-bottom: 12px;
        flex-shrink: 0;
      }

      /* Alert Lab: Scrollable visualization content container (like main dialog-body) */
      .alert-lab-viz-content {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 0;
        min-height: 0;
      }

      /* Alert Lab: Scrollable content containers */
      .preview-section,
      .visualization-section,
      .comparison-section {
        padding: 16px;
      }

      .preview-section h4,
      .visualization-section h4 {
        margin-top: 0;
      }

      .alert-lab-header {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-bottom: 16px;
        border-bottom: 2px solid var(--divider-color);
      }

      .mode-selection-controls {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .mode-selector-row {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
      }

      .mode-selector-row label {
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .alert-mode-select {
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        flex: 1;
        cursor: pointer;
      }

      .alert-mode-select:focus {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }

      .live-preview-toggle {
        display: flex;
        align-items: center;
      }

      .live-preview-toggle label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        color: var(--secondary-text-color);
        font-size: 13px;
      }

      .live-preview-toggle input[type="checkbox"] {
        cursor: pointer;
      }

      .parameter-controls {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 12px;
      }

      .slider-control {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px 0;
      }

      .slider-label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .slider-label-row label {
        font-size: 14px;
        color: var(--primary-text-color);
        font-weight: 500;
      }

      .slider-value {
        font-size: 13px;
        color: var(--primary-color);
        font-weight: 600;
        font-family: 'Roboto Mono', monospace;
        min-width: 60px;
        text-align: right;
      }

      .parameter-slider {
        width: 100%;
        height: 6px;
        border-radius: 3px;
        background: var(--divider-color);
        outline: none;
        -webkit-appearance: none;
        appearance: none;
      }

      .parameter-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--primary-color);
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .parameter-slider::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--primary-color);
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .parameter-slider:focus::-webkit-slider-thumb {
        box-shadow: 0 0 0 3px rgba(var(--rgb-primary-color), 0.2);
      }

      .parameter-slider:focus::-moz-range-thumb {
        box-shadow: 0 0 0 3px rgba(var(--rgb-primary-color), 0.2);
      }

      .alert-lab-actions {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }

      .alert-lab-actions ha-button {
        flex: 1;
        min-width: 140px;
      }

      .preview-section {
        background: rgba(60,60,60,0.5);
        border: 1px solid var(--divider-color);
        border-radius: var(--ha-card-border-radius, 12px);
        padding: 20px;
      }

      .preview-section h4 {
        margin: 0 0 8px 0;
        color: var(--primary-text-color);
        font-size: 16px;
        font-weight: 500;
      }

      .preview-hint {
        margin: 0 0 16px 0;
        color: var(--secondary-text-color);
        font-size: 13px;
      }

      .preview-swatches-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .preview-swatch-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .swatch-group-title {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        padding-bottom: 8px;
        border-bottom: 1px solid var(--divider-color);
      }

      .preview-swatches-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }

      .preview-swatch-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .preview-swatch {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        border: 2px solid var(--divider-color);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;
      }

      .preview-swatch:hover {
        transform: scale(1.1);
      }

      .swatch-label {
        font-size: 12px;
        color: var(--secondary-text-color);
        text-align: center;
      }

      /* Color Comparison Grid Styles */
      .comparison-grid-container {
        display: flex;
        flex-direction: column;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        overflow: auto;
      }

      .comparison-grid-header {
        display: grid;
        grid-template-columns: 200px 1fr 1fr;
        gap: 12px;
        padding: 12px 16px;
        border-bottom: 2px solid var(--divider-color);
        font-weight: 600;
        font-size: 13px;
      }

      .comparison-column-label {
        color: var(--primary-text-color);
      }

      .comparison-grid-body {
        display: flex;
        flex-direction: column;
      }

      .comparison-row {
        display: grid;
        grid-template-columns: 200px 1fr 1fr;
        gap: 12px;
        padding: 12px 16px;
        border-bottom: 1px solid var(--divider-color);
        transition: background-color 0.2s;
      }

      .comparison-row:hover {
        background-color: var(--secondary-background-color);
      }

      .comparison-var-name {
        display: flex;
        align-items: center;
      }

      .comparison-var-name code {
        font-size: 11px;
        color: var(--primary-color);
        word-break: break-all;
      }

      .comparison-color-cell {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .comparison-swatch {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        border: 1px solid var(--divider-color);
        flex-shrink: 0;
      }

      .comparison-hex {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-family: monospace;
      }

      .comparison-grid-empty {
        padding: 24px;
        text-align: center;
        color: var(--secondary-text-color);
      }

      /* Color Wheel Visualization Styles */
      .visualization-section {
        padding: 20px;
        border-radius: var(--ha-card-border-radius, 12px);
        background: rgba(60,60,60,0.5);
        border: 1px solid var(--divider-color);
      }

      .visualization-section h4 {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
      }

      .visualization-section .preview-hint {
        margin: 0 0 16px 0;
        font-size: 13px;
        color: var(--secondary-text-color);
      }

      .color-wheel-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32px;
        align-items: start;
      }

      .color-wheel-visual {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .color-wheel-explanation {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .color-wheel-explanation h5 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .color-wheel-explanation h6 {
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .explanation-section {
        padding: 12px 16px;
        background: var(--secondary-background-color);
        border-radius: 4px;
        border-left: 3px solid var(--primary-color);
      }

      .explanation-section p {
        margin: 0;
        font-size: 13px;
        line-height: 1.5;
        color: var(--secondary-text-color);
      }

      .explanation-section ul {
        margin: 8px 0 0 0;
        padding-left: 20px;
        font-size: 13px;
        line-height: 1.6;
      }

      .explanation-section li {
        margin-bottom: 6px;
        color: var(--secondary-text-color);
      }

      .explanation-tip {
        padding: 12px 16px;
        background: rgba(33, 150, 243, 0.1);
        border-radius: 4px;
        border-left: 3px solid var(--info-color, #2196f3);
        font-size: 13px;
        line-height: 1.5;
        color: var(--secondary-text-color);
      }

      /* Responsive: stack on smaller screens */
      @media (max-width: 900px) {
        .color-wheel-layout {
          grid-template-columns: 1fr;
        }
      }
      `]}firstUpdated(){this._loadTokens()}render(){return this._inlineMode?j`
        ${this._renderInlineContent()}
        ${this._renderPackExplorer()}
      `:j`
      ${this._renderTabContent()}
      ${this._renderDialog()}
      ${this._renderPackExplorer()}
    `}_renderInlineContent(){return ye("[ThemeTokenBrowser] Rendering inline content"),j`
      <div class="studio-layout">
        <div class="dialog-content">
          ${this._renderDialogHeader()}
          ${"tokens"===this._activeView?this._renderCategoryFilters():""}
          ${"all-vars"===this._activeView?this._renderAllVarsCategoryFilters():""}
          ${this._renderDialogBody()}
        </div>
      </div>
    `}_renderTabContent(){return this._isLoading?j`
        <div class="loading-state">
          <ha-circular-progress active></ha-circular-progress>
          <p>Loading theme browser...</p>
        </div>
      `:j`
      <div class="tab-content">
        <div class="info-card">
          <div class="info-card-content">
            <h3>Theme Browser</h3>
            <p>
              <strong>${this._activeTheme?.name||"Active Theme"}</strong>
              <br />
              ${this._tokens.length} tokens available
            </p>
            <p style="font-size: 13px; color: var(--secondary-text-color);">
              Browse and copy theme tokens for <strong>style configuration</strong>: <code>theme:token.path</code>
            </p>
          </div>
          <div class="info-card-actions">
            <ha-button
              class="open-browser-button"
              raised
              @click=${this._openDialog}>
              <ha-icon icon="mdi:palette" slot="start"></ha-icon>
              Open Theme Browser
            </ha-button>
            <ha-button
              class="open-pack-explorer-button"
              @click=${this._openPackExplorer}>
              <ha-icon icon="mdi:package-variant" slot="start"></ha-icon>
              Browse All Packs
            </ha-button>
          </div>
        </div>
      </div>
    `}_renderDialog(){return this._dialogOpen?(ye("[ThemeTokenBrowser] Rendering dialog"),j`
      <ha-dialog
        open
        @closed=${this._closeDialog}
        .heading=${this._renderDialogTitle()}>
        ${this._renderInlineContent()}
        <ha-button
          slot="primaryAction"
          variant="brand"
          appearance="accent"
          @click=${this._closeDialog}
          dialogAction="close">
          Close
        </ha-button>
      </ha-dialog>
    `):""}_renderDialogTitle(){return`Theme Browser  •  HA: ${this._haThemeName}  •  LCARdS: ${this._activeTheme?.name||"Unknown"}`}_renderDialogHeader(){return j`
      <div class="dialog-header">
        <!-- Using HA native tab components (Issue #82) -->
        <ha-tab-group @wa-tab-show=${this._handleTabChange}>
          <ha-tab-group-tab value="alert-lab" ?active=${"alert-lab"===this._activeView}>
            Alert Mode Lab
          </ha-tab-group-tab>
          <ha-tab-group-tab value="tokens" ?active=${"tokens"===this._activeView}>
            LCARdS Theme Tokens (${this._tokens.length})
          </ha-tab-group-tab>
          <ha-tab-group-tab value="css-vars" ?active=${"css-vars"===this._activeView}>
            LCARS CSS Variables (${this._cssVariables.length})
          </ha-tab-group-tab>
          <ha-tab-group-tab value="all-vars" ?active=${"all-vars"===this._activeView}>
            All CSS Variables (${this._allCssVariables.length})
          </ha-tab-group-tab>
        </ha-tab-group>
        ${"css-vars"===this._activeView?j`
          <lcards-form-section
            .header=${"Alert Mode Transformation Values"}
            .description=${"HSL transformation parameters for each alert mode"}
            ?expanded=${this._alertModePreviewExpanded}
            @expanded-changed=${this._toggleAlertModePreviewSection}>
            <div class="hsl-formula-table">
              <table>
                <thead>
                  <tr>
                    <th>Mode</th>
                    <th>Hue Shift</th>
                    <th>Hue Strength</th>
                    <th>Saturation ×</th>
                    <th>Lightness ×</th>
                    <th>Additional Settings</th>
                  </tr>
                </thead>
                <tbody>
                  ${this._renderAlertModeConfigRow("green_alert","🟢","Green (Normal)")}
                  ${this._renderAlertModeConfigRow("red_alert","🔴","Red Alert")}
                  ${this._renderAlertModeConfigRow("blue_alert","🔵","Blue Alert")}
                  ${this._renderAlertModeConfigRow("yellow_alert","🟡","Yellow Alert")}
                  ${this._renderAlertModeConfigRow("gray_alert","⚫","Gray Alert")}
                  ${this._renderAlertModeConfigRow("black_alert","⚪","Black Alert")}
                </tbody>
              </table>
            </div>
          </lcards-form-section>
        `:""}
        ${"alert-lab"!==this._activeView?j`
          <div class="search-container">
            <div class="search-wrapper">
              <ha-textfield
                class="dialog-search"
                .value=${this._searchQuery}
                @input=${this._handleSearchInput}
                placeholder="${"tokens"===this._activeView?"Search tokens... (Ctrl+F)":"all-vars"===this._activeView?"Search all variables... (Ctrl+F)":"Search CSS variables... (Ctrl+F)"}"
                .label=${"Search"}>
                <ha-icon slot="leadingIcon" icon="mdi:magnify"></ha-icon>
              </ha-textfield>
              ${this._searchQuery?j`
                <ha-icon-button
                  class="search-clear"
                  @click=${this._clearSearch}
                  .label=${"Clear search"}
                  .path=${"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"}>
                </ha-icon-button>
              `:""}
            </div>
            ${this._renderResultCount()}
          </div>
        `:""}
      </div>
    `}_renderResultCount(){if(!this._searchQuery)return"";let e,t;return"tokens"===this._activeView?(e=this._tokens.length,t=this._filteredTokens.length):"css-vars"===this._activeView?(e=this._cssVariables.length,t=this._filteredCssVars.length):(e=this._allCssVariables.length,t=this._filteredAllVars.length),j`
      <div class="search-result-count">
        Showing ${t} of ${e}
      </div>
    `}_clearSearch(){this._searchQuery="","tokens"===this._activeView?this._applyFilters():"css-vars"===this._activeView?this._applyCssVarFilters():"all-vars"===this._activeView&&this._applyAllVarsFilters();const e=this.shadowRoot?.querySelector(".dialog-search");e&&e.focus()}_renderCategoryFilters(){const e=this._getCategories(),t=[{label:"All",value:"all",count:this._tokens.length},...e];return j`
      <div class="category-filters">
        ${t.map(e=>j`
          <button
            class="category-chip ${this._selectedCategory===e.value?"selected":""}"
            @click=${()=>this._selectCategory(e.value)}>
            ${e.label} (${e.count})
          </button>
        `)}
      </div>
    `}_renderAllVarsCategoryFilters(){const e=this._allCssVariables||[],t={"ha-core":{label:"HA Core",count:0},material:{label:"Material",count:0},"ha-specific":{label:"HA-Specific",count:0},states:{label:"States",count:0},"card-mod":{label:"Card-Mod",count:0},lcars:{label:"LCARS",count:0},lcards:{label:"LCARdS",count:0},app:{label:"App",count:0},other:{label:"Other",count:0}};e.forEach(e=>{t[e.category]&&t[e.category].count++});const r=[{label:"All",value:"all",count:e.length},...Object.entries(t).filter(([e,t])=>t.count>0).map(([e,t])=>({label:t.label,value:e,count:t.count}))];return j`
      <div class="category-filters">
        ${r.map(e=>j`
          <button
            class="category-chip ${this._selectedAllVarsCategory===e.value?"selected":""}"
            @click=${()=>this._selectAllVarsCategory(e.value)}>
            ${e.label} (${e.count})
          </button>
        `)}
      </div>
    `}_renderDialogBody(){if("css-vars"===this._activeView)return this._renderCssVarsView();if("all-vars"===this._activeView)return this._renderAllVarsView();if("alert-lab"===this._activeView)return this._renderAlertLab();try{if(ye("[ThemeTokenBrowser] Rendering dialog body",{filteredTokens:this._filteredTokens?.length}),!this._filteredTokens||0===this._filteredTokens.length)return j`
          <div class="empty-state">
            <ha-icon icon="mdi:${this._searchQuery?"magnify-remove-outline":"palette"}"></ha-icon>
            <p>${this._searchQuery?`No tokens found matching "${this._searchQuery}"`:"No tokens found"}</p>
            <p style="font-size: 13px; color: var(--secondary-text-color); max-width: 400px;">
              ${this._searchQuery?"Try a different search term, or clear the search to see all tokens.":"all"!==this._selectedCategory?'Try selecting a different category or "All" to see more tokens.':"No theme tokens are available in the current theme."}
            </p>
          </div>
        `;const e=this._groupTokensByCategory(this._getSortedTokens());return j`
        <div class="dialog-body">
          ${Object.entries(e).map(([e,t])=>{const r=this._expandedTokenCategories.has(`token-${e}`);return j`
              <lcards-collapsible-section
                .title=${this._formatCategoryName(e)}
                .count=${t.length}
                .countLabel=${"tokens"}
                ?expanded=${r}
                @toggle=${()=>this._toggleTokenCategory(e)}>
                <table class="token-table">
                  <thead>
                    <tr>
                      <th @click=${()=>this._sortBy("path")}>
                        Token Path
                        ${"path"===this._sortColumn?j`<span class="sort-indicator">${"asc"===this._sortDirection?"▲":"▼"}</span>`:""}
                      </th>
                      <th @click=${()=>this._sortBy("value")}>
                        Value
                        ${"value"===this._sortColumn?j`<span class="sort-indicator">${"asc"===this._sortDirection?"▲":"▼"}</span>`:""}
                      </th>
                      <th>Preview</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${t.map(e=>this._renderTokenRow(e))}
                  </tbody>
                </table>
              </lcards-collapsible-section>
            `})}
        </div>
      `}catch(e){return fe("[ThemeTokenBrowser] Error rendering dialog body:",e),j`
        <div class="empty-state">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <p>Error loading tokens</p>
          <p style="font-size: 12px;">Check console for details</p>
        </div>
      `}}_formatTokenValue(e){if(null==e)return"(no value)";if("object"==typeof e){if(Array.isArray(e))return`[Array: ${e.length} items]`;try{const t=JSON.stringify(e,null,2);return t.length<100?t:`{Object: ${Object.keys(e).length} keys}`}catch(e){return"[Complex Object]"}}return String(e)}_renderTokenRow(e){const t=this._formatTokenValue(e.value),r=e.resolvedFrom&&e.resolvedFrom!==e.value,a=this._formatTokenValue(void 0!==e.rawValue?e.rawValue:e.value);return j`
      <tr>
        <td class="token-path-cell">theme:${e.path}</td>
        <td class="token-value-cell">
          ${r?j`
            <div class="token-resolution">
              <div class="raw-value" title="Raw value in theme">
                ${a}
              </div>
              <div class="resolution-arrow">↓ resolves to</div>
              <div class="resolved-value" title="Fully resolved value">
                ${t}
              </div>
            </div>
          `:j`
            <div title="${t}">${t}</div>
          `}
        </td>
        <td class="token-preview-cell">
          ${this._renderTokenPreview(e)}
        </td>
        <td class="token-actions-cell">
          <div class="token-actions">
            <ha-icon-button
              @click=${t=>this._copyTokenSyntax(e.path,t)}
              .label=${"Copy token syntax"}
              .path=${"M8 3C9.66 3 11 4.34 11 6S9.66 9 8 9 5 7.66 5 6 6.34 3 8 3M8 11C10.76 11 16 12.36 16 15V17H0V15C0 12.36 5.24 11 8 11M6 8C6 9.11 6.9 10 8 10 9.11 10 10 9.11 10 8V7H12V8C12 10.21 10.21 12 8 12S4 10.21 4 8V7H6V8M13.54 5.29C13.54 6.31 13.08 7.2 12.38 7.83L13.5 8.95L14.91 7.54C16.18 6.27 16.95 4.55 16.95 2.67V1H15.28V2.67C15.28 4.03 14.77 5.3 13.91 6.24L12.5 7.65C12.13 7.28 11.85 6.82 11.68 6.31L10 6.31C10.15 7.19 10.6 7.97 11.26 8.55L9.85 9.96C9.11 9.32 8.54 8.47 8.22 7.5H6.5C6.82 8.93 7.65 10.2 8.85 11.09L10.26 9.68C9.6 9.09 9.08 8.32 8.75 7.45L10.43 7.45C10.77 8.31 11.37 9.05 12.15 9.55L13.56 8.14C14.63 7.07 15.21 5.63 15.21 4.04V2.37H13.54V4.04C13.54 4.47 13.54 4.88 13.54 5.29Z"}>
            </ha-icon-button>
            <ha-icon-button
              @click=${t=>this._copyValue(e.value,t)}
              .label=${"Copy value"}
              .path=${"M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"}>
            </ha-icon-button>
          </div>
        </td>
      </tr>
    `}_renderTokenPreview(e){try{const t=String(e.finalValue||e.value||"");return"colors"===e.category||this._isColorValue(t)?this._alertModePreviewExpanded?this._renderAlertModeSwatches(t,e.path):j`
          <div
            class="color-preview"
            style="background-color: ${t}; cursor: pointer;"
            title="${t} (click to copy hex value)"
            @click=${e=>this._copyResolvedColor(t,e)}>
          </div>
        `:"fonts"===e.category||"typography"===e.category?this._renderTextPreview(e):j``}catch(e){return ve("[ThemeTokenBrowser] Error rendering preview:",e),j``}}_renderAlertModeSwatches(e,t,r=!1){const a=[{name:"green_alert",label:"Green",icon:"🟢",shortLabel:"GRN"},{name:"red_alert",label:"Red",icon:"🔴",shortLabel:"RED"},{name:"blue_alert",label:"Blue",icon:"🔵",shortLabel:"BLU"},{name:"yellow_alert",label:"Yellow",icon:"🟡",shortLabel:"YEL"},{name:"gray_alert",label:"Gray",icon:"⚫",shortLabel:"GRY"},{name:"black_alert",label:"Black",icon:"⚪",shortLabel:"BLK"}],i=this._getCurrentAlertMode(),s=r?t:`--lcards-${t.split(".").pop()}`,o=this._originalLcarsColors?.[s]||e;return j`
      <div>
        <div class="alert-mode-swatches">
          ${a.map(e=>{const t="green_alert"===e.name?o:this._getAlertModeColor(o,s,e.name),r=e.name===i;return j`
              <div
                class="alert-swatch ${r?"active-mode":""}"
                style="background-color: ${t};"
                title="${e.label}: ${t}"
                @click=${e=>this._copyResolvedColor(t,e)}>
              </div>
            `})}
        </div>
        <div class="alert-mode-legend">
          ${a.map(e=>j`
            <div class="alert-legend-label">${e.shortLabel}</div>
          `)}
        </div>
      </div>
    `}_renderTextPreview(e){try{const t=e.path.toLowerCase(),r=e.value;let a="";if(t.includes("family")&&"string"==typeof r)a=`font-family: ${r};`;else if(t.includes("size")&&"string"==typeof r)a=`font-size: ${r};`;else if(!t.includes("weight")||"string"!=typeof r&&"number"!=typeof r){if(!t.includes("line-height")||"string"!=typeof r)return j``;a=`line-height: ${r};`}else a=`font-weight: ${r};`;return j`
        <div class="text-preview" style="${a}">Aa</div>
      `}catch(e){return ve("[ThemeTokenBrowser] Error rendering text preview:",e),j``}}_renderCssVarsView(){const e=this._filteredCssVars||this._cssVariables||[];if(0===e.length)return j`
        <div class="empty-state">
          <ha-icon icon="mdi:palette-swatch-outline"></ha-icon>
          <p>No CSS variables found</p>
        </div>
      `;const t=e.filter(e=>"lcars"===e.category),r=e.filter(e=>"lcards"===e.category);return j`
      <div class="dialog-body">
        <div class="css-vars-columns">
          <div class="css-vars-column">
            ${t.length>0?j`
              <h4>HA-LCARS Theme (${t.length})</h4>
              <table class="token-table">
                <thead>
                  <tr>
                    <th>Variable Name</th>
                    <th>Value</th>
                    <th>Preview</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${t.map(e=>this._renderCssVarRow(e))}
                </tbody>
              </table>
            `:j`
              <h4>HA-LCARS Theme (0)</h4>
              <div style="padding: 24px; text-align: center; color: var(--secondary-text-color);">
                No HA-LCARS variables found
              </div>
            `}
          </div>

          <div class="css-vars-column">
            ${r.length>0?j`
              <h4>LCARdS Injected (${r.length})</h4>
              <table class="token-table">
                <thead>
                  <tr>
                    <th>Variable Name</th>
                    <th>Value</th>
                    <th>Preview</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${r.map(e=>this._renderCssVarRow(e))}
                </tbody>
              </table>
            `:j`
              <h4>LCARdS Injected (0)</h4>
              <div style="padding: 24px; text-align: center; color: var(--secondary-text-color);">
                No LCARdS variables found
              </div>
            `}
          </div>
        </div>
      </div>
    `}_renderAllVarsView(){const e=this._filteredAllVars||this._allCssVariables||[];if(0===e.length)return j`
        <div class="empty-state">
          <ha-icon icon="mdi:palette-swatch-outline"></ha-icon>
          <p>No CSS variables found</p>
        </div>
      `;const t={"ha-core":{title:"Home Assistant Core Theme",vars:[]},material:{title:"Material Design Components (MDC)",vars:[]},"ha-specific":{title:"HA-Specific Variables",vars:[]},states:{title:"Entity State Colors",vars:[]},"card-mod":{title:"Card-Mod Variables",vars:[]},lcars:{title:"HA-LCARS Theme",vars:[]},lcards:{title:"LCARdS Injected",vars:[]},app:{title:"App-Specific",vars:[]},other:{title:"Other Variables",vars:[]}};e.forEach(e=>{t[e.category]&&t[e.category].vars.push(e)});const r="all"===this._selectedAllVarsCategory?t:{[this._selectedAllVarsCategory]:t[this._selectedAllVarsCategory]};return j`
      <div class="dialog-body">
        ${Object.entries(r).map(([e,t])=>{if(!t||0===t.vars.length)return"";const r=this._expandedCategories.has(e);return j`
            <lcards-collapsible-section
              .title=${t.title}
              .count=${t.vars.length}
              .countLabel=${"variables"}
              ?expanded=${r}
              @toggle=${()=>this._toggleCategory(e)}>
              <table class="token-table">
                <thead>
                  <tr>
                    <th>Variable Name</th>
                    <th>Value</th>
                    <th>Preview</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${t.vars.map(e=>this._renderCssVarRow(e))}
                </tbody>
              </table>
            </lcards-collapsible-section>
          `})}
      </div>
    `}_toggleCategory(e){this._expandedCategories.has(e)?this._expandedCategories.delete(e):this._expandedCategories.add(e),this.requestUpdate()}_toggleTokenCategory(e){const t=`token-${e}`;this._expandedTokenCategories.has(t)?this._expandedTokenCategories.delete(t):this._expandedTokenCategories.add(t),this.requestUpdate()}_renderCssVarRow(e){return j`
      <tr>
        <td class="token-path-cell">
          <code>${e.name}</code>
        </td>
        <td class="token-value-cell">
          <div title="${e.value}">${e.value}</div>
        </td>
        <td class="token-preview-cell">
          ${e.isColor?this._alertModePreviewExpanded?this._renderAlertModeSwatches(e.value,e.name,!0):j`
                <div
                  class="color-preview"
                  style="background-color: var(${e.name});"
                  title="Live preview of ${e.name}">
                </div>
              `:""}
        </td>
        <td class="token-actions-cell">
          <div class="token-actions">
            <ha-icon-button
              @click=${t=>this._copyCssVar(e.name,t)}
              .label=${"Copy CSS variable syntax"}
              title="Copy var(${e.name})"
              .path=${"M12,2A2,2 0 0,1 14,4V8H20A2,2 0 0,1 22,10V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V10A2,2 0 0,1 4,10H10V4A2,2 0 0,1 12,2M12,4V8H14V4H12M4,10V20H20V10H4M7,12H9V18H7V12M11,12H13V18H11V12M15,12H17V18H15V12Z"}>
            </ha-icon-button>
            <ha-icon-button
              @click=${t=>this._copyValue(e.value,t)}
              .label=${"Copy value"}
              .path=${"M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"}>
            </ha-icon-button>
          </div>
        </td>
      </tr>
    `}_renderAlertLab(){const e=Ce(this._selectedAlertMode);return j`
      <div class="alert-lab-container">
        <!-- LEFT COLUMN: Controls -->
        <div class="alert-lab-left-column">
          <!-- Mode Selection Section -->
          <lcards-form-section
            .header=${"Alert Mode Selection"}
            .description=${"Choose mode and control settings"}
            ?expanded=${!0}
            .collapsible=${!1}
          >
            <div class="mode-selection-controls">
              <div class="mode-selector-row">
                <label>Alert Mode:</label>
                <select
                  .value="${this._selectedAlertMode}"
                  @change="${this._handleModeChange}"
                  class="alert-mode-select"
                >
                  <option value="green_alert">🟢 Green Alert (Normal)</option>
                  <option value="red_alert">🔴 Red Alert</option>
                  <option value="blue_alert">🔵 Blue Alert</option>
                  <option value="yellow_alert">🟡 Yellow Alert</option>
                  <option value="gray_alert">⚪ Gray Alert</option>
                  <option value="black_alert">⚫ Black Alert</option>
                </select>
              </div>

              <ha-selector
                .hass="${this.hass}"
                .label="${"Auto-apply changes"}"
                .value="${this._livePreviewEnabled}"
                .selector=${{boolean:{}}}
                @value-changed="${e=>this._livePreviewEnabled=e.detail.value}"
              ></ha-selector>
            </div>
          </lcards-form-section>

          <!-- Parameter Controls -->
          ${"green_alert"!==this._selectedAlertMode?j`
            <div class="parameter-controls">
              <lcards-form-section
                .header=${"Core Transform Parameters"}
                .description=${"Fundamental HSL transformation settings"}
                ?expanded=${!0}
              >
                ${this._renderParameterSlider("hueShift","Hue Target",0,360,1,"°",e.hueShift)}
                ${this._renderParameterSlider("hueStrength","Hue Strength",0,1,.05,"",e.hueStrength)}
                ${this._renderParameterSlider("saturationMultiplier","Saturation",0,3,.05,"×",e.saturationMultiplier)}
                ${this._renderParameterSlider("lightnessMultiplier","Lightness",0,2,.05,"×",e.lightnessMultiplier)}
              </lcards-form-section>

              ${e.hueAnchor?j`
                <lcards-form-section
                  .header=${"Hue Anchoring"}
                  .description=${"Pull colors toward a target hue range"}
                  ?expanded=${!1}
                >
                  ${this._renderParameterSlider("hueAnchor.centerHue","Center Hue",0,360,1,"°",e.hueAnchor.centerHue)}
                  ${this._renderParameterSlider("hueAnchor.range","Range",0,180,5,"°",e.hueAnchor.range)}
                  ${this._renderParameterSlider("hueAnchor.strength","Pull Strength",0,1,.05,"",e.hueAnchor.strength)}
                </lcards-form-section>
              `:""}

              ${e.contrastEnhancement?.enabled?j`
                <lcards-form-section
                  .header=${"Contrast Enhancement"}
                  .description=${"Improve readability in dark modes"}
                  ?expanded=${!1}
                >
                  ${this._renderParameterSlider("contrastEnhancement.threshold","Threshold",0,100,1,"%",e.contrastEnhancement.threshold)}
                  ${this._renderParameterSlider("contrastEnhancement.darkMultiplier","Dark Multiplier",0,1,.05,"",e.contrastEnhancement.darkMultiplier)}
                  ${this._renderParameterSlider("contrastEnhancement.lightMultiplier","Light Multiplier",1,2,.05,"",e.contrastEnhancement.lightMultiplier)}
                </lcards-form-section>
              `:""}
            </div>
          `:j`
            <div class="parameter-controls">
              <p style="padding: 20px; text-align: center; color: var(--secondary-text-color);">
                Green Alert is the baseline state. Parameters cannot be edited.
              </p>
            </div>
          `}

          <!-- Action Buttons -->
          <div class="alert-lab-actions">
            <ha-button @click="${this._applyAlertMode}">
              <ha-icon icon="mdi:play" slot="start"></ha-icon>
              Apply Live
            </ha-button>
            <ha-button @click="${this._resetToDefaults}">
              <ha-icon icon="mdi:restore" slot="start"></ha-icon>
              Reset to Defaults
            </ha-button>
            <ha-button @click="${this._saveToHelpers}">
              <ha-icon icon="mdi:content-save" slot="start"></ha-icon>
              Save to Helpers
            </ha-button>
          </div>

          <!-- Helper Save Feedback Message -->
          ${this._helperSaveMessage?j`
            <lcards-message
              .type=${this._helperSaveMessage.type}
              .message=${this._helperSaveMessage.message}
              @dismissed=${()=>{this._helperSaveMessage=null,this.requestUpdate()}}
            ></lcards-message>
          `:""}
        </div>

        <!-- RIGHT COLUMN: Visualizations -->
        <div class="alert-lab-right-column">
          <!-- Visualization Tabs using HA native components (Issue #82) -->
          <ha-tab-group @wa-tab-show=${this._handleVizTabChange}>
            <ha-tab-group-tab value="preview" ?active=${"preview"===this._activeVizTab}>
              Live Preview
            </ha-tab-group-tab>
            <ha-tab-group-tab value="wheel" ?active=${"wheel"===this._activeVizTab}>
              HSL Wheel
            </ha-tab-group-tab>
            <ha-tab-group-tab value="comparison" ?active=${"comparison"===this._activeVizTab}>
              Full Comparison
            </ha-tab-group-tab>
          </ha-tab-group>

          <!-- Tab Content - Wrapped in scrollable container like main tabs -->
          <div class="alert-lab-viz-content">
            ${"preview"===this._activeVizTab?j`
              <div class="preview-section">
                <h4>Live Preview</h4>
                <p class="preview-hint">Key LCARS colors in selected alert mode:</p>
                ${this._renderAlertModePreviewSwatches()}
              </div>
            `:""}

            ${"wheel"===this._activeVizTab?j`
              <div class="visualization-section">
                <h4>🎨 HSL Color Wheel Transformation</h4>
                <p class="preview-hint">Visual representation of how colors shift in HSL space.</p>
                <p class="preview-hint" style="font-size: 12px; margin-top: -8px; color: var(--secondary-text-color);">
                  <em>Showing the same 12 variables as above. Click legend items to toggle visibility.</em>
                </p>
                ${this._renderColorWheel()}
              </div>
            `:""}

            ${"comparison"===this._activeVizTab?j`
              <div class="comparison-section">
                <lcards-form-section
                  .header=${"Full Color Comparison"}
                  .description=${"Side-by-side comparison of all LCARS color variables"}
                  ?expanded=${!0}
                >
                  ${this._renderColorComparisonGrid()}
                </lcards-form-section>
              </div>
            `:""}
          </div>
        </div>
      </div>
    `}_renderParameterSlider(e,t,r,a,i,s,o){return j`
      <ha-selector
        .hass="${this.hass}"
        .label="${t}"
        .value="${o||r}"
        .selector=${{number:{min:r,max:a,step:i,mode:"slider",unit_of_measurement:s}}}
        @value-changed="${t=>this._handleParamChange(e,t.detail.value)}"
      ></ha-selector>
    `}_renderAlertModePreviewSwatches(){return j`
      <div class="preview-swatches-container">
        ${[{title:"UI Colors",colors:[{name:"Primary",cssVar:"--lcars-ui-primary"},{name:"Secondary",cssVar:"--lcars-ui-secondary"},{name:"Tertiary",cssVar:"--lcars-ui-tertiary"},{name:"Quaternary",cssVar:"--lcars-ui-quaternary"}]},{title:"Card Colors",colors:[{name:"Top",cssVar:"--lcars-card-top-color"},{name:"Mid-Left",cssVar:"--lcars-card-mid-left-color"},{name:"Button",cssVar:"--lcars-card-button"},{name:"Bottom",cssVar:"--lcars-card-bottom-color"}]},{title:"State & Alert Colors",colors:[{name:"Success",cssVar:"--success-color"},{name:"Warning",cssVar:"--warning-color"},{name:"Error",cssVar:"--error-color"},{name:"Alert",cssVar:"--lcars-alert-color"}]}].map(e=>j`
          <div class="preview-swatch-group">
            <h5 class="swatch-group-title">${e.title}</h5>
            <div class="preview-swatches-grid">
              ${e.colors.map(e=>{const t=Te(this._originalLcarsColors?.[e.cssVar]||getComputedStyle(document.documentElement).getPropertyValue(e.cssVar).trim(),this._selectedAlertMode);return j`
                  <div class="preview-swatch-item">
                    <div
                      class="preview-swatch"
                      style="background-color: ${t}"
                      title="${e.name}: ${t}"
                    ></div>
                    <span class="swatch-label">${e.name}</span>
                  </div>
                `})}
            </div>
          </div>
        `)}
      </div>
    `}_renderColorComparisonGrid(){if(!this._originalLcarsColors||0===Object.keys(this._originalLcarsColors).length)return j`
        <div class="comparison-grid-empty">
          <p>⚠️ Original colors not captured. Close and reopen dialog to enable comparison view.</p>
        </div>
      `;const e=Object.keys(this._originalLcarsColors).sort();return j`
      <div class="comparison-grid-container">
        <div class="comparison-grid-header">
          <div class="comparison-column-label">Variable Name</div>
          <div class="comparison-column-label">Original (Green Alert)</div>
          <div class="comparison-column-label">Transformed (${this._selectedAlertMode.replace("_"," ").replace(/\b\w/g,e=>e.toUpperCase())})</div>
        </div>
        <div class="comparison-grid-body">
          ${e.map(e=>{const t=this._originalLcarsColors[e],r=Te(t,this._selectedAlertMode);return j`
              <div class="comparison-row">
                <div class="comparison-var-name">
                  <code>${e}</code>
                </div>
                <div class="comparison-color-cell">
                  <div class="comparison-swatch" style="background-color: ${t}"></div>
                  <code class="comparison-hex">${t}</code>
                </div>
                <div class="comparison-color-cell">
                  <div class="comparison-swatch" style="background-color: ${r}"></div>
                  <code class="comparison-hex">${r}</code>
                </div>
              </div>
            `})}
        </div>
      </div>
    `}_renderColorWheel(){if(!this._originalLcarsColors||0===Object.keys(this._originalLcarsColors).length)return j`
        <div class="comparison-grid-empty">
          <p>⚠️ Original colors not captured. Close and reopen dialog to enable color wheel.</p>
        </div>
      `;const e=["--lcars-ui-primary","--lcars-ui-secondary","--lcars-ui-tertiary","--lcars-ui-quaternary","--lcars-card-top-color","--lcars-card-mid-left-color","--lcars-card-button","--lcars-card-bottom-color","--success-color","--warning-color","--error-color","--lcars-alert-color"].filter(e=>this._originalLcarsColors[e]).map(e=>({color:this._originalLcarsColors[e],varName:e,name:e.replace("--lcars-","").replace(/-/g," ")})),t=e.map(e=>({color:Te(e.color,this._selectedAlertMode),name:e.name})),r=Ce(this._selectedAlertMode);return j`
      <div class="color-wheel-layout">
        <div class="color-wheel-visual">
          <alert-mode-color-wheel
            .originalColors=${e}
            .transformedColors=${t}
            .anchorConfig=${r.hueAnchor||null}
            .hueShift=${r.hueShift}
            .showArrows=${!0}
          ></alert-mode-color-wheel>
        </div>

        <div class="color-wheel-explanation">
          <h5>📖 Understanding the Visualization</h5>

          <div class="explanation-tip">
            <h6>What You're Seeing:</h6>
            <ul>
              <li><strong>⭕ Circles (black border):</strong> Original colors from Green Alert baseline</li>
              <li><strong>◼️ Squares (white border):</strong> Transformed colors in ${this._getModeName(this._selectedAlertMode)}</li>
              <li><strong>🎨 Filled with actual colors:</strong> See the real color values at each position</li>
              <li><strong>🔍 Hover to zoom:</strong> Mouse over any shape to enlarge it for better visibility</li>
              <li><strong>➡️ Gray arrows:</strong> Show how each color shifts from source to target</li>
              <li><strong>📏 Radial position:</strong> Saturation level (center = gray, edge = vibrant)</li>
              <li><strong>🔄 Angular position:</strong> Hue angle (0° = red, 120° = green, 240° = blue)</li>
            </ul>
          </div>

          ${r.hueAnchor?j`
            <div class="explanation-tip">
              <h6>🎯 Hue Anchor:</h6>
              <p>The <strong>shaded arc</strong> shows the target hue range (${r.hueAnchor.centerHue-r.hueAnchor.range}° - ${r.hueAnchor.centerHue+r.hueAnchor.range}°). Colors are "pulled" toward this range with ${Math.round(100*r.hueAnchor.strength)}% strength.</p>
            </div>
          `:""}

          ${void 0!==r.hueShift?j`
            <div class="explanation-tip">
              <h6>🎨 Hue Shift:</h6>
              <p>Primary target: <strong>${r.hueShift}°</strong> (${this._getHueName(r.hueShift)})</p>
              <p>Colors shift toward this hue with ${Math.round(100*r.hueStrength)}% strength.</p>
            </div>
          `:""}

          <div class="explanation-tip">
            <h6>💡 Transform Parameters:</h6>
            <ul>
              <li><strong>Saturation:</strong> ${r.saturationMultiplier}× (${r.saturationMultiplier>1?"more vivid":"more muted"})</li>
              <li><strong>Lightness:</strong> ${r.lightnessMultiplier}× (${r.lightnessMultiplier>1?"brighter":"darker"})</li>
            </ul>
          </div>

          <div class="explanation-tip">
            <strong>💡 Tip:</strong> Adjust the sliders above and watch the blue dots move in real-time to see how parameters affect the transformation!
          </div>
        </div>
      </div>
    `}_getModeName(e){return{green_alert:"Green Alert",red_alert:"Red Alert",blue_alert:"Blue Alert",yellow_alert:"Yellow Alert",gray_alert:"Gray Alert",black_alert:"Black Alert"}[e]||e}_getHueName(e){return e<30||e>=330?"Red":e<60?"Orange":e<90?"Yellow":e<150?"Green":e<210?"Cyan":e<270?"Blue":e<330?"Magenta":"Red"}_openDialog(){ye("[ThemeTokenBrowser] Opening dialog",{tokensCount:this._tokens.length,filteredCount:this._filteredTokens.length}),this._dialogOpen=!0,this._scanCssVariables(),this._scanAllCssVariables(),this._detectHaTheme(),this._applyFilters(),this._originalLcarsColors=Ee(document.documentElement),ye("[AlertLab] Captured original colors:",Object.keys(this._originalLcarsColors||{}).length),window.lcards?.getAlertMode&&(this._selectedAlertMode=window.lcards.getAlertMode(),ye("[AlertLab] Initialized with current mode:",this._selectedAlertMode)),this._loadAlertLabFromHelpers()}_loadAlertLabFromHelpers(){if(!window.lcards?.core?.helperManager)return void ye("[AlertLab] HelperManager not available, skipping helper load");const e=window.lcards.core.helperManager;["red","yellow","blue","gray","black"].forEach(t=>{const r=`alert_lab_${t}_hue`,a=`alert_lab_${t}_hue_strength`,i=`alert_lab_${t}_saturation`,s=`alert_lab_${t}_lightness`;if(e.helperExists(r)){const o=parseFloat(e.getHelperValue(r)),l=e.helperExists(a)?parseFloat(e.getHelperValue(a)):0,n=parseFloat(e.getHelperValue(i))/100,d=parseFloat(e.getHelperValue(s))/100,c=`${t}_alert`;Ae(c,"hueShift",o),Ae(c,"hueStrength",l),Ae(c,"saturationMultiplier",n),Ae(c,"lightnessMultiplier",d),ye(`[AlertLab] Loaded ${c} from helpers:`,{hue:o,hueStrength:l,saturation:n,lightness:d})}if(["red","yellow","blue"].includes(t)){const r=`alert_lab_${t}_center_hue`,a=`alert_lab_${t}_range`,i=`alert_lab_${t}_strength`;if(e.helperExists(r)){const s=parseFloat(e.getHelperValue(r)),o=parseFloat(e.getHelperValue(a)),l=parseFloat(e.getHelperValue(i)),n=`${t}_alert`;Ae(n,"hueAnchor",{centerHue:s,range:o,strength:l}),ye(`[AlertLab] Loaded ${n} hue anchor from helpers:`,{centerHue:s,range:o,strength:l})}}if("black"===t){const t="alert_lab_black_threshold",r="alert_lab_black_dark_multiplier",a="alert_lab_black_light_multiplier";if(e.helperExists(t)){const i=parseFloat(e.getHelperValue(t)),s=parseFloat(e.getHelperValue(r)),o=parseFloat(e.getHelperValue(a));Ae("black_alert","contrastEnhancement",{enabled:!0,threshold:i,darkMultiplier:s,lightMultiplier:o}),ye("[AlertLab] Loaded black_alert contrast enhancement from helpers:",{threshold:i,darkMultiplier:s,lightMultiplier:o})}}}),this.requestUpdate()}_closeDialog(){ye("[ThemeTokenBrowser] Closing dialog"),this._dialogOpen=!1}_openPackExplorer(){ye("[ThemeTokenBrowser] Opening Pack Explorer"),this._packExplorerOpen=!0}_closePackExplorer(){ye("[ThemeTokenBrowser] Closing Pack Explorer"),this._packExplorerOpen=!1}_handleTabChange(e){e.stopPropagation();const t=e.target.activeTab?.getAttribute("value");t&&this._switchView(t)}_switchView(e){this._activeView=e,this._searchQuery="","all-vars"===e&&(this._selectedAllVarsCategory="all"),"tokens"===e?this._applyFilters():"css-vars"===e?this._applyCssVarFilters():"all-vars"===e&&this._applyAllVarsFilters(),this.requestUpdate()}_handleSearchInput(e){this._searchQuery=e.target.value.toLowerCase(),"tokens"===this._activeView?this._applyFilters():"css-vars"===this._activeView?this._applyCssVarFilters():"all-vars"===this._activeView&&this._applyAllVarsFilters()}_selectCategory(e){this._selectedCategory=e,this._applyFilters()}_handleVizTabChange(e){e.stopPropagation();const t=e.target.activeTab?.getAttribute("value");t&&(this._activeVizTab=t,this.requestUpdate())}_selectAllVarsCategory(e){this._selectedAllVarsCategory=e,this.requestUpdate()}_sortBy(e){this._sortColumn===e?this._sortDirection="asc"===this._sortDirection?"desc":"asc":(this._sortColumn=e,this._sortDirection="asc"),this.requestUpdate()}_getSortedTokens(){try{if(!this._filteredTokens||!Array.isArray(this._filteredTokens))return ve("[ThemeTokenBrowser] Invalid filtered tokens:",this._filteredTokens),[];const e=[...this._filteredTokens];return e.sort((e,t)=>{let r,a;"path"===this._sortColumn?(r=e.path||"",a=t.path||""):"value"===this._sortColumn&&(r=String(e.value||""),a=String(t.value||""));const i=r.localeCompare(a);return"asc"===this._sortDirection?i:-i}),e}catch(e){return fe("[ThemeTokenBrowser] Error sorting tokens:",e),this._filteredTokens||[]}}_groupTokensByCategory(e){const t={};e.forEach(e=>{const r=e.path.split(".")[0]||"other";t[r]||(t[r]=[]),t[r].push(e)});const r={};return Object.keys(t).sort().forEach(e=>{r[e]=t[e]}),r}_formatCategoryName(e){return e.split(/[_-]/).map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" ")}_getCategories(){const e={};return this._tokens.forEach(t=>{e[t.category]=(e[t.category]||0)+1}),Object.entries(e).map(([e,t])=>({value:e,label:e.charAt(0).toUpperCase()+e.slice(1),count:t}))}_applyFilters(){let e=this._tokens;"all"!==this._selectedCategory&&(e=e.filter(e=>e.category===this._selectedCategory)),this._searchQuery&&(e=e.filter(e=>e.path.toLowerCase().includes(this._searchQuery)||String(e.value).toLowerCase().includes(this._searchQuery))),this._filteredTokens=e,this.requestUpdate()}_scanCssVariables(){try{const e=[],t=getComputedStyle(document.documentElement);for(let r=0;r<t.length;r++){const a=t[r];if(a.startsWith("--lcars-")||a.startsWith("--lcards-")){const r=t.getPropertyValue(a).trim(),i=a.startsWith("--lcars-")?"HA-LCARS Theme":"LCARdS Injected",s=a.startsWith("--lcars-")?"lcars":"lcards";e.push({name:a,value:r,source:i,category:s,isColor:this._isColorValue(r)})}}e.sort((e,t)=>e.name.localeCompare(t.name)),this._cssVariables=e,this._filteredCssVars=e,ye("[ThemeTokenBrowser] Scanned CSS variables",{total:e.length,lcars:e.filter(e=>"lcars"===e.category).length,lcards:e.filter(e=>"lcards"===e.category).length})}catch(e){fe("[ThemeTokenBrowser] Error scanning CSS variables:",e),this._cssVariables=[],this._filteredCssVars=[]}}_detectHaTheme(){try{if(this.hass?.themes?.theme)return void(this._haThemeName=this.hass.themes.theme);if(this.hass?.selectedTheme)return void(this._haThemeName=this.hass.selectedTheme);const e=document.documentElement.getAttribute("data-theme");if(e)return void(this._haThemeName=e);const t=localStorage.getItem("selectedTheme");if(t)try{const e=JSON.parse(t);return void(this._haThemeName=e.theme||e)}catch(e){return void(this._haThemeName=t)}this._haThemeName="Default",ye("[ThemeTokenBrowser] Detected HA theme:",this._haThemeName)}catch(e){ve("[ThemeTokenBrowser] Error detecting HA theme:",e),this._haThemeName="Unknown"}}_applyCssVarFilters(){let e=this._cssVariables;this._searchQuery&&(e=e.filter(e=>e.name.toLowerCase().includes(this._searchQuery)||e.value.toLowerCase().includes(this._searchQuery)||e.source.toLowerCase().includes(this._searchQuery))),this._filteredCssVars=e,this.requestUpdate()}_scanAllCssVariables(){try{const e=[],t=getComputedStyle(document.documentElement);for(let r=0;r<t.length;r++){const a=t[r];if(a.startsWith("--")){const r=t.getPropertyValue(a).trim();let i="other";a.startsWith("--card-mod-")?i="card-mod":a.startsWith("--lcars-")?i="lcars":a.startsWith("--lcards-")?i="lcards":a.startsWith("--mdc-")?i="material":a.startsWith("--ha-")?i="ha-specific":a.startsWith("--state-")?i="states":a.startsWith("--primary-")||a.startsWith("--secondary-")||a.startsWith("--accent-")||a.startsWith("--card-")||a.startsWith("--divider-")||a.startsWith("--text-")||a.startsWith("--disabled-")||a.startsWith("--sidebar-")?i="ha-core":a.startsWith("--app-")&&(i="app"),e.push({name:a,value:r,category:i,isColor:this._isColorValue(r)})}}e.sort((e,t)=>{if(e.category!==t.category){const r=["ha-core","material","ha-specific","states","card-mod","lcars","lcards","app","other"];return r.indexOf(e.category)-r.indexOf(t.category)}return e.name.localeCompare(t.name)}),this._allCssVariables=e,this._filteredAllVars=e,ye("[ThemeTokenBrowser] Scanned all CSS variables",{total:e.length,byCategory:{"ha-core":e.filter(e=>"ha-core"===e.category).length,material:e.filter(e=>"material"===e.category).length,"ha-specific":e.filter(e=>"ha-specific"===e.category).length,states:e.filter(e=>"states"===e.category).length,"card-mod":e.filter(e=>"card-mod"===e.category).length,lcars:e.filter(e=>"lcars"===e.category).length,lcards:e.filter(e=>"lcards"===e.category).length,app:e.filter(e=>"app"===e.category).length,other:e.filter(e=>"other"===e.category).length}})}catch(e){fe("[ThemeTokenBrowser] Error scanning all CSS variables:",e),this._allCssVariables=[],this._filteredAllVars=[]}}_applyAllVarsFilters(){let e=this._allCssVariables;this._searchQuery&&(e=e.filter(e=>e.name.toLowerCase().includes(this._searchQuery)||e.value.toLowerCase().includes(this._searchQuery)||e.category.toLowerCase().includes(this._searchQuery))),this._filteredAllVars=e,this.requestUpdate()}async _loadTokens(){this._isLoading=!0,this.requestUpdate();try{const e=window.lcards?.core?.themeManager;if(!e)return ve("[ThemeTokenBrowser] ThemeManager not available (unexpected at editor load time)"),this._tokens=[],this._filteredTokens=[],this._isLoading=!1,void this.requestUpdate();const t=e.getActiveTheme();if(!t||!t.tokens)return ve("[ThemeTokenBrowser] No active theme or tokens available"),this._tokens=[],this._filteredTokens=[],this._isLoading=!1,void this.requestUpdate();this._activeTheme={name:t.name||"Unknown Theme",description:t.description||""};const r=this._extractTokensFromObject(t.tokens);r.forEach(e=>{e.usage=this._findTokenUsage(e.path)}),this._tokens=r,this._filteredTokens=r,ye("[ThemeTokenBrowser] Loaded tokens",{count:r.length,categories:Object.keys(t.tokens)})}catch(e){fe("[ThemeTokenBrowser] Error loading tokens:",e),this._tokens=[],this._filteredTokens=[]}finally{this._isLoading=!1,this.requestUpdate()}}_extractTokensFromObject(e){const t=[];return e&&"object"==typeof e?(this._extractTokensRecursive(e,"",t),t):t}_extractTokensRecursive(e,t,r,a=""){if(e&&"object"==typeof e)for(const[i,s]of Object.entries(e)){const e=t?`${t}.${i}`:i,o=a||i;if("object"!=typeof s||null===s||Array.isArray(s)){const t=this._fullyResolveTokenValue(e,s);r.push({path:e,value:t.finalValue,rawValue:s,resolvedFrom:t.resolvedFrom,resolutionChain:t.chain,category:o})}else this._extractTokensRecursive(s,e,r,o)}}_fullyResolveTokenValue(e,t,r=new Set,a=[]){if(r.has(e)||a.length>=10)return ve("[ThemeTokenBrowser] Circular reference or max depth:",e,a),{finalValue:t,resolvedFrom:null,chain:[...a,"⚠️ circular/max-depth"],error:"Circular reference or max recursion depth"};r.add(e),a.push(e);try{const e=window.lcards?.core?.themeManager;if(!e)return{finalValue:t,resolvedFrom:null,chain:[...a]};if("string"!=typeof t)return{finalValue:t,resolvedFrom:null,chain:[...a]};if(this._isUnprefixedTokenReference(t)){const e=this._getTokenByPath(t);if(null!=e){const i=this._fullyResolveTokenValue(t,e,r,[...a,`→ ${t}`]);return{finalValue:i.finalValue,resolvedFrom:t,chain:i.chain}}return{finalValue:t,resolvedFrom:t,chain:[...a,"❌ not found"],error:`Token reference not found: ${t}`}}if(this._looksLikeComputedToken(t)){const r=xe({value:`theme:${t}`},e);return{finalValue:r.value,resolvedFrom:t,chain:[...a,`computed → ${r.value}`]}}return{finalValue:t,resolvedFrom:null,chain:[...a]}}catch(r){return ve("[ThemeTokenBrowser] Error resolving token:",e,r),{finalValue:t,resolvedFrom:null,chain:[...a,"⚠️ error"],error:r.message}}}_isUnprefixedTokenReference(e){return"string"==typeof e&&["colors","typography","spacing","borders","effects","animations","components"].some(t=>e.startsWith(`${t}.`))}_getTokenByPath(e){try{const t=window.lcards?.core?.themeManager;if(!t)return;const r=t.getActiveTheme();if(!r||!r.tokens)return;const a=e.split(".");let i=r.tokens;for(const e of a){if(!i||"object"!=typeof i||!(e in i))return;i=i[e]}return i}catch(t){return void ve("[ThemeTokenBrowser] Error getting token by path:",e,t)}}_looksLikeComputedToken(e){return"string"==typeof e&&["darken","lighten","alpha","saturate","desaturate","mix","shade","tint"].some(t=>e.includes(`${t}(`))}_findTokenUsage(e){const t=[],r=`theme:${e}`;return this._findTokenUsageRecursive(this.config,"",r,t),t}_findTokenUsageRecursive(e,t,r,a){if(e&&"object"==typeof e)for(const[i,s]of Object.entries(e)){const e=t?`${t}.${i}`:i;"string"==typeof s&&s.includes(r)?a.push(e):"object"==typeof s&&null!==s&&this._findTokenUsageRecursive(s,e,r,a)}}_isColorValue(e){return"string"==typeof e&&(!!/^var\(/.test(e)||(!!/^#[0-9A-Fa-f]{3,8}$/.test(e)||(!!/^rgba?\(/.test(e)||(!!/^hsla?\(/.test(e)||(!!/^(color-mix|color|lab|lch|oklab|oklch)\(/.test(e)||["aliceblue","antiquewhite","aqua","aquamarine","azure","beige","bisque","black","blanchedalmond","blue","blueviolet","brown","burlywood","cadetblue","chartreuse","chocolate","coral","cornflowerblue","cornsilk","crimson","cyan","darkblue","darkcyan","darkgoldenrod","darkgray","darkgrey","darkgreen","darkkhaki","darkmagenta","darkolivegreen","darkorange","darkorchid","darkred","darksalmon","darkseagreen","darkslateblue","darkslategray","darkslategrey","darkturquoise","darkviolet","deeppink","deepskyblue","dimgray","dimgrey","dodgerblue","firebrick","floralwhite","forestgreen","fuchsia","gainsboro","ghostwhite","gold","goldenrod","gray","grey","green","greenyellow","honeydew","hotpink","indianred","indigo","ivory","khaki","lavender","lavenderblush","lawngreen","lemonchiffon","lightblue","lightcoral","lightcyan","lightgoldenrodyellow","lightgray","lightgrey","lightgreen","lightpink","lightsalmon","lightseagreen","lightskyblue","lightslategray","lightslategrey","lightsteelblue","lightyellow","lime","limegreen","linen","magenta","maroon","mediumaquamarine","mediumblue","mediumorchid","mediumpurple","mediumseagreen","mediumslateblue","mediumspringgreen","mediumturquoise","mediumvioletred","midnightblue","mintcream","mistyrose","moccasin","navajowhite","navy","oldlace","olive","olivedrab","orange","orangered","orchid","palegoldenrod","palegreen","paleturquoise","palevioletred","papayawhip","peachpuff","peru","pink","plum","powderblue","purple","red","rosybrown","royalblue","saddlebrown","salmon","sandybrown","seagreen","seashell","sienna","silver","skyblue","slateblue","slategray","slategrey","snow","springgreen","steelblue","tan","teal","thistle","tomato","turquoise","violet","wheat","white","whitesmoke","yellow","yellowgreen","transparent","currentcolor"].includes(e.toLowerCase()))))))}async _copyTokenSyntax(e,t){const r=`theme:${e}`,a=t.target.closest("ha-icon-button");if(!a)return;const i=a.icon;try{await navigator.clipboard.writeText(r),be("[ThemeTokenBrowser] Copied token syntax:",r),a.icon="mdi:check",a.style.color="var(--success-color, #4caf50)",setTimeout(()=>{a.icon=i,a.style.color=""},2e3)}catch(e){fe("[ThemeTokenBrowser] Failed to copy to clipboard:",e),a.icon="mdi:alert-circle",a.style.color="var(--error-color, #f44336)",setTimeout(()=>{a.icon=i,a.style.color=""},2e3)}}async _copyCssVar(e,t){const r=`var(${e})`,a=t.target.closest("ha-icon-button");if(!a)return;const i=a.icon;try{await navigator.clipboard.writeText(r),be("[ThemeTokenBrowser] Copied CSS var syntax:",r),a.icon="mdi:check",a.style.color="var(--success-color, #4caf50)",setTimeout(()=>{a.icon=i,a.style.color=""},2e3)}catch(e){fe("[ThemeTokenBrowser] Failed to copy to clipboard:",e),a.icon="mdi:alert-circle",a.style.color="var(--error-color, #f44336)",setTimeout(()=>{a.icon=i,a.style.color=""},2e3)}}_toggleAlertModePreview(){this._alertModePreview=!this._alertModePreview,ye("[ThemeTokenBrowser] Alert mode preview:",this._alertModePreview)}_toggleAlertModePreviewSection(e){this._alertModePreviewExpanded=e.detail.expanded,ye("[ThemeTokenBrowser] Alert mode preview section expanded:",this._alertModePreviewExpanded),this.requestUpdate()}_renderAlertModeConfigRow(e,t,r){const a=Ce(e);if(!a)return j`<tr><td colspan="6">Error: Unknown mode ${e}</td></tr>`;let i="—";if("black_alert"===e&&a.contrastEnhancement){const e=a.contrastEnhancement;i=j`
        <div style="font-size: 0.9em; line-height: 1.4;">
          <div><strong>Contrast:</strong> ${e.enabled?"Enabled":"Disabled"}</div>
          <div>Threshold: ${e.threshold}</div>
          <div>Dark ×: ${e.darkMultiplier}</div>
          <div>Light ×: ${e.lightMultiplier}</div>
        </div>
      `}else if(a.hueAnchor){const e=a.hueAnchor;i=j`
        <div style="font-size: 0.9em; line-height: 1.4;">
          <div><strong>Hue Anchor:</strong></div>
          <div>Center: ${e.centerHue}°</div>
          <div>Range: ±${e.range}°</div>
          <div>Strength: ${e.strength}</div>
        </div>
      `}return j`
      <tr>
        <td><span class="mode-icon">${t}</span><span class="mode-name">${r}</span></td>
        <td>${a.hueShift}°</td>
        <td>${a.hueStrength}</td>
        <td>${a.saturationMultiplier}</td>
        <td>${a.lightnessMultiplier}</td>
        <td>${i}</td>
      </tr>
    `}_getAlertModeColor(e,t,r){if(t.startsWith("--lcards-")){const a=t.replace("--lcards-",""),i=Me[r];return i?.[a]||e}try{return Te(e,r)}catch(t){return ve("[ThemeTokenBrowser] Error transforming color:",t),e}}_getCurrentAlertMode(){return window.lcards?.core?.themeManager?.getAlertMode?.()||"green_alert"}async _copyValue(e,t){const r=t.target.closest("ha-icon-button");if(!r)return;const a=r.icon;try{await navigator.clipboard.writeText(String(e)),be("[ThemeTokenBrowser] Copied value:",e),r.icon="mdi:check",r.style.color="var(--success-color, #4caf50)",setTimeout(()=>{r.icon=a,r.style.color=""},2e3)}catch(e){fe("[ThemeTokenBrowser] Failed to copy to clipboard:",e),r.icon="mdi:alert-circle",r.style.color="var(--error-color, #f44336)",setTimeout(()=>{r.icon=a,r.style.color=""},2e3)}}async _copyResolvedColor(e,t){const r=t.target;if(r)try{const t=this._getHexColor(e);await navigator.clipboard.writeText(t),be("[ThemeTokenBrowser] Copied hex color:",t);const a=r.style.border;r.style.border="3px solid var(--success-color, #4caf50)",r.style.boxShadow="0 0 8px var(--success-color, #4caf50)",setTimeout(()=>{r.style.border=a,r.style.boxShadow=""},1e3)}catch(e){fe("[ThemeTokenBrowser] Failed to copy color:",e);const t=r.style.border;r.style.border="3px solid var(--error-color, #f44336)",setTimeout(()=>{r.style.border=t},1e3)}}_getHexColor(e){if(/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(e))return e;const t=document.createElement("div");t.style.color=e,document.body.appendChild(t);const r=window.getComputedStyle(t).color;document.body.removeChild(t);const a=r.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);return a?`#${parseInt(a[1]).toString(16).padStart(2,"0")}${parseInt(a[2]).toString(16).padStart(2,"0")}${parseInt(a[3]).toString(16).padStart(2,"0")}`:e}async _handleModeChange(e){this._selectedAlertMode=e.target.value,ye("[AlertLab] Mode changed to:",this._selectedAlertMode),this._livePreviewEnabled&&await this._applyAlertMode(),this.requestUpdate()}_handleParamChange(e,t){if(ye("[AlertLab] Parameter changed:",e,t),e.includes(".")){const[r,a]=e.split("."),i={...Ce(this._selectedAlertMode)[r],[a]:t};Ae(this._selectedAlertMode,r,i)}else Ae(this._selectedAlertMode,e,t);this.requestUpdate(),this._livePreviewEnabled&&(clearTimeout(this._applyDebounceTimeout),this._applyDebounceTimeout=setTimeout(()=>{this._applyAlertMode()},150))}async _applyAlertMode(){be("[AlertLab] Applying alert mode:",this._selectedAlertMode);const e=this.hass||window.lcards?.core?._currentHass;if(e)try{window.lcards?.core?.themeManager&&(window.lcards.core.themeManager.updateHass(e),await window.lcards.core.themeManager.setAlertMode(this._selectedAlertMode),be("[AlertLab] Alert mode applied successfully"),this.requestUpdate())}catch(e){fe("[AlertLab] Error applying alert mode:",e)}else ve("[AlertLab] No hass instance available")}async _resetToDefaults(){var e;be("[AlertLab] Resetting to defaults:",this._selectedAlertMode),e=this._selectedAlertMode,delete ke[e],be(`[AlertModeTransform] Reset ${e} to defaults`),this.requestUpdate(),this._livePreviewEnabled&&await this._applyAlertMode()}async _saveToHelpers(){if(!window.lcards?.core?.helperManager)return fe("[AlertLab] HelperManager not available"),void this._showSaveError("Helper Manager is not initialized. Cannot save parameters.");const e=window.lcards.core.helperManager,t=Ce(this._selectedAlertMode),r=this._selectedAlertMode.replace("_alert","");if("green"===r)return ve("[AlertLab] Cannot save green_alert parameters"),void this._showSaveError("Green Alert is the baseline mode and cannot be saved.");try{const a=`alert_lab_${r}_hue`,i=`alert_lab_${r}_hue_strength`,s=`alert_lab_${r}_saturation`,o=`alert_lab_${r}_lightness`;if(!(e.helperExists(a)&&e.helperExists(i)&&e.helperExists(s)&&e.helperExists(o))){const t=[];return e.helperExists(a)||t.push(a),e.helperExists(i)||t.push(i),e.helperExists(s)||t.push(s),e.helperExists(o)||t.push(o),ve("[AlertLab] Missing helpers:",t),void this._showSaveError(`Required helpers not found: ${t.join(", ")}. Please create these input_number helpers in Home Assistant first.`)}if(await e.setHelperValue(a,t.hueShift),await e.setHelperValue(i,t.hueStrength),await e.setHelperValue(s,100*t.saturationMultiplier),await e.setHelperValue(o,100*t.lightnessMultiplier),t.hueAnchor){const a=`alert_lab_${r}_center_hue`,i=`alert_lab_${r}_range`,s=`alert_lab_${r}_strength`;e.helperExists(a)&&e.helperExists(i)&&e.helperExists(s)?(await e.setHelperValue(a,t.hueAnchor.centerHue),await e.setHelperValue(i,t.hueAnchor.range),await e.setHelperValue(s,t.hueAnchor.strength),be("[AlertLab] Saved hue anchor parameters:",{centerHue:t.hueAnchor.centerHue,range:t.hueAnchor.range,strength:t.hueAnchor.strength})):ye("[AlertLab] Hue anchor helpers not found, skipping")}if("black"===r&&t.contrastEnhancement){const r="alert_lab_black_threshold",a="alert_lab_black_dark_multiplier",i="alert_lab_black_light_multiplier";if(e.helperExists(r)&&e.helperExists(a)&&e.helperExists(i)){const s=t.contrastEnhancement;await e.setHelperValue(r,s.threshold),await e.setHelperValue(a,s.darkMultiplier),await e.setHelperValue(i,s.lightMultiplier),be("[AlertLab] Saved contrast enhancement parameters:",{threshold:s.threshold,darkMultiplier:s.darkMultiplier,lightMultiplier:s.lightMultiplier})}else ye("[AlertLab] Contrast enhancement helpers not found, skipping")}be("[AlertLab] Saved parameters to helpers:",{mode:this._selectedAlertMode,hue:t.hueShift,hueStrength:t.hueStrength,saturation:t.saturationMultiplier,lightness:t.lightnessMultiplier}),this._showSaveSuccess()}catch(e){fe("[AlertLab] Failed to save to helpers:",e),this._showSaveError(`Failed to save parameters: ${e.message}`)}}_showSaveSuccess(){this._helperSaveMessage={type:"info",message:`Successfully saved ${this._getModeName(this._selectedAlertMode)} parameters to helpers.`},this.requestUpdate()}_showSaveError(e){this._helperSaveMessage={type:"error",message:e},this.requestUpdate()}_renderPackExplorer(){return this._packExplorerOpen?j`
      <lcards-pack-explorer-dialog
        .hass=${this.hass}
        .open=${this._packExplorerOpen}
        @closed=${this._closePackExplorer}>
      </lcards-pack-explorer-dialog>
    `:""}});const Oe={cards:"Card Interactions",ui:"UI Navigation",alerts:"Alerts & System"},Ue={cards:"color-mix(in srgb, var(--info-color, #03a9f4) 20%, transparent)",ui:"color-mix(in srgb, var(--success-color, #4caf50) 20%, transparent)",alerts:"color-mix(in srgb, var(--warning-color, #ff9800) 20%, transparent)"},De={cards:"var(--info-color, #03a9f4)",ui:"var(--success-color, #4caf50)",alerts:"var(--warning-color, #ff9800)"};class Fe extends de{static properties={hass:{type:Object},_helpers:{type:Array,state:!0},_audioAssets:{type:Array,state:!0},_overrides:{type:Object,state:!0},_schemeNames:{type:Array,state:!0},_eventTypes:{type:Array,state:!0},_creatingHelpers:{type:Boolean,state:!0}};constructor(){super(),this._helpers=[],this._audioAssets=[],this._overrides={},this._schemeNames=["none"],this._eventTypes=[],this._creatingHelpers=!1,this._helperSubscriptions=[]}connectedCallback(){super.connectedCallback(),this._refresh(),this._subscribeToHelpers()}disconnectedCallback(){super.disconnectedCallback(),this._helperSubscriptions.forEach(e=>e()),this._helperSubscriptions=[]}willUpdate(e){super.willUpdate(e),e.has("hass")&&this.hass&&this._refresh()}_refresh(){const e=window.lcards?.core?.soundManager,t=window.lcards?.core?.helperManager,r=window.lcards?.core?.assetManager;if(t){if(this._helpers=(t.getHelpersByCategory("sound")||[]).map(e=>{const r=this.hass?.states?.[e.entity_id];return{...e,exists:!!r,currentValue:r?r.state:t.getHelperValue(e.key)??e.default_value}}),r)try{const e=r.getRegistry("audio");this._audioAssets=Array.from(e.assets.entries()).map(([e,t])=>({key:e,description:t.metadata?.description||e,pack:t.metadata?.pack||"unknown"}))}catch{this._audioAssets=[]}e&&(this._schemeNames=e.getSchemeNames(),this._eventTypes=e.getEventTypes(),this._overrides=e.getOverrides()),this.requestUpdate()}}_subscribeToHelpers(){const e=window.lcards?.core?.helperManager;if(!e)return;const t=(e.getHelpersByCategory("sound")||[]).map(e=>e.key);t.forEach(t=>{const r=e.subscribeToHelper(t,e=>{this._helpers=this._helpers.map(r=>r.key===t?{...r,currentValue:e}:r),this.requestUpdate(),_e(`[SoundConfigTab] Helper updated: ${t} = ${e}`)});this._helperSubscriptions.push(r)}),ye(`[SoundConfigTab] Subscribed to ${t.length} sound helpers`)}async _createAllMissingHelpers(){const e=window.lcards?.core?.helperManager;if(e){this._creatingHelpers=!0,this.requestUpdate();try{for(const t of this._helpers.filter(e=>!e.exists))await e.ensureHelper(t.key),be(`[SoundConfigTab] Created helper: ${t.key}`)}catch(e){fe("[SoundConfigTab] Failed to create helpers:",e)}this._creatingHelpers=!1,this._refresh()}}async _createHelper(e){const t=window.lcards?.core?.helperManager;if(t)try{await t.ensureHelper(e),this._refresh()}catch(t){fe(`[SoundConfigTab] Failed to create helper ${e}:`,t)}}async _setHelperValue(e,t){const r=window.lcards?.core?.helperManager;if(r)try{await r.setHelperValue(e,t),this._helpers=this._helpers.map(r=>r.key===e?{...r,currentValue:t}:r),this.requestUpdate()}catch(t){fe(`[SoundConfigTab] Failed to set ${e}:`,t)}}_getHelperValue(e){return this._helpers.find(t=>t.key===e)?.currentValue}_helperExists(e){return this._helpers.find(t=>t.key===e)?.exists??!1}_masterEnabled(){const e=this._getHelperValue("sound_enabled");return!0===e||"on"===e}async _previewScheme(e){window.lcards?.core?.soundManager?.previewScheme(e)}async _previewAsset(e){e&&"__scheme__"!==e&&"__mute__"!==e&&window.lcards?.core?.soundManager?.preview(e)}async _setOverride(e,t){const r=window.lcards?.core?.soundManager;r&&("__mute__"===t||"__scheme__"===t?await r.setOverride(e,null):await r.setOverride(e,t),this._overrides=r.getOverrides(),this.requestUpdate())}_resetOverrides(){const e=window.lcards?.core?.soundManager;e&&(e.clearAllOverrides(),this._overrides=e.getOverrides(),this.requestUpdate())}_overrideValueFor(e){if(e in this._overrides){const t=this._overrides[e];return null===t?"__mute__":t}return"__scheme__"}render(){const e=this._helpers.filter(e=>!e.exists),t=this._masterEnabled(),r=this._getHelperValue("sound_scheme")||"none",a=parseFloat(this._getHelperValue("sound_volume")??.5);return j`
      <div class="studio-layout"><div class="scrollable-body">

        <!-- ── MISSING HELPERS BANNER ── -->
        ${e.length>0?j`
          <div class="banner warning">
            <ha-icon icon="mdi:alert-circle"></ha-icon>
            <span>${e.length} sound helper${e.length>1?"s are":" is"} missing in Home Assistant.</span>
            <ha-button
              @click=${this._createAllMissingHelpers}
              ?disabled=${this._creatingHelpers}
            >
              ${this._creatingHelpers?"Creating…":"Create All"}
            </ha-button>
          </div>
        `:""}

        <!-- ── MASTER CONTROLS ── -->
        <lcards-form-section
          header="Master Controls"
          icon="mdi:volume-high"
          ?expanded=${!0}
          ?outlined=${!0}>

          <div class="control-row prominent">
            <div class="control-label">
              <strong>Sound Effects Enabled</strong>
              <span class="hint">Master on/off for all LCARdS sounds</span>
            </div>
            <ha-selector
              .hass=${this.hass}
              .selector=${{boolean:{}}}
              .value=${t}
              ?disabled=${!this._helperExists("sound_enabled")}
              @value-changed=${e=>{e.stopPropagation(),this._setHelperValue("sound_enabled",e.detail.value)}}
            ></ha-selector>
          </div>

          <div class="control-row ${t?"":"dimmed"}">
            <div class="control-label">
              Volume
              <span class="hint">Master volume for all sound effects</span>
            </div>
            <ha-selector
              .hass=${this.hass}
              .selector=${{number:{min:0,max:1,step:.05,mode:"slider"}}}
              .value=${a}
              ?disabled=${!this._helperExists("sound_volume")||!t}
              @value-changed=${e=>this._setHelperValue("sound_volume",e.detail.value)}
            ></ha-selector>
          </div>
        </lcards-form-section>

        <!-- ── CATEGORY TOGGLES ── -->
        <lcards-form-section
          header="Sound Categories"
          icon="mdi:tune"
          ?expanded=${!0}
          ?outlined=${!0}
          class="${t?"":"dimmed"}">

          ${[{key:"sound_cards_enabled",icon:"mdi:gesture-tap",label:"Card Interaction Sounds",hint:"Button taps, holds, sliders, toggles"},{key:"sound_ui_enabled",icon:"mdi:navigation",label:"UI Navigation Sounds",hint:"Sidebar, page transitions, menus"},{key:"sound_alerts_enabled",icon:"mdi:alert-circle",label:"Alert & System Sounds",hint:"Alert mode changes, system events"}].map(e=>j`
            <div class="control-row">
              <div class="control-label">
                <ha-icon icon="${e.icon}"></ha-icon>
                ${e.label}
                <span class="hint">${e.hint}</span>
              </div>
              <ha-selector
                .hass=${this.hass}
                .selector=${{boolean:{}}}
                .value=${"off"!==this._getHelperValue(e.key)&&!1!==this._getHelperValue(e.key)}
                ?disabled=${!this._helperExists(e.key)||!t}
                @value-changed=${t=>{t.stopPropagation(),this._setHelperValue(e.key,t.detail.value)}}
              ></ha-selector>
            </div>
          `)}
        </lcards-form-section>

        <!-- ── SOUND SCHEME ── -->
        <lcards-form-section
          header="Sound Scheme"
          icon="mdi:music-box-multiple"
          ?expanded=${!0}
          ?outlined=${!0}
          class="${t?"":"dimmed"}">

          ${this._schemeNames.length<=1?j`
            <div class="empty-hint">
              <ha-icon icon="mdi:information-outline"></ha-icon>
              No audio packs loaded. Add an audio pack to get sound schemes.
            </div>
          `:""}

          <div class="control-row">
            <div class="control-label">
              Active Scheme
              <span class="hint">Select a sound scheme provided by audio packs</span>
            </div>
            <div class="scheme-row">
              <ha-selector
                .hass=${this.hass}
                .selector=${{select:{options:this._schemeNames.map(e=>({value:e,label:"none"===e?"None (silent)":e})),mode:"dropdown"}}}
                .value=${r}
                ?disabled=${!this._helperExists("sound_scheme")||!t}
                @value-changed=${e=>this._setHelperValue("sound_scheme",e.detail.value)}
              ></ha-selector>
              ${"none"!==r?j`
                <ha-button
                  @click=${()=>this._previewScheme(r)}
                  ?disabled=${!t}
                >
                  <ha-icon slot="start" icon="mdi:play-circle"></ha-icon>
                  Preview
                </ha-button>
              `:""}
            </div>
          </div>
        </lcards-form-section>

        <!-- ── PER-EVENT OVERRIDES ── -->
        <lcards-form-section
          header="Per-Event Overrides"
          icon="mdi:tune-variant"
          description="Override individual events regardless of the active scheme"
          ?expanded=${!0}
          ?outlined=${!0}
          class="${t?"":"dimmed"}">

          ${0===this._audioAssets.length?j`
            <div class="empty-hint">
              <ha-icon icon="mdi:information-outline"></ha-icon>
              No audio assets registered. Load an audio pack to enable overrides.
            </div>
          `:""}

          ${this._eventTypes.length>0?j`
            <div class="overrides-header-row">
              <span class="overrides-note">
                <ha-icon icon="mdi:monitor"></ha-icon>
                Overrides are stored in this browser only — configure each device separately.
              </span>
              ${Object.keys(this._overrides).length>0?j`
                <ha-button @click=${this._resetOverrides} class="reset-overrides-btn">
                  <ha-icon slot="start" icon="mdi:restore"></ha-icon>
                  Reset all to scheme defaults
                </ha-button>
              `:""}
            </div>
            <div class="overrides-table-wrapper">
              <table class="overrides-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Category</th>
                    <th>Override</th>
                    <th style="width:60px;"></th>
                  </tr>
                </thead>
                <tbody>
                  ${this._eventTypes.map(e=>{const r=this._overrideValueFor(e.key);return j`
                      <tr class="${"__scheme__"!==r?"has-override":""}">
                        <td class="event-label">${e.label}</td>
                        <td>
                          <ha-assist-chip
                            .filled=${!0}
                            .label=${Oe[e.category]||e.category}
                            style="
                              --ha-assist-chip-filled-container-color: ${Ue[e.category]||"var(--secondary-background-color)"};
                              --md-assist-chip-label-text-color: ${De[e.category]||"var(--primary-text-color)"};
                              --md-sys-color-on-surface: ${De[e.category]||"var(--primary-text-color)"};
                            "
                          ></ha-assist-chip>
                        </td>
                        <td>
                          <ha-selector
                            .hass=${this.hass}
                            .selector=${{select:{options:[{value:"__scheme__",label:"— Use scheme default —"},{value:"__mute__",label:"🔇 Mute this event"},...this._audioAssets.map(e=>({value:e.key,label:`${e.key} (${e.pack})`}))],mode:"dropdown"}}}
                            .value=${r}
                            ?disabled=${!t}
                            @value-changed=${t=>this._setOverride(e.key,t.detail.value)}
                          ></ha-selector>
                        </td>
                        <td>
                          ${"__scheme__"!==r&&"__mute__"!==r?j`
                            <ha-icon-button
                              .label=${"Preview"}
                              @click=${()=>this._previewAsset(r)}
                              ?disabled=${!t}
                            >
                              <ha-icon icon="mdi:play"></ha-icon>
                            </ha-icon-button>
                          `:""}
                        </td>
                      </tr>
                    `})}
                </tbody>
              </table>
            </div>
          `:""}
        </lcards-form-section>

        <!-- ── HELPER STATUS ── -->
        <lcards-form-section
          header="Sound Helpers Status"
          icon="mdi:cog"
          ?expanded=${!1}
          ?outlined=${!0}>
          <table class="helper-status-table">
            <thead>
              <tr>
                <th>Helper</th>
                <th>Entity ID</th>
                <th style="width:100px">Status</th>
                <th style="width:80px"></th>
              </tr>
            </thead>
            <tbody>
              ${this._helpers.map(e=>j`
                <tr>
                  <td>
                    <ha-icon icon="${e.icon||"mdi:cog"}" style="color: var(--primary-color);"></ha-icon>
                    <span class="helper-name">${e.name}</span>
                  </td>
                  <td><span class="entity-id">${e.entity_id}</span></td>
                  <td>
                    <ha-assist-chip
                      .label=${e.exists?"Exists":"Missing"}
                      style="
                        --ha-assist-chip-filled-container-color: ${e.exists?"var(--success-color)":"var(--error-color)"};
                        --md-assist-chip-label-text-color: white;
                        --md-sys-color-on-surface: white;
                      "
                    >
                      <ha-icon icon="${e.exists?"mdi:check-circle":"mdi:alert-circle"}" slot="icon"></ha-icon>
                    </ha-assist-chip>
                  </td>
                  <td>
                    ${e.exists?"":j`
                      <ha-button @click=${()=>this._createHelper(e.key)}>
                        <ha-icon slot="start" icon="mdi:plus"></ha-icon>
                        Create
                      </ha-button>
                    `}
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </lcards-form-section>

      </div></div>
    `}static styles=s`
    :host {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    }

    .studio-layout {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--primary-background-color);
      min-height: 0;
      border-radius: var(--ha-card-border-radius, 12px);
      padding: 16px;
    }

    .scrollable-body {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-bottom: 8px;
      /* Suppress lcards-form-section's own margin-bottom; gap handles spacing */
      --lcards-section-spacing: 0;
    }

    .banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 0.9em;
    }
    .banner.warning {
      background: color-mix(in srgb, var(--warning-color, #ff9800) 15%, transparent);
      border: 1px solid color-mix(in srgb, var(--warning-color, #ff9800) 40%, transparent);
      color: var(--primary-text-color);
    }
    .banner ha-button {
      margin-left: auto;
    }

    /* Dim sections or individual rows when sound is globally disabled */
    .dimmed {
      opacity: 0.5;
      pointer-events: none;
    }

    .control-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 8px 0;
      border-bottom: 1px solid color-mix(in srgb, var(--divider-color) 50%, transparent);
    }
    .control-row:last-child { border-bottom: none; }
    .control-row.prominent { font-size: 1.05em; }

    .control-label {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      gap: 2px;
      font-size: 0.9em;
    }
    .control-label ha-icon {
      margin-right: 6px;
      color: var(--primary-color);
    }
    .hint {
      font-size: 0.8em;
      color: var(--secondary-text-color);
    }

    .scheme-row {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 280px;
    }
    .scheme-row ha-selector {
      flex: 1;
    }

    .empty-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--secondary-text-color);
      font-size: 0.85em;
      padding: 8px 0;
    }

    /* Overrides table */
    .overrides-table-wrapper {
      overflow-x: auto;
      max-height: 400px;
      overflow-y: auto;
    }
    .overrides-table {
      width: 100%;
      border-collapse: collapse;
    }
    .overrides-table th {
      text-align: left;
      padding: 6px 8px;
      color: var(--secondary-text-color);
      border-bottom: 1px solid var(--divider-color);
      position: sticky;
      top: 0;
      background: var(--card-background-color, #1c1c1c);
    }
    .overrides-table td {
      padding: 4px 8px;
      vertical-align: middle;
      border-bottom: 1px solid color-mix(in srgb, var(--divider-color) 40%, transparent);
    }
    .overrides-table tr.has-override td {
      background: color-mix(in srgb, var(--primary-color) 8%, transparent);
    }
    .event-label {
      white-space: nowrap;
    }
    .overrides-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 0 4px 8px;
    }
    .overrides-note {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.82em;
      color: var(--secondary-text-color);
    }
    .overrides-note ha-icon {
      --mdc-icon-size: 14px;
      flex-shrink: 0;
    }
    .reset-overrides-btn {
      --mdc-theme-primary: var(--warning-color, #ff9800);
      flex-shrink: 0;
    }

    /* Helper status table */
    .helper-status-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85em;
    }
    .helper-status-table th {
      text-align: left;
      padding: 6px 8px;
      color: var(--secondary-text-color);
      border-bottom: 1px solid var(--divider-color);
    }
    .helper-status-table td {
      padding: 6px 8px;
      vertical-align: middle;
      border-bottom: 1px solid color-mix(in srgb, var(--divider-color) 40%, transparent);
    }
    .helper-status-table tr:last-child td { border-bottom: none; }
    .helper-name {
      margin-left: 6px;
      vertical-align: middle;
    }
    .entity-id {
      font-family: monospace;
      font-size: 0.85em;
      color: var(--secondary-text-color);
    }
  `}customElements.define("lcards-sound-config-tab",Fe);class Ie extends de{static properties={hass:{type:Object},narrow:{type:Boolean},panel:{type:Object},_selectedTab:{type:Number,state:!0},_helpers:{type:Array,state:!0},_missingHelpers:{type:Array,state:!0},_createInProgress:{type:Boolean,state:!0},_filterText:{type:String,state:!0},_initialLoadDone:{type:Boolean,state:!0},_selectedCategory:{type:String,state:!0},_expandedCategories:{type:Set,state:!0}};constructor(){super(),this._selectedTab=0,this._helpers=[],this._missingHelpers=[],this._createInProgress=!1,this._filterText="",this._initialLoadDone=!1,this._selectedCategory="all",this._expandedCategories=new Set,this._helperSubscriptions=[]}willUpdate(e){super.willUpdate(e),e.has("hass")&&this.hass&&(window.lcards?.core&&(ye("[ConfigPanel] Propagating hass to Core"),window.lcards.core.ingestHass(this.hass)),window.lcards?.core?.helperManager&&(ye("[ConfigPanel] Propagating hass to HelperManager"),window.lcards.core.helperManager.updateHass(this.hass),this._initialLoadDone||(this._initialLoadDone=!0,setTimeout(()=>this._loadHelperStatus(),100))))}static styles=s`
    :host {
      display: block;
      height: 100vh;
      background: var(--primary-background-color);
      overflow: hidden;
    }

    .panel-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      margin: 0 auto;
    }

    /* Helpers tab container */
    .studio-layout {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--primary-background-color);
      min-height: 0;
      border-radius: var(--ha-card-border-radius, 12px);
      padding: 16px;
    }

    /* Helpers tab layout (used only in Helpers tab) */
    .dialog-content {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }

    .dialog-header {
      flex-shrink: 0;
    }

    .dialog-body {
      flex: 1;
      overflow: auto;
      padding: 0;
    }

    .header {
      padding: 24px 24px 16px;
      border-bottom: 1px solid var(--divider-color);
      background: var(--card-background-color);
      flex-shrink: 0;
    }

    .header h1 {
      font-size: 1.8em;
      margin: 0 0 4px 0;
      color: var(--primary-text-color);
      font-weight: 500;
    }

    .header p {
      margin: 0;
      color: var(--secondary-text-color);
      font-size: 0.95em;
    }

    /* HA Native Tab Styling */
    ha-tab-group {
      display: block;
      margin: 0;
      border-bottom: 2px solid var(--divider-color);
      background: var(--card-background-color);
      flex-shrink: 0;
    }

    ha-tab-group-tab ha-icon {
      --mdc-icon-size: 18px;
      margin-right: 8px;
    }

    .tab {
      background: transparent;
      border: none;
      border-bottom: 3px solid transparent;
      color: var(--secondary-text-color);
      font-size: 1em;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tab:hover {
      color: var(--primary-text-color);
      background: var(--secondary-background-color);
    }

    .tab.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
    }

    .tab-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 8px;
      min-height: 0;
      background: var(--secondary-background-color);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .card {
      background: rgba(60,60,60,0.7);
      border-radius: var(--ha-card-border-radius, 12px);
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.1));
      border: 1px solid var(--divider-color);
    }

    .card h2 {
      margin: 0 0 16px 0;
      font-size: 1.2em;
      color: var(--primary-text-color);
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .card h2 ha-icon {
      --mdc-icon-size: 20px;
      color: var(--primary-color);
    }

    .helper-table {
      width: 100%;
      border-collapse: collapse;
      background: var(--primary-background-color);
    }

    .helper-table th,
    .helper-table td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid var(--divider-color);
    }

    .helper-table th {
      font-weight: 600;
      color: var(--primary-text-color);
      background: var(--primary-background-color);
      position: sticky;
      top: 0;
      z-index: 1;
    }

    .helper-table td {
      color: var(--primary-text-color);
    }

    .helper-table tr:hover {
      background: var(--secondary-background-color);
    }

    .helper-name {
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .helper-entity-id {
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      color: var(--secondary-text-color);
    }

    .helper-description {
      color: var(--secondary-text-color);
      font-size: 0.9em;
      margin-top: 4px;
    }

    /* Rotating animation for loading icon */
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .rotating {
      animation: rotate 2s linear infinite;
    }

    .helper-value {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .action-button {
      padding: 8px 16px;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9em;
      font-weight: 500;
      transition: all 0.2s;
    }

    .action-button:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .action-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .action-button.secondary {
      background: var(--secondary-color, #666);
    }

    .create-all-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      font-size: 1em;
      margin-bottom: 16px;
    }

    .yaml-output {
      background: var(--code-editor-background-color, #1e1e1e);
      color: var(--code-editor-text-color, #d4d4d4);
      padding: 16px;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      white-space: pre;
      overflow-x: auto;
      max-height: 600px;
      overflow-y: auto;
      margin-top: 12px;
      border: 1px solid var(--divider-color);
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      color: var(--secondary-text-color);
    }

    .empty-state ha-icon {
      --mdc-icon-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state p {
      margin: 0;
      font-size: 1.1em;
    }

    /* Success Message */
    .success-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: rgba(76, 175, 80, 0.1);
      border: 1px solid var(--success-color, #4caf50);
      border-radius: 8px;
      color: var(--success-color, #4caf50);
      margin-bottom: 16px;
      font-weight: 500;
    }

    .success-message ha-icon {
      --mdc-icon-size: 24px;
    }

    /* Search container */
    .search-container {
      padding: 12px 24px;
      border-bottom: 1px solid var(--divider-color);
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .search-wrapper {
      flex: 1;
      position: relative;
      min-width: 400px;
    }

    .search-clear {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      --mdc-icon-button-size: 32px;
    }

    .search-result-count {
      color: var(--secondary-text-color);
      font-size: 13px;
      white-space: nowrap;
      padding: 0 8px;
    }

    /* Category filter chips (matching theme browser style) */
    .category-filters {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      padding: 16px 24px;
      border-bottom: 1px solid var(--divider-color);
    }

    .category-chip {
      appearance: none;
      border: 1px solid var(--divider-color);
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .category-chip:hover {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    .category-chip.selected {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    .copy-button {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .success-message {
      padding: 12px;
      background: var(--success-color, #4caf50);
      color: white;
      border-radius: 4px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .error-message {
      padding: 12px;
      background: var(--error-color, #f44336);
      color: white;
      border-radius: 4px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .spinner {
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;connectedCallback(){super.connectedCallback(),window.lcards?.core?.helperManager||(ve("[ConfigPanel] LCARdS core not yet loaded"),setTimeout(()=>{window.lcards?.core?.helperManager||this._showWarning("LCARdS core not detected. Please ensure at least one LCARdS card is added to a dashboard.")},2e3)),this._loadHelperStatus(),this._subscribeToHelperChanges(),ye("[ConfigPanel] Panel connected")}disconnectedCallback(){super.disconnectedCallback(),this._helperSubscriptions.forEach(e=>e()),this._helperSubscriptions=[],ye("[ConfigPanel] Panel disconnected, cleaned up subscriptions")}_subscribeToHelperChanges(){if(!window.lcards?.core?.helperManager)return;const e=window.lcards.core.helperManager;this._helpers.forEach(t=>{const r=e.subscribeToHelper(t.key,e=>{const r=this._helpers.findIndex(e=>e.key===t.key);r>=0&&(this._helpers[r]={...this._helpers[r],currentValue:e},this.requestUpdate())});this._helperSubscriptions.push(r)}),ye(`[ConfigPanel] Subscribed to ${this._helperSubscriptions.length} helper state changes`)}async _loadHelperStatus(){if(!this.hass||!window.lcards?.core?.helperManager)return void ve("[ConfigPanel] HASS or HelperManager not available");const e=window.lcards.core.helperManager;this._helpers=e.getAllHelpers().map(t=>({...t,exists:e.helperExists(t.key),currentValue:e.getHelperValue(t.key)})),this._missingHelpers=e.getMissingHelpers(),ye("[ConfigPanel] Loaded helper status:",{total:this._helpers.length,missing:this._missingHelpers.length}),this._helperSubscriptions.forEach(e=>e()),this._helperSubscriptions=[],this._subscribeToHelperChanges()}async _createAllHelpers(){if(!window.lcards?.core?.helperManager)return void this._showError("Helper Manager not available");this._createInProgress=!0;const e=window.lcards.core.helperManager;try{const t=await e.ensureAllHelpers();t.created>0&&this._showSuccess(`Created ${t.created} helper(s)`),t.failed>0&&this._showError(`Failed to create ${t.failed} helper(s)`),await this._loadHelperStatus()}catch(e){fe("[ConfigPanel] Failed to create helpers:",e),this._showError(`Error: ${e.message}`)}finally{this._createInProgress=!1}}async _createHelper(e){if(!window.lcards?.core?.helperManager)return;const t=window.lcards.core.helperManager;try{await t.ensureHelper(e),this._showSuccess(`Created helper: ${e}`),await new Promise(e=>setTimeout(e,500)),await this._loadHelperStatus(),this.requestUpdate()}catch(t){fe(`[ConfigPanel] Failed to create helper ${e}:`,t),this._showError(`Failed to create ${e}: ${t.message}`)}}async _setHelperValue(e,t){if(!window.lcards?.core?.helperManager)return;const r=window.lcards.core.helperManager,a=this._helpers.find(t=>t.key===e);try{if("input_boolean"===a?.domain){const e=t?"turn_on":"turn_off";ye(`[ConfigPanel] Calling input_boolean.${e} for ${a.entity_id} (value: ${t})`),await this.hass.callService("input_boolean",e,{entity_id:a.entity_id}),setTimeout(()=>this._loadHelperStatus(),300)}else await r.setHelperValue(e,t),ye(`[ConfigPanel] Set helper value: ${e} = ${t}`)}catch(e){fe("[ConfigPanel] Failed to set helper value:",e),this._showError(`Failed to set value: ${e.message}`)}}_copyYAMLToClipboard(){const e=this._generateYAML();if(navigator.clipboard)navigator.clipboard.writeText(e).then(()=>{this._showSuccess("YAML copied to clipboard")}).catch(e=>{this._showError("Failed to copy YAML")});else{const t=document.createElement("textarea");t.value=e,document.body.appendChild(t),t.select(),document.execCommand("copy"),document.body.removeChild(t),this._showSuccess("YAML copied to clipboard")}}_generateYAML(){return window.lcards?.core?.helperManager?window.lcards.core.helperManager.generateYAML():"# Helper Manager not available"}_showSuccess(e){be(`[ConfigPanel] Success: ${e}`),this.dispatchEvent(new CustomEvent("hass-notification",{detail:{message:e},bubbles:!0,composed:!0}))}_showError(e){fe(`[ConfigPanel] Error: ${e}`),this.dispatchEvent(new CustomEvent("hass-notification",{detail:{message:`Error: ${e}`},bubbles:!0,composed:!0}))}_showWarning(e){ve(`[ConfigPanel] Warning: ${e}`),this.dispatchEvent(new CustomEvent("hass-notification",{detail:{message:`Warning: ${e}`},bubbles:!0,composed:!0}))}_showMoreInfo(e){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:e},bubbles:!0,composed:!0}))}render(){return j`
      <div class="panel-container">
        <div class="header">
          <h1>🖖 LCARdS Configuration</h1>
          <p>Manage persistent configuration via Home Assistant input helpers</p>
        </div>

        <ha-tab-group @wa-tab-show=${this._handleTabChange}>
          <ha-tab-group-tab value="0" ?active=${0===this._selectedTab}>
            <ha-icon icon="mdi:cog"></ha-icon>
            Helpers
          </ha-tab-group-tab>
          <ha-tab-group-tab value="1" ?active=${1===this._selectedTab}>
            <ha-icon icon="mdi:palette-swatch"></ha-icon>
            Alert Lab & Theme Browser
          </ha-tab-group-tab>
          <ha-tab-group-tab value="2" ?active=${2===this._selectedTab}>
            <ha-icon icon="mdi:volume-high"></ha-icon>
            Sounds
          </ha-tab-group-tab>
          <ha-tab-group-tab value="3" ?active=${3===this._selectedTab}>
            <ha-icon icon="mdi:package-variant"></ha-icon>
            Pack Explorer
          </ha-tab-group-tab>
          <ha-tab-group-tab value="4" ?active=${4===this._selectedTab}>
            <ha-icon icon="mdi:code-braces"></ha-icon>
            YAML Export
          </ha-tab-group-tab>
        </ha-tab-group>

        <div class="tab-content">
          ${this._renderTabContent()}
        </div>
      </div>
    `}_handleTabChange(e){const t=e.target.activeTab?.getAttribute("value");null!=t&&(this._selectedTab=parseInt(t,10),this.requestUpdate())}_renderTabContent(){switch(this._selectedTab){case 0:return this._renderHelpersTab();case 1:return this._renderThemeBrowserTab();case 2:return this._renderSoundTab();case 3:return this._renderPackExplorerTab();case 4:return this._renderYAMLTab();default:return j`<div>Unknown tab</div>`}}_renderHelpersTab(){let e=this._helpers;if(this._filterText){const t=this._filterText.toLowerCase();e=e.filter(e=>e.name.toLowerCase().includes(t)||e.description.toLowerCase().includes(t)||e.key.toLowerCase().includes(t)||e.entity_id.toLowerCase().includes(t))}"all"!==this._selectedCategory&&(e=e.filter(e=>(e.category||"other")===this._selectedCategory));const t=e.reduce((e,t)=>{const r=t.category||"other";return e[r]||(e[r]=[]),e[r].push(t),e},{}),r={alert_system:"Alert Lab Configuration",ha_lcars_theme:"HA-LCARS Theme Settings",sound:"Sound System",other:"Other"};return j`
      <div class="studio-layout">
        <div class="dialog-content">
          <div class="dialog-header">
            ${this._missingHelpers.length>0?j`
              <div class="card" style="margin: 12px;">
                <h2>
                  <ha-icon icon="mdi:alert-circle"></ha-icon>
                  Missing Helpers (${this._missingHelpers.length})
                </h2>
                <p style="color: var(--secondary-text-color); margin-bottom: 12px;">
                  Not all helpers currently exist in Home Assistant. Click below to create them all - or create individually using the buttons in the table.
                </p>
                <ha-button
                  @click=${this._createAllHelpers}
                  ?disabled=${this._createInProgress}
                  raised>
                  ${this._createInProgress?j`<span class="spinner"></span>`:""}
                  <ha-icon slot="start" icon="mdi:plus-circle"></ha-icon>
                  Create All Missing Helpers
                </ha-button>
              </div>
            `:""}
          </div>

          <div class="dialog-body">
            <div class="search-container">
              <div class="search-wrapper">
                <ha-textfield
                  style="width: 100%;"
                  .value=${this._filterText}
                  @input=${e=>{this._filterText=e.target.value,this.requestUpdate()}}
                  placeholder="Search helpers... (Ctrl+F)"
                  .label=${"Search"}>
                  <ha-icon slot="leadingIcon" icon="mdi:magnify"></ha-icon>
                </ha-textfield>
                ${this._filterText?j`
                  <ha-icon-button
                    class="search-clear"
                    @click=${this._clearSearch}
                    .label=${"Clear search"}
                    .path=${"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"}>
                  </ha-icon-button>
                `:""}
              </div>
              ${this._filterText?j`
                <div class="search-result-count">
                  Showing ${e.length} of ${this._helpers.length}
                </div>
              `:""}
            </div>

            ${this._renderCategoryFilters()}

        ${Object.entries(t).length>0?Object.entries(t).map(([e,t])=>{const a=this._expandedCategories.has(e),i=this._helpers.filter(t=>(t.category||"other")===e),s=i.filter(e=>e.exists).length,o=i.length;return j`
            <lcards-collapsible-section
              .title=${r[e]||e}
              .count=${s}
              .totalCount=${o}
              ?expanded=${a}
              @toggle=${()=>this._toggleCategory(e)}>
              <table class="helper-table">
                <thead>
                  <tr>
                    <th style="width: 40px;">Icon</th>
                    <th>Helper Name</th>
                    <th>Entity ID</th>
                    <th style="width: 120px;">Status</th>
                    <th>Value</th>
                    <th style="width: 100px;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${t.map(e=>this._renderHelperRow(e))}
                </tbody>
              </table>
            </lcards-collapsible-section>
          `}):""}

        ${0===e.length&&this._filterText?j`
          <div class="card" style="margin: 16px;">
            <div class="empty-state">
              <ha-icon icon="mdi:filter-off"></ha-icon>
              <p>No helpers match your filter "${this._filterText}"</p>
              <p style="font-size: 13px; color: var(--secondary-text-color);">
                Try a different search term or category filter.
              </p>
            </div>
          </div>
        `:""}

        ${0!==this._helpers.length||this._filterText?"":j`
          <div class="card" style="margin: 16px;">
            <div class="empty-state">
              <ha-icon icon="mdi:loading" class="rotating"></ha-icon>
              <p>Loading helpers...</p>
            </div>
          </div>
        `}
          </div>
        </div>
      </div>
    `}_renderCategoryFilters(){const e=this._helpers.reduce((e,t)=>{const r=t.category||"other";return e[r]=(e[r]||0)+1,e},{}),t=[{id:"all",label:"All",count:this._helpers.length},{id:"alert_system",label:"Alert Lab",count:e.alert_system||0},{id:"ha_lcars_theme",label:"HA-LCARS Theme",count:e.ha_lcars_theme||0},{id:"sound",label:"Sounds",count:e.sound||0}];return j`
      <div class="category-filters">
        ${t.map(e=>j`
          <button
            class="category-chip ${this._selectedCategory===e.id?"selected":""}"
            @click=${()=>this._selectCategory(e.id)}
          >
            ${e.label} (${e.count})
          </button>
        `)}
      </div>
    `}_selectCategory(e){this._selectedCategory=e,this.requestUpdate()}_toggleCategory(e){this._expandedCategories.has(e)?this._expandedCategories.delete(e):this._expandedCategories.add(e),this.requestUpdate()}_clearSearch(){this._filterText="",this.requestUpdate()}_renderHelperRow(e){return j`
      <tr>
        <td>
          <ha-icon icon="${e.icon||"mdi:cog"}" style="color: var(--primary-color);"></ha-icon>
        </td>
        <td>
          <div class="helper-name">${e.name}</div>
          <div class="helper-description">${e.description}</div>
        </td>
        <td>
          <span class="helper-entity-id">${e.entity_id}</span>
        </td>
        <td>
          <ha-assist-chip
            .label=${e.exists?"Exists":"Missing"}
            .type=${e.exists?"filled":"outlined"}
            .filled=${!0}
            style="
              --ha-assist-chip-filled-container-color: ${e.exists?"var(--success-color)":"var(--error-color)"};
              --md-assist-chip-label-text-color: white;
              --md-sys-color-on-surface: white;
            "
          >
            <ha-icon icon="${e.exists?"mdi:check-circle":"mdi:alert-circle"}" slot="icon"></ha-icon>
          </ha-assist-chip>
        </td>
        <td>
          ${e.exists?this._renderValueControl(e):"-"}
        </td>
        <td>
          ${e.exists?j`
            <ha-button
              @click=${()=>this._showMoreInfo(e.entity_id)}
            >
              <ha-icon slot="start" icon="mdi:magnify"></ha-icon>
              Inspect
            </ha-button>
          `:j`
            <ha-button
              @click=${()=>this._createHelper(e.key)}
            >
              <ha-icon slot="start" icon="mdi:plus"></ha-icon>
              Create
            </ha-button>
          `}
        </td>
      </tr>
    `}_renderValueControl(e){if("input_select"===e.domain){const t=this.hass?.states?.[e.entity_id]?.state||e.currentValue;return j`
        <ha-selector
          .hass=${this.hass}
          .selector=${{select:{options:e.ws_create_params.options.map(e=>({value:e,label:e})),mode:"dropdown"}}}
          .value=${t}
          @value-changed=${t=>this._setHelperValue(e.key,t.detail.value)}
        ></ha-selector>
      `}return"input_number"===e.domain?j`
        <ha-selector
          .hass=${this.hass}
          .selector=${{number:{min:e.ws_create_params.min,max:e.ws_create_params.max,step:e.ws_create_params.step,mode:"box",unit_of_measurement:e.ws_create_params.unit_of_measurement}}}
          .value=${e.currentValue}
          @value-changed=${t=>this._setHelperValue(e.key,t.detail.value)}
        ></ha-selector>
      `:"input_boolean"===e.domain?j`
        <ha-selector
          .hass=${this.hass}
          .selector=${{boolean:{}}}
          .value=${"on"===e.currentValue}
          @value-changed=${t=>{t.stopPropagation();const r=t.detail.value;ye("[ConfigPanel] Boolean selector changed:",{key:e.key,newValue:r,detail:t.detail}),this._setHelperValue(e.key,r)}}
        ></ha-selector>
      `:e.currentValue}_renderSoundTab(){return j`
      <lcards-sound-config-tab
        .hass=${this.hass}
      ></lcards-sound-config-tab>
    `}_renderThemeBrowserTab(){return j`
      <lcards-theme-token-browser-tab
        .hass=${this.hass}
        ._dialogOpen=${!0}
        ._inlineMode=${!0}
      ></lcards-theme-token-browser-tab>
    `}_renderPackExplorerTab(){return j`
      <lcards-pack-explorer-tab
        .hass=${this.hass}
        ._inlineMode=${!0}
      ></lcards-pack-explorer-tab>
    `}_renderYAMLTab(){const e=this._generateYAML();return j`
      <div class="card">
          <h2>
            <ha-icon icon="mdi:code-braces"></ha-icon>
            YAML Configuration
          </h2>
          <p>Copy this YAML to your Home Assistant <code>configuration.yaml</code> to manually create helpers:</p>

          <ha-button raised @click=${this._copyYAMLToClipboard}>
            <ha-icon icon="mdi:content-copy"></ha-icon>
            Copy to Clipboard
          </ha-button>

          <div class="yaml-output">${e}</div>
        </div>
    `}}customElements.define("lcards-config-panel",Ie)})();
//# sourceMappingURL=lcards-config-panel.js.map