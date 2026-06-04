const CHANNELS_FILE = "./channels.json";

let channels = [];
let filteredChannels = [];

const player = document.getElementById("video");
const channelGrid = document.getElementById("channelsGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const countryFilter = document.getElementById("countryFilter");
const currentChannel = document.getElementById("currentChannel");
const channelCount = document.getElementById("channelCount");

let favorites =
JSON.parse(localStorage.getItem("favorites")) || [];

let recent =
JSON.parse(localStorage.getItem("recentlyWatched")) || [];

async function loadChannels() {

try {

showSkeleton();

const response = await fetch(CHANNELS_FILE);

channels = await response.json();

filteredChannels = [...channels];

populateFilters();

renderChannels(filteredChannels);

channelCount.textContent = channels.length;

hideLoader();

} catch (err) {

console.error(err);

channelGrid.innerHTML =
"<h2>Failed to load channels.</h2>";

}

}

function populateFilters() {

const categories =
[...new Set(channels.map(x => x.category))];

const countries =
[...new Set(channels.map(x => x.country))];

categories.forEach(cat => {

const option =
document.createElement("option");

option.value = cat;
option.textContent = cat;

categoryFilter.appendChild(option);

});

countries.forEach(country => {

const option =
document.createElement("option");

option.value = country;
option.textContent = country;

countryFilter.appendChild(option);

});

}

function renderChannels(data) {

channelGrid.innerHTML = "";

if(data.length === 0){

channelGrid.innerHTML =
"<h3>No Channels Found</h3>";

return;

}

data.forEach(channel => {

const card =
document.createElement("div");

card.className =
"channel-card glass fade-in";

const isFav =
favorites.includes(channel.name);

card.innerHTML = `

<div class="favorite"
data-name="${channel.name}">
${isFav ? "★" : "☆"}
</div>

<div class="live-badge">
LIVE
</div>

<img
class="channel-logo"
loading="lazy"
src="${channel.logo}"
alt="${channel.name}"
>

<div class="channel-name">
${channel.name}
</div>

<div class="channel-category">
${channel.category}
</div>

<div class="channel-category">
${channel.country}
</div>

`;

card.addEventListener("click", () => {
playChannel(channel);
});

card
.querySelector(".favorite")
.addEventListener("click", e => {

e.stopPropagation();

toggleFavorite(channel.name);

});

channelGrid.appendChild(card);

});

}

function playChannel(channel) {

currentChannel.textContent =
channel.name;

saveRecent(channel);

if(Hls.isSupported()) {

const hls = new Hls();

hls.loadSource(channel.url);

hls.attachMedia(player);

hls.on(Hls.Events.MANIFEST_PARSED,
function() {

player.play();

});

} else {

player.src = channel.url;

player.play();

}

}

function toggleFavorite(name) {

if(favorites.includes(name)) {

favorites =
favorites.filter(x => x !== name);

} else {

favorites.push(name);

}

localStorage.setItem(
"favorites",
JSON.stringify(favorites)
);

renderChannels(filteredChannels);

}

function saveRecent(channel) {

recent =
recent.filter(
x => x.name !== channel.name
);

recent.unshift(channel);

recent = recent.slice(0,20);

localStorage.setItem(
"recentlyWatched",
JSON.stringify(recent)
);

}

function filterChannels() {

const search =
searchInput.value.toLowerCase();

const category =
categoryFilter.value;

const country =
countryFilter.value;

filteredChannels =
channels.filter(channel => {

const searchMatch =
channel.name
.toLowerCase()
.includes(search);

const categoryMatch =
category === "all" ||
channel.category === category;

const countryMatch =
country === "all" ||
channel.country === country;

return (
searchMatch &&
categoryMatch &&
countryMatch
);

});

renderChannels(filteredChannels);

}

function showFavorites() {

const favChannels =
channels.filter(channel =>
favorites.includes(channel.name)
);

renderChannels(favChannels);

}

function showRecent() {

renderChannels(recent);

}

function showSkeleton() {

channelGrid.innerHTML = "";

for(let i=0;i<12;i++){

const div =
document.createElement("div");

div.className =
"channel-card skeleton";

div.style.height = "220px";

channelGrid.appendChild(div);

}

}

function hideLoader() {

const loader =
document.getElementById("loader");

if(loader){

setTimeout(() => {

loader.style.display = "none";

},700);

}

}

function startClock() {

const clock =
document.getElementById("clock");

if(!clock) return;

setInterval(() => {

clock.textContent =
new Date().toLocaleTimeString();

},1000);

}

searchInput?.addEventListener(
"input",
filterChannels
);

categoryFilter?.addEventListener(
"change",
filterChannels
);

countryFilter?.addEventListener(
"change",
filterChannels
);

document
.getElementById("favoritesBtn")
?.addEventListener(
"click",
showFavorites
);

document
.getElementById("recentBtn")
?.addEventListener(
"click",
showRecent
);

document
.getElementById("allChannelsBtn")
?.addEventListener(
"click",
() => renderChannels(channels)
);

startClock();

loadChannels();
