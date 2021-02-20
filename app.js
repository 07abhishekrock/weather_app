let url_ip_to_city = 'https://ipwhois.app/json/';
let open_weather_key = `190ef75e362df4cab6d7dfd22afdc62d`;
let data = [];


//variable declaration
let section = document.querySelector('section');
let icon_line = document.getElementById('icon_line');
let temp_reading = document.getElementById('reading');
let unit = document.getElementById('unit');
let humid_reading = document.getElementById('humid_reading');
let airP_reading = document.getElementById('pressure_reading');
let ppt_reading = document.getElementById('ppt_reading');

let search_icon = document.querySelector('button.search_icon:last-child');
let inherent_search_icon = document.querySelector('button.search_icon');
let search_statement = document.querySelector('span.statement');
let search_location = document.querySelector('span.location');
let input_placeholder = document.querySelector('input.input');
let loading_window = document.querySelector('div.loading_bg');
let list_search = document.querySelector('ul.search_container');
let list_container = list_search.parentNode;
let map = document.querySelector('div.map');
//end variable



//utility functions
function set_bg_weather(text){
let weather = document.querySelector('div.weather_container');  
let width = weather.offsetWidth;
let height = weather.offsetHeight;
let unsplash_url =`https://source.unsplash.com/${width}x${height}/?nature,city,${text}` ;
weather.style.backgroundImage = `url('${unsplash_url}')`
}
function return_url_openweather(lat,long){
return `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${open_weather_key}&units=metric`;
}
function return_location_static(lat,long,width,height){
  return `https://maps.locationiq.com/v2/staticmap?key=pk.bf20e49e1f210c97224345e22a685062&center=${lat},${long}&zoom=13&size=${width}x${height}&markers=icon:large-blue-cutout|${lat},${long}`
}
function resize_section(){
  if(window.innerHeight < 700){
    section.style.height = "700px";
  }
  else{
    section.style.height = "100vh";
  }
  if(window.innerWidth < 600 && window.innerHeight < 700){
    section.style.height = "100vh";
  }
}
function return_url_autocomplete(query){
  return `https://api.locationiq.com/v1/autocomplete.php?key=pk.bf20e49e1f210c97224345e22a685062&q=${query}`;
}
function toF(temp){
  return (temp*1.8 + 32).toFixed(1);
}
//ends here

function initial_setup(){
  resize_section();
  load_ip();
}
async function load_ip(){
  const response = await fetch(url_ip_to_city, {
    method : 'GET',
    headers : {
      'Content-Type': 'application/json'
    }
  });
  const json = await response.json();
  map.setAttribute('lat',json.latitude);
  map.setAttribute('long', json.longitude);
  search_icon.setAttribute('selected',`${json.city}, ${json.region}`);
  load_weather();
  generate_map_values();
}
function change_weather_stats(temp,humidity,airP,ppt,one_line){
  icon_line.innerHTML = one_line;
  temp_reading.innerHTML = temp;
  temp_reading.setAttribute('C', temp);
  temp_reading.setAttribute('F', toF(temp));
  airP_reading.innerHTML = airP;
  humid_reading.innerHTML = humidity;
  ppt_reading.innerHTML = ppt;
  search_location.innerHTML = search_icon.getAttribute('selected');
  set_bg_weather(one_line);
}
function load_weather(){
  let xhttp = new XMLHttpRequest();
  let lat = map.getAttribute('lat');
  let long = map.getAttribute('long');
  xhttp.open('GET',return_url_openweather(lat,long));
  xhttp.onload = function(){
    data = JSON.parse(xhttp.response);
    console.log(data);
    console.log(data.weather[0].description);
    change_weather_stats(data.main.temp,data.main.humidity,data.main.pressure,data.wind.speed,data.weather[0].description);
  }
  xhttp.send();
}

