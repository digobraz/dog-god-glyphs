function r(e){if(!e)return null;try{const n=e.replace(/-/g,"+").replace(/_/g,"/"),t=decodeURIComponent(escape(atob(n)));return JSON.parse(t)}catch{return null}}export{r as d};
