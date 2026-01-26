window.addEventListener("DOMContentLoaded",()=>{

if(typeof GridStack==="undefined"){alert("GridStack missing");return}

let grid=GridStack.init({cellHeight:80,margin:10,float:true,disableResize:true})
grid.enableMove(false)

let tiles=[]
let currentType=null
let selectedSize={w:2,h:2}

const addBtn=addBtn=document.getElementById("addBtn")
const addMenu=document.getElementById("addMenu")
const panel=document.getElementById("panel")
const backdrop=document.getElementById("backdrop")
const tileForm=document.getElementById("tileForm")
const dynamic=document.getElementById("dynamicFields")

addBtn.onclick=()=>addMenu.classList.toggle("is-open")

document.querySelectorAll(".menu__item").forEach(b=>{
b.onclick=()=>{
currentType=b.dataset.type
panel.classList.add("is-open")
dynamic.innerHTML=""
dynamic.append(document.getElementById("tpl-"+currentType).content.cloneNode(true))
}
})

document.querySelectorAll(".size").forEach(s=>{
s.onclick=()=>{
selectedSize={w:+s.dataset.w,h:+s.dataset.h}
}
})

tileForm.onsubmit=e=>{
e.preventDefault()
const data=Object.fromEntries(new FormData(tileForm))
grid.addWidget({
w:selectedSize.w,
h:selectedSize.h,
content:`<div class="gridstack-item-content">
<img class="tileMedia" src="${data.mediaUrl||''}">
</div>`
})
panel.classList.remove("is-open")
}

})