function load_image(lat,long){
  return return_location_static(lat,long);
}
function load_search_text(){
  list_container.classList.toggle('default');

if(search_icon.getAttribute('index') === "1"){
  search_statement.innerHTML = 'Your Location is |';
  search_location.innerHTML = search_icon.getAttribute('selected');
  search_statement.classList.remove('placeholder');
  input_placeholder.classList.remove('enable');
  search_icon.setAttribute('index', 0);
  search_icon.children[0].style.opacity = 0;
  inherent_search_icon.classList.add('disable');
  input_placeholder.value = '';
  return;
}
  search_statement.innerHTML = 'Start Typing your Location';
  search_location.innerHTML = '';
  search_statement.classList.add('placeholder');
  input_placeholder.classList.add('enable');
  //set background-image of search icon back to cross
  search_icon.children[0].style.opacity = 1;
  search_icon.setAttribute('index', "1");
  inherent_search_icon.classList.remove('disable');
}
function loading_window_load(){
  loading_window.classList.add('visible');
  list_search.classList.add('disable');
}
function loading_window_disable(){
  loading_window.classList.remove('visible');
  list_search.classList.remove('disable');
}
function create_list_item(text,code,lat,long){

  list_item = document.createElement("li");  
  list_item.classList.add('place');
  list_item.setAttribute('lat', lat);
  list_item.setAttribute('long', long);
  span = document.createElement('span');
  span.innerHTML = text;
  div = document.createElement('div');
  div.innerHTML = code;
  list_item.appendChild(span);
  list_item.appendChild(div);
  list_search.appendChild(list_item);

}
function flush_list_items(){
  while(list_search.firstChild){
    list_search.removeChild(list_search.firstChild);
  }
}
function load_autocomplete(text){
  if(text.length = 0){
    console.log(text);
    flush_list_items();
    return;
  }
  let url = return_url_autocomplete(text);
  let xhttp = new XMLHttpRequest();
  xhttp.open('GET',url);
  xhttp.onreadystatechange = function(){
    console.log(xhttp.readyState);
    if(xhttp.readyState === 2){
      loading_window_load();
    }
  }
  xhttp.onload = function(){
    loading_window_disable();
    flush_list_items();
    console.log(list_search.children.length);
    let response = JSON.parse(xhttp.response);
    for(let i=0;i<response.length;i++){
    create_list_item(`${response[i].address.name},${response[i].address.country}`,response[i].address.country_code,response[i].lat, response[i].lon);
    }
  }
  xhttp.send();
}
function generate_map_values(){
  let dim = [map.offsetWidth, map.offsetHeight];
  let lat = map.getAttribute('lat');
  let long = map.getAttribute('long');
  map.style.backgroundImage = `url(${return_location_static(lat,long,dim[0],dim[1])})`;

}
//events 
unit.onclick = function(){
  if(unit.getAttribute('type')==='C'){
    unit.innerHTML = 'Fahrenheit';
    temp_reading.innerHTML = temp_reading.getAttribute('F');
    unit.setAttribute('type','F');
  }
  else{
    unit.innerHTML = 'Celsius';
    temp_reading.innerHTML = temp_reading.getAttribute('C');
    unit.setAttribute('type','C');
  }
}


search_icon.addEventListener('click', (e)=>{
  load_search_text();
});

input_placeholder.addEventListener('input',(e)=>{
search_statement.innerHTML = '';
search_location.innerHTML = '';
})
inherent_search_icon.addEventListener('click',(e)=>{
  let text = input_placeholder.value;
  loading_window_load();
  load_autocomplete(text);
})
list_search.addEventListener('click', function(e){
  if(e.target.classList[0]==="place" || e.target.parentNode.classList[0] === "place"){
    if(e.target.classList[0] === "place"){
      map.setAttribute('lat',e.target.getAttribute('lat'));
      map.setAttribute('long',e.target.getAttribute('long'));
      generate_map_values();
      load_weather();
      search_icon.setAttribute('selected',e.target.children[0].innerHTML);
      search_location.innerHTML = search_icon.getAttribute('selected');
    }
  }
})
//end of events


//set window height based on the resize
window.onload = initial_setup();
window.addEventListener('resize', ()=>{
  resize_section();
  generate_map_values();
})
//end resize code 