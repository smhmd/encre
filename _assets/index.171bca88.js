var e,t;(t=e||(e={})).editor="editor-content",t.container="editor-container",t.block="editor-block",t.blockContent="editor-block-content";const n={readonly:!1,autofocus:!0,classes:{editor:"editor",container:"editor__container",block:"editor-block",focused:"editor-block--focused","block-content":"editor-block__content"}},r=["IMG"];function o(e){return"string"==typeof e}function i(e){return Array.isArray(e)}function c(e){return"object"==typeof e}function l(e){return"function"==typeof e}function s(e){return e.nodeType===Node.ELEMENT_NODE}function u(e){return s(e)&&!getComputedStyle(e).display.match(/(?:inline)/)}function a(e){return e.replace(/\B([A-Z])/,"-$1").toLowerCase()}function d(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function f(e){console.warn("[Encre Warn]: "+e)}class g extends Error{constructor(e=""){super("[Encre Error]: "+e)}}function p(e,t){if("object"!=typeof t)return{};const n=i(e)?[]:{};let r;for(let i in e){if(r=e[i],Object.prototype.hasOwnProperty.call(t,i)&&(o=r,l=t[i],typeof o==typeof l)){let e=t[i];c(e)&&(e=p(r,e)),r=e}n[i]=r}var o,l;return n}function h(e){const t=i(e)?[]:{};let n;for(let r in e)n=e[r],c(n)?t[r]=h(n):t[r]=n;return t}function m(e){let t,n=[];if(i(e))for(let t=0;t<e.length;t++)e[t]&&(n=n.concat(C(e[t])));else if(c(e))for(let r in e)t=e[r],t&&(n=n.concat(r.split(" ")));else n=n.concat(e.split(" "));return n}function b(e){let t,n={};if(i(e))for(let t=0;t<e.length;t++)e[t]&&(n=Object.assign({},n,b(e[t])));else if(c(e))n=e;else{let r,o,i;t=e.split(";");for(let e=0;e<t.length;e++)r=t[e],r.match(/([\S]+): ?([\S]+);?/)&&(o=a(RegExp.$1),i=RegExp.$2,o&&i&&(n[o]=i))}return n}function k(e,t){if(!s(e))return;let n;for(let r in t)switch(n=t[r],r){case"style":{const t=b(n);for(let n in t)e.style.setProperty(a(n),String(t[n]));break}case"class":{const t=m(n);e.className=t.reduce(((e,t)=>(-1!==e.indexOf(t)||e.push(t),e)),[]).join(" ");break}default:if(r.match(/on([A-Z].*)/)){let t;(t=RegExp.$1.toLowerCase())&&e.addEventListener(t,n,!1)}else e.setAttribute(r,n)}}function C(e){return void 0===e?[]:i(e)?e:[e]}function v(...e){const t=e.length;let n=document.createDocumentFragment();if(0===t)return n;if(!o(e[0]))return i(e[0])?(n.append(...e[0]),n):e[0];let r=o(e[0])?e[0]:"div";n=document.createElement(r);let c=[];if(t>=2){"[object Object]"===Object.prototype.toString.call(e[1])?k(n,e[1]):c=c.concat(C(e[1]));for(let n=2;n<t;n++)c=c.concat(C(e[n]))}return n.append(...c),n}function x(...e){let t;const n={};for(let r=0;r<e.length;r++){let o;t=e[r];for(let e in t)switch(o=t[e],e){case"class":case"style":{n[e]||(n[e]=[]);const t="class"===e?m(o):b(o);n[e]=n[e].concat(t);break}default:n[e]=t[e]}}return n}function y(){return window.getSelection()}function N(){let e;return(e=y())&&0!==e.rangeCount?e.getRangeAt(0):null}function E(e,t){let n;if(!(n=y()))return null;n.removeAllRanges();const r=document.createRange();return r.selectNodeContents(e),r.setStart(e,t),r.setEnd(e,t),r.collapse(!1),n.addRange(r),r}function B(e){return E(e,0)}function w(e){return E(e,e.textContent?.length||0)}function $(e,t){const n=[e];let r;for(;n.length>0;){if(!(r=n.shift()))return;if(t&&l(t)&&t.call(null,r))return r;for(let e=0;e<r.childNodes.length;e++)n.push(r.childNodes.item(e))}}function S(t,n){let r=t;for(;r;){if(n&&l(n)&&n.call(null,r))return r;if(s(t)&&(t.getAttribute("role")===e.container||"BODY"===t.tagName))return;r=r.parentNode}}function A(e){let t=e;for(;t;){if(!t.lastChild)return t;t=t.lastChild}return t}function O(e){let t=e;for(;t;){if(!t.firstChild)return t;t=t.firstChild}return t}function L(e){let t,n=e.cloneNode();u(e)&&(n=document.createDocumentFragment());for(let r=0;r<e.childNodes.length;r++)t=L(e.childNodes.item(r)),n.appendChild(t);return n}function _(e){return function(t){return t.getAttribute("role")===e}}const j=_(e.editor),D=_(e.block),R=_(e.blockContent);function q(e){return $(e,(e=>s(e)&&R(e)))}function T(e,t){let n,r,o,i,c=null;if(e.cursoringBlock&&(i=q(e.cursoringBlock))&&i.childElementCount>0&&!i.textContent?.length)return void function(e){let t,n;if(!(t=e.elm)||!(n=e.cursoringBlock))return;const r=e.renderNewBlock(),o=t.insertBefore(r,n.nextElementSibling);t.removeChild(n);const i=A(o);e.range=w(i)}(e);if(!((n=e.range)&&n.collapsed&&0===n.startOffset&&(r=e.cursoringBlock)&&(o=e.elm)&&(c=O(r))&&c.isSameNode(n.startContainer)))return;let l=r.previousElementSibling;if(!r.textContent?.length){if(!l){if(!q(r))return;const t=e.renderNewBlock();l=o.insertBefore(t,r.nextElementSibling)}o.removeChild(r)}if(!l)return;const s=A(l);s.textContent+=" ",e.range=w(s)}function F(e,t){switch(t.key){case"Enter":!function(e,t){let n,r,o,i,c,l;if(!((n=e.range)&&n.collapsed&&(r=S(n.startContainer,(e=>s(e)&&u(e))))&&(o=e.cursoringBlock)&&(i=e.elm)))return t.preventDefault();if(R(r)){t.preventDefault();const e=A(r);n.setEnd(e,e.textContent?.length||0),l=n.extractContents()}else{if(r.textContent?.length||!r.previousElementSibling||r.nextElementSibling)return;t.preventDefault(),r.parentElement?.removeChild(r)}c=i.insertBefore(e.renderNewBlock(l),o.nextElementSibling),e.range=B(A(c))}(e,t);break;case"Backspace":T(e);break;case"Tab":!function(e,t){let n;if(t.preventDefault(),!(n=e.range))return;const r=" ".repeat(4);n.collapsed||n.deleteContents(),n.insertNode(document.createTextNode(r)),n.collapse(!1),e.range=n}(e,t)}}function M(e){let t;(t=N())&&e.range!==t&&(e.range=t)}function P(e,t){if(function(e){return"#text"===e.nodeName}(e))return e.data;const n={_is_struct:!0,children:[]};let r,o;if(!s(e))return n;if(n.tag=e.tagName.toLowerCase(),r=function(e,t){let n;return!!(s(e)&&(n=e.getAttribute("feature"))&&Object.keys(t).includes(n))&&n}(e,t)){let e;n.feature=r,(e=t[r].tag)&&(n.tag=e)}else R(e)?n.feature="content":D(e)&&(n.feature="block");for(let i=0;i<e.attributes.length;i++)o=e.attributes.item(i),o&&(n.props||(n.props={}),r&&!Object.prototype.hasOwnProperty.call(t[r].props,o.name)||(n.props[o.name]=o.value));return n}function U(t,n,r,i){if(o(t))return document.createTextNode(t);let c,l=t.tag||"div",s=t.props||{};if(c=t.feature)if(Object.keys(n).includes(c.toLowerCase())){const e=n[c];e.tag&&(l=e.tag),s=x(t.props||{},e.props)}else{if(c.match(/(block)/i))return v("div",{role:e.block,class:r.block});c.match(/(content)/i)&&(s.role=e.blockContent,s.contenteditable=!0)}return i&&d(s,"contenteditable")&&(s.contenteditable=void 0),s.role===e.block&&(s.class=r.block),v(l,s)}let J=0;function K(t,c={},a=[]){const g=J++,m=function(e,...t){let n=e;for(let e=0;e<t.length;e++)n=p(n,t[e]);return n}(n,c),b=m.classes;let k,y,N,E,B;const O=[];const L=()=>{let e;(e=function(e,t){const n=[e];let r;for(;n.length>0;){if(!(r=n.pop()))return;if(t&&l(t)&&t.call(null,r))return r;for(let e=r.childNodes.length-1;e>=0;e--)n.push(r.childNodes.item(e))}}(t,(e=>s(e)&&R(e)&&!!e.getAttribute("contenteditable"))))&&(_.range=w(A(e)))},_={get disabled(){return!!m.readonly},get elm(){return $(t,(e=>s(e)&&j(e)&&e._uid===g))},get plugins(){return k},get range(){return E},set range(e){var t;(t=e)&&_.elm?.contains(t.commonAncestorContainer)&&S(t.commonAncestorContainer,(e=>s(e)&&R(e)))&&(E=e,(()=>{if(!E)return;const e=E.commonAncestorContainer,t=B;if(t&&t.contains(e))return;const n=S(e,(e=>s(e)&&D(e)));n&&(B=n,t?.classList.remove(b.focused),B.classList.add(b.focused))})(),function(){let e;for(let t=0;t<O.length;t++)e=O[t],e&&l(e)&&e.call(null)}(),(()=>{let e,t;if(B&&(e=q(B)))for(let n=0;n<e.childNodes.length;)t=e.childNodes.item(n),u(t)||r.includes(t.tagName)||t.textContent?.length?n++:e.removeChild(t)})())},onUpdate(e){e&&l(e)&&O.push(e)},get cursoringBlock(){return B},renderNewBlock(t="p",n={},r,i){let c="p",l=[];o(t)?c=t||"p":l=C(t),r&&(l=l.concat(C(r)));const s=v(c,x(n,m.readonly?{}:{contenteditable:!0},{role:e.blockContent}),l);if(i)for(let e in i)s[e]=i[e];return v("div",{class:m.classes?.block,role:e.block},s)},getJson(){let e;if(!(e=_.elm)||!y)return f("Editor element not found or features not specified"),[];const t=function(e,t){const n=[e],r=[],i=()=>r[r.length-1];let c,l,s,u,a,d={_is_struct:!0,children:[]};for(;n.length&&(c=n.pop());){if(u=i(),s=P(c,t),u&&u.childrenCount--,l=c.childNodes.length,0===l||o(s))u?u.struct.children.push(s):d=s;else{for(let e=l-1;e>=0;e--)n.push(c.childNodes.item(e));r.push({childrenCount:l,struct:s})}for(;(u=i())&&0===u.childrenCount;)(a=r.pop())&&((u=i())?u.struct.children.push(a.struct):d=a.struct)}return d}(e,y);return o(t)?[]:t.children},setJson(t){let n;if(!(n=_.elm))return f("editor element not found");const r=function(t,n,r,c){let l=document.createDocumentFragment();if(!i(t))return l;const s=t.reverse().filter((t=>t.props&&t.props.role===e.block||t.feature?.match(/(block)/i))),u=[{childrenCount:s.length,dom:document.createDocumentFragment()}];let a,d,f;const g=()=>u[u.length-1];for(;s.length&&(a=s.pop());){if(f=g(),d=U(a,n,r,c),f&&f.childrenCount--,o(a)||0===a.children.length)f?f.dom.append(d):l=d;else{for(let e=a.children.length-1;e>=0;e--)s.push(a.children[e]);u.push({childrenCount:a.children.length,dom:d})}for(;(f=g())&&0===f.childrenCount;){let e=u.pop();e&&((f=g())?f.dom.append(e.dom):l=e.dom)}}return l}(t,y,b,m.readonly);n.innerHTML="",n.append(r),m.readonly||L()}},{pluginMap:T,featureRecord:K}=function(e,t){let n,r,o;const i=new WeakMap,c={};for(let s=0;s<t.length;s++)if(n=t[s],l(n[0])){r=new n[0](e,...n[1]),i.set(n[0],r);for(let e=0;e<r.features.length;e++)o=r.features[e],c[o.name]={tag:o.tag,props:h(x(d(c,o.name)?c[o.name].props:{},o.props))}}return{pluginMap:i,featureRecord:c}}(_,a);k={get:e=>T.get(e)},y=K,N=m.readonly?{}:function(e){let t;return{onKeydown:n=>{t||(M(e),F(e,n))},onKeyup:()=>{t||M(e)},onCompositionstart:()=>{t=!0},onCompositionend:()=>{t=!1},onPointerdown:()=>{M(e)},onPointerup:t=>{M(e)}}}(_);const W=_.renderNewBlock(),Z=v("div",x({class:b.editor,role:e.editor},N),W);Z._uid=g;const G=v("div",{role:e.container,class:b.container,spellcheck:"false",tabindex:"-1"},Z);return t.appendChild(G),!m.readonly&&m.autofocus&&L(),_}let W=0;class Z{constructor(e){this.features=[],this.$editor=e,this._uid=++W}exec(){}isActive(){return!1}}const G={class:"editor-list"},H={class:"editor-list-item"};function I(t){const n=t?"ol":"ul",r={tag:n,name:n,props:{}},o={tag:"li",name:"li",props:{}};return class extends Z{constructor(t,n={},i={}){super(t),this.features=[],r.props=x(G,n,{feature:r.name,contenteditable:!0,role:e.blockContent}),o.props=x(H,i,{feature:o.name}),this.features=[r,o]}exec(){const{cursoringBlock:e,elm:i}=this.$editor;let c,l;if(this.$editor.disabled||!i||!e||!(c=q(e))||c.tagName===n.toUpperCase())return;const s=document.createDocumentFragment();let u={};if(c.tagName===(t?"UL":"OL")){let e;for(let t=0;t<c.attributes.length;t++)e=c.attributes.item(t),e&&(u[e.name]=e.value);u.feature=r.name,s.append(...c.childNodes)}else{u=r.props;const e=L(c);s.append(v("li",o.props,e))}const a=this.$editor.renderNewBlock(n,u,s);l=e.nextElementSibling,i.removeChild(e);const d=A(i.insertBefore(a,l));this.$editor.range=w(d)}isActive(){let e;return!!(e=this.$editor.range)&&Boolean(S(e.commonAncestorContainer,(e=>s(e)&&R(e)&&e.getAttribute("feature")===r.name)))}}}const Y=I(!0),z=I();function Q(e){return class extends Z{constructor(e){super(e),this.features=[]}exec(t){this.$editor.disabled||(document.execCommand(e,!1,t),this.$editor.range=N())}isActive(){return document.queryCommandState(e)}}}const V=Q("bold"),X=Q("italic"),ee=Q("underline"),te=Q("strikeThrough");function ne(t="p",n={},r=""){return r||(r=t),class extends Z{constructor(o,i={}){super(o),this.features=[{tag:t,name:r,props:x(n,i,{role:e.blockContent,feature:r,contenteditable:!0})}]}exec(){if(this.$editor.disabled)return;let e,n,r;if(!(e=this.$editor.elm)||!(n=this.$editor.cursoringBlock)||!(r=q(n)))return;if(r.tagName===t.toUpperCase())return;const o=t,i=L(r);let c=this.$editor.renderNewBlock(o,this.features[0].props,i);c=e.insertBefore(c,n.nextElementSibling);const l=A(c);e.removeChild(n),this.$editor.range=w(l)}isActive(){let e;return!!(e=this.$editor.range)&&Boolean(S(e.commonAncestorContainer,(e=>s(e)&&R(e)&&e.getAttribute("feature")===r)))}}}const re=ne("p",{},"paragraph"),oe=ne("blockquote",{},"blockquote"),ie=(ne("h1",{},"heading-1"),ne("h2",{},"heading-2"));ne("h3",{},"heading-3"),ne("h4",{},"heading-4"),ne("h5",{},"heading-5");function ce(e,t){return class extends Z{constructor(t,n={}){super(t),this._props=x(e,n)}exec(){if(this.$editor.disabled)return;let e,t;if(!(e=this.$editor.range)||!(t=S(e.commonAncestorContainer,(e=>s(e)&&R(e)))))return;k(t,this._props);const n=A(t);this.$editor.range=w(n)}isActive(){return!1}}}const le=ce({style:"text-align: left;"}),se=ce({style:"text-align: center;"}),ue=ce({style:"text-align: right;"});const ae=function(){const e={src:"",alt:"",class:"editor-image",feature:"image"};return class extends Z{constructor(t,n="img",r={}){super(t),this.features=[{tag:n,name:e.feature,props:x(e,r)}]}exec(t){if(this.$editor.disabled)return;let n,r,o;if(!(o=this.$editor.elm)||!(n=this.$editor.range)||!(r=this.$editor.cursoringBlock))return;n.collapsed||n.deleteContents();const i=A(r);n.setEnd(i,i.textContent?.length||0);const c=x(e,{src:t}),l=v(this.features[0].tag||"div",c),s=r.nextElementSibling,u=this.$editor.renderNewBlock([l]),a=this.$editor.renderNewBlock(L(n.extractContents()));let d=o.insertBefore(u,s);d=o.insertBefore(a,d.nextElementSibling);const f=O(d);this.$editor.range=B(f)}isActive(){return!1}}}();const de=function(){const e=[],t={use:(n,...r)=>(e.push([n,r||[]]),t),mount(t,n={}){const r=o(t)?document.querySelector(t):t;if(!r)throw new g(`No Such Element "${t}"`);return K(r,n,e)}};return t}().use(z,{},{class:"list-item"}).use(Y).use(X).use(V).use(te).use(ee).use(ie).use(re).use(oe).use(le).use(se).use(ue).use(ae).mount("#content");function fe(e,t){!function(e,t){document.querySelector(e)?.addEventListener("click",(()=>{de.plugins.get(t)?.exec()}),!1)}(e,t),de.onUpdate((()=>{!function(e,t,n="active"){let r,o=document.querySelector(e);o&&(r=de.plugins.get(t))&&(r.isActive()?o.classList.add(n):o.classList.remove(n))}(e,t)}))}de.setJson(JSON.parse(JSON.stringify([{feature:"block",children:[{feature:"heading-2",children:["Encre Editor"]}]},{feature:"block",children:[{feature:"content",children:[{tag:"b",children:["content"]},"yes"]}]},{feature:"block",children:[{feature:"content",children:["This is a navie rich text"]}]}]))),fe("#ul",z),fe("#ol",Y),fe("#bold",V),fe("#italic",X),fe("#underline",ee),fe("#strike-through",te),fe("#heading",ie),fe("#blockquote",oe),fe("#paragraph",re),fe("#align-left",le),fe("#align-center",se),fe("#align-right",ue),function(){const e=document.querySelector("#img-input");e&&(document.querySelector("#img")?.addEventListener("click",(()=>{e.click()}),!1),e.addEventListener("change",(e=>{const t=e.target.files;if(!t)return;let n;for(let e=0;e<t.length;e++)if(n=t.item(e)){const e=new FileReader;e.onload=function(e){de.plugins.get(ae)?.exec(e.target?.result?.toString())},e.readAsDataURL(n)}e.target.value=""})))}();
