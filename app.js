const API =
"https://raw.githubusercontent.com/foridul422/IPTV-/main/channels.json";

let channels = [];
let favorites =
JSON.parse(localStorage.getItem("favorites")) || [];

const grid = document.getElementById("channelsGrid");

const searchInput =
document.getElementById("searchInput");

const categoryFilter =
document.getElementById("categoryFilter");

const countryFilter =
document.getElementById("countryFilter");

async function loadChannels() {

try{

const res = await fetch(API);
channels = await res.json();

document.getElementById("channelCount")
.innerText = channels.length;

populateFilters();

renderChannels(channels);

}catch(err){

console.error(err);

}

setTimeout(()=>{
document.getElementById("loader").style.display="none";
},1000);

}

function populateFilters(){

const categories =
[...new Set(channels.map(c=>c.category))];

const countries =
[...new Set(channels.map(c=>c.country))];

categories.forEach(cat=>{

const opt=document.createElement("option");
opt.value=cat;
opt.textContent=cat;
categoryFilter.appendChild(opt);

});

countries.forEach(country=>{

const opt=document.createElement("option");
opt.value=country;
opt.textContent=country;
countryFilter.appendChild(opt);

});

}

function renderChannels(data){

grid.innerHTML="";

data.forEach(channel=>{

const fav =
favorites.includes(channel.name);

const card=document.createElement("div");

card.className=
"channel-card glass";

card.innerHTML=`

<img
loading="lazy"
src="${channel.logo}"
class="channel-logo">

<h3>${channel.name}</h3>

<p>${channel.category}</p>

<p>${channel.country}</p>

<span class="live-badge">
LIVE
</span>

<div class="favorite">
${fav ? "★" : "☆"}
</div>

`;

card.addEventListener("click",()=>{

playChannel(channel);

});

card.querySelector(".favorite")
.addEventListener("click",(e)=>{

e.stopPropagation();

toggleFavorite(channel.name);

});

grid.appendChild(card);

});

}

function playChannel(channel){

document.getElementById("currentChannel")
.innerText = channel.name;

const video =
document.getElementById("video");

localStorage.setItem(
"recent",
JSON.stringify(channel)
);

if(Hls.isSupported()){

const hls = new Hls();

hls.loadSource(channel.url);

hls.attachMedia(video);

}else{

video.src = channel.url;

}

}

function toggleFavorite(name){

if(favorites.includes(name)){

favorites =
favorites.filter(x=>x!==name);

}else{

favorites.push(name);

}

localStorage.setItem(
"favorites",
JSON.stringify(favorites)
);

renderChannels(channels);

}

searchInput.addEventListener("input",filterChannels);
categoryFilter.addEventListener("change",filterChannels);
countryFilter.addEventListener("change",filterChannels);

function filterChannels(){

const search =
searchInput.value.toLowerCase();

const category =
categoryFilter.value;

const country =
countryFilter.value;

const filtered =
channels.filter(c=>{

const matchSearch =
c.name.toLowerCase().includes(search);

const matchCategory =
category==="all" ||
c.category===category;

const matchCountry =
country==="all" ||
c.country===country;

return (
matchSearch &&
matchCategory &&
matchCountry
);

});

renderChannels(filtered);

}

document
.getElementById("favoritesBtn")
.addEventListener("click",()=>{

const favChannels =
channels.filter(c=>
favorites.includes(c.name)
);

renderChannels(favChannels);

});

setInterval(()=>{

document.getElementById("clock")
.innerText =
new Date().toLocaleTimeString();

},1000);

loadChannels();
