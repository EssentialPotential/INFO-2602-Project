let url='http://127.0.0.1:8080';
let server='http://127.0.0.1:8080';
const appID = '09922bc4';
const appKey = '7b4e785f51b5bdfb12595b7b385b35a6';
let query = '';
let search = '';
let recipes=[];
let dbingredients=[];
let items=[];
let myingred=[];
let have=[];
let missing=[];
let x= document.getElementById("signup");
let y= document.getElementById("login");
let z= document.getElementById("btn");

function loginBtn(){
  x.style.left= "-400px";
  y.style.left= "50px";
  z.style.left= "110px";
}

function signupBtn(){
  x.style.left= "50px";
  y.style.left= "450px";
  z.style.left= "0px";
}

async function signUp(url, data){
  try{ 
    let response = await fetch(
      url, 
      {
        method: 'POST',
        body: JSON.stringify(data),//convert data to JSON string
        headers: {'Content-Type':'application/json'}// JSON data
      },
    );//1. Send http request and get response
     
    let result = await response.text();//2. Get message from response
    loginBtn();
    alert(result);
  }catch(error){
    alert(error);
    console.log(error);//catch and log any errors
  }
}

async function logIn(url, data){
  try{ 
    let response = await fetch(
      url, 
      {
        method: 'POST',
        body: JSON.stringify(data),//convert data to JSON string
        headers: {'Content-Type':'application/json'}// JSON data
      },
    );//1. Send http request and get response
    
    let result = await response.json();//2. Get message from response
    if(result.hasOwnProperty('access_token')){
      window.localStorage.setItem("access_token",result.access_token);
      let token = window.localStorage.getItem("access_token");
      homePage(`${server}/home`, token);
    }else{
      alert(result.description);//3. Do something with the message
      console.log(result);
    }
  }catch(error){
    alert(error);
    console.log(error);//catch and log any errors
  }
}

async function homePage(url, token){
  try{ 
    let response = await fetch(
      url, 
      {
        method: 'GET',
        headers: {'Content-Type':'application/json',
                  'Authorization':`jwt ${token}`}// JSON data
      },
    );
    let result=await response;
    window.location.replace(result.url);
    console.log(token);
  }catch(e){
    console.log(e);
  }
}

function signUpSubmit(event){
    event.preventDefault();//prevents page redirection
        
    //event target returns the element on which the event is fired upon ie event.target === myForm
   
    //get data from form using elements property
    let myform = event.target.elements;
    let chkbx= document.getElementById("chkbx");
    let cpassword= myform['cpassword'].value;
   
    let data = {
      name: myform['name'].value,
      email: myform['email'].value,
      password: myform['password'].value
    }

    if(data.password !== cpassword){
      alert("Passwords Do Not Match.");
      return false;
    } else if(chkbx.checked!==true){
      alert("Please agree to terms & conditions.");
      return false;
    }
    signUp(`${url}/signup`,data);
    console.log(data);
}

function logInSubmit(event){
    event.preventDefault();//prevents page redirection
        
    //event target returns the element on which the event is fired upon ie event.target === myForm
   
    //get data from form using elements property
    let myform = event.target.elements;
   
    let data = {
      username: myform['name'].value,
      password: myform['password'].value
    }
   
    logIn(`${url}/auth`,data);
}

async function getRecipes(){
  try{
    let response = await fetch(`https://api.edamam.com/search?q=${query}&app_id=${appID}&app_key=${appKey}`);
    let data = await response.json();
    for(let i=0;i<data.hits.length;i++){
      let id=data.hits[i].recipe.label;
      let recipe=data.hits[i].recipe;
      let ringredients=[];
      let ingredients = data.hits[i].recipe.ingredients;
      let count = ingredients.length;
      for(let i=0;i<count;i++){
        ringredients.push(ingredients[i].text);
      }
      let obj={"id":id, "recipe":recipe, "ingredients":ringredients};
      recipes.push(obj);
    }
    displayRecipes(recipes);
  }
  catch(e){
    console.log(e);
  }
}

function goTo(link){
  window.open(link);
}

function displayRecipes(records){
  let res = document.querySelector('#recipes');
  res.innerHTML = ``;
  for (i=0;i<records.length;i++){
    let ingredients=records[i].ingredients;
    res.innerHTML += `
      <div class="recipe" id="${records[i].id}">
      <h3>${records[i].id}</h3>
      <img class="image" src="${records[i].recipe.image}"/>
      <p>Cautions: ${records[i].recipe.cautions}</p>
      <p>Diet Labels: ${records[i].recipe.dietLabels}</p>
      <p>Health Labels: ${records[i].recipe.healthLabels}</p>
      <div class="btns">
      <button onclick="recipeSubmit('${records[i].id}')">Save Recipe</button>
      <button onclick="goTo('${records[i].recipe.url}')">View Recipe</button>
      <button onclick="viewIngredients('${records[i].id}')">View Ingredients</button>
      </div>
      </div>
    `;
  }
}

async function getDB(){
  let url=`${server}/ingredient`;
  try{ 
    let token=window.localStorage.getItem("access_token");
    let response = await fetch(
      url, 
      {
        method: 'GET',
        headers: {'Content-Type':'application/json',
                  'Authorization':`jwt ${token}`}// JSON data
      },
    );
    let result=await response.json();
    dbingredients=result;
  }catch(e){
    console.log(e);
  }
}

function setSearch(e){
  search = e.target.value;
}
function getSearch(e){
  recipes=[];
  e.preventDefault();
  for(let i=0;i<dbingredients.length;i++){
    if(search==dbingredients[i].name){
      query = search;
      getRecipes();
    }
  }
  if(query!=search){
    alert("That recipe is not in our database at the moment please try another search.");
  }
}

function recipeSubmit(recipe){
  let name;
  let img;
  let url;
  let ingredients;

  for(let i=0;i<recipes.length;i++){
    if(recipes[i].id==recipe){
      name = recipes[i].recipe.label;
      img = recipes[i].recipe.image;
      url = recipes[i].recipe.url;
      ingredients = recipes[i].ingredients.toString();
    }
  }   
  let data = {
    name: name,
    img: img,
    recipeUrl: url,
    ingredients: ingredients
  }
  addRecipe(`${server}/recipes`, data);
}

async function addRecipe(url, data){
  let token=window.localStorage.getItem("access_token");
  try{
    let response =await fetch(
      url,
      {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type':'application/json',
                    'Authorization':`jwt ${token}`}// JSON data
      },
    );
    let result = await response.text();
    alert(result);
  }catch(error) {
    alert(error);
    console.log(error);
  }
}

async function delRecipe(name){
  let url=`${server}/recipes/${name}`;
  try{ 
    let token=window.localStorage.getItem("access_token");
    let response = await fetch(
      url, 
      {
        method: 'DELETE',
        headers: { 'Content-Type':'application/json',
                    'Authorization':`jwt ${token}`}// JSON data
      },
    );//1. Send http request and get response
    
    let result = await response.text();//2. Get message from response
    alert(result);//3. Do something with the message
    getRecipeList();
  }catch(error){
    alert(error);
    console.log(error);//catch and log any errors
  }
}

function viewIngredients(name){
  let res = document.getElementById(`${name}`);
  res.innerHTML=``;
  res.innerHTML=`<h3>${name}</h3>`;
  let ingredients=[];
  let url='';
  for(let i=0;i<recipes.length;i++){
    if(recipes[i].id===name){
      ingredients=recipes[i].ingredients;
      url=recipes[i].recipe.url;
    }
  }
  for(let i=0;i<ingredients.length;i++){
    res.innerHTML+=`<div id="ing">
                      <p>${ingredients[i]}</p>
                      <button id="add" type="submit" onclick="getIngredient('${ingredients[i]}')">+</button>
                    </div>`;
  }
  res.innerHTML+=`<div class="btns">
                    <button onclick="goTo('${url}')">View Recipe</button>
                    <button onclick="reDraw('${name}')">View Info</button>
                  </div>`;
}

function reDraw(name){
  let res=document.getElementById(`${name}`);
  res.innerHTML=``;
  for(let i=0;i<recipes.length;i++){
    if(recipes[i].id==name){
      let ingredients=recipes[i].ingredients;
      res.innerHTML += `
      <h3>${recipes[i].id}</h3>
      <img class="image" src="${recipes[i].recipe.image}"/>
      <p>Cautions: ${recipes[i].recipe.cautions}</p>
      <p>Diet Labels: ${recipes[i].recipe.dietLabels}</p>
      <p>Health Labels: ${recipes[i].recipe.healthLabels}</p>
      <div class="btns">
      <button onclick="recipeSubmit('${recipes[i]}')">Save Dish</button>
      <button onclick="goTo('${recipes[i].recipe.url}')">View Recipe</button>
      <button onclick="viewIngredients('${recipes[i].id}')">View Ingredients</button>
      </div>
    `;
    }
  }
}

async function getRecipeList(){
  let res=document.querySelector('#canvas');
  res.innerHTML='';
  let url=`${server}/recipes`;
  try{ 
    let token=window.localStorage.getItem("access_token");
    let response = await fetch(
      url, 
      {
        method: 'GET',
        headers: {'Content-Type':'application/json',
                  'Authorization':`jwt ${token}`}// JSON data
      },
    );
    let result=await response.json();
    drawList(result);
  }catch(e){
    console.log(e);
  }
}

function drawList(recipes){
  let res=document.querySelector('#listing');
  res.innerHTML='';
  res.innerHTML=`<h3>My Recipes</h3><br>`;
  if(recipes.length==0){
    res.innerHTML+=`<p>There are currently no recipes in your list.</p><br>
                    <p>Go to the home tab to add recipes to view here.</p>`;
  }else{
    res.innerHTML+=`<ul id=recipe>`;
    for(let i=0;i<recipes.length;i++){
      res.innerHTML+=`<li class="rcp"><a onclick="getRecipe('${recipes[i].name}')">${recipes[i].name}</a></li><br>`;
    }
    res.innerHTML+=`</ul>`;
  }
}

async function getRecipe(name){
  myingred=[];
  items=[];
  let url=`${server}/recipes/${name}`;
  try{ 
    let token=window.localStorage.getItem("access_token");
    let response = await fetch(
      url, 
      {
        method: 'GET',
        headers: {'Content-Type':'application/json',
                  'Authorization':`jwt ${token}`}// JSON data
      },
    );
    let result=await response.json();
    showRecipe(result);
  }catch(e){
    console.log(e);
  }
}

function showRecipe(recipe){
  let res = document.querySelector('#canvas');
  res.innerHTML='';
  res.innerHTML+=`<div id="view">
                    <h2>${recipe.name}</h2>
                    <img class="image" src="${recipe.image}"/>
                    <p>Recipe ID: ${recipe.rid}</p>
                    <p>Recipe URL: ${recipe.recipe}</p>
                    <p>Recipe Ingredients: ${recipe.ingredients}</p>
                    <div class="btns">
                      <button id="del" type="submit" onclick="compare('${recipe.name}','${recipe.ingredients}')">Compare Ingredients</button>
                      <button id="del" type="submit" onclick="delRecipe('${recipe.name}')"><i class="fa fa-trash"></i> Delete</button>
                    </div>
                  </div>`;
}

function ingredientUpdate(){
  let myform = document.getElementById('addIngred');
  let name = myform['name'].value;
  if(name == ''){
    alert("Please enter the name of the ingredient you would like to update.");
    return false
  }
  let data = {
    qty: myform['qty'].value
  }
  updateIngredient(`${url}/ingredients/${name}`,data);
}

async function updateIngredient(url,data){
  try{ 
    let token=window.localStorage.getItem("access_token");
    let response = await fetch(
      url, 
      {
        method: 'PUT',
        body: JSON.stringify(data),//convert data to JSON string
        headers: { 'Content-Type':'application/json',
                    'Authorization':`jwt ${token}`}// JSON data
      },
    );//1. Send http request and get response
    
    let result = await response.text();//2. Get message from response
    alert(result);//3. Do something with the message
    console.log(result);
    getIngredientList();
  }catch(error){
    alert(error);
    console.log(error);//catch and log any errors
  }
}

function ingredientSubmit(event){
  event.preventDefault();//prevents page redirection

  let myform = event.target.elements;
  let data = {
    name: myform['name'].value.replace(/\s+/g, '').toLowerCase(),
    qty: myform['qty'].value
  }
  addIngredient(`${url}/ingredients`,data);
}

async function addIngredient(url, data){
  try{ 
    let token=window.localStorage.getItem("access_token");
    let response = await fetch(
      url, 
      {
        method: 'POST',
        body: JSON.stringify(data),//convert data to JSON string
        headers: { 'Content-Type':'application/json',
                    'Authorization':`jwt ${token}`}// JSON data
      },
    );//1. Send http request and get response
    
    let result = await response.text();//2. Get message from response
    alert(result);//3. Do something with the message
    console.log(result);
    getIngredientList();
  }catch(error){
    alert(error);
    console.log(error);//catch and log any errors
  }
}

async function getIngredientList(){
  let url=`${server}/ingredients`;
  document.forms['addIngred'].addEventListener('submit',ingredientSubmit);
  try{ 
    let token=window.localStorage.getItem("access_token");
    let response = await fetch(
      url, 
      {
        method: 'GET',
        headers: {'Content-Type':'application/json',
                  'Authorization':`jwt ${token}`}// JSON data
      },
    );
    let result=await response.json();
    console.log(result);
    showIngredients(result);
    console.log(token);
  }catch(e){
    console.log(e);
  }
}

function showIngredients(ingredients){
  let res = document.querySelector('#ingredients');
  res.innerHTML=`<h3>My Ingredients</h3><br>`;
  if(ingredients.length==0){
    res.innerHTML+=`<p>There are currently no ingredients in your list.</p><br>
                    <p>Please click the Add Ingredients button to the left to add an ingredient manually or view a recipe's ingredients
                    and click the + button.</p>`;
  }else{
    res.innerHTML+=`<ul id=ingred>`;
    for(let i=0;i<ingredients.length;i++){
      res.innerHTML+=`<li class="listItem"><a>${ingredients[i].quantity}</a><a>  </a><a>${ingredients[i].name}</a>
                      <button id="delI" type="submit" onclick="delIngredient('${ingredients[i].name}')"><i class="fa fa-trash"></i></button></li><br>`;
    }
    res.innerHTML+=`</ul>`;
  }
}

async function getIngredient(line){
  dbingredients=[];
  let url=`${server}/ingredient`;
  try{ 
    let token=window.localStorage.getItem("access_token");
    let response = await fetch(
      url, 
      {
        method: 'GET',
        headers: {'Content-Type':'application/json',
                  'Authorization':`jwt ${token}`}// JSON data
      },
    );
    let result=await response.json();
    dbingredients=result;
  }catch(e){
    console.log(e);
  }
  let str = line.split(/[ ,]+/);
  for(let i=0;i<str.length;i++){
    for(let j=0;j<dbingredients.length;j++){
      if(str[i]==dbingredients[j].name){
        let data={
          name: str[i],
          qty: 0
        }
        addIngredient(`${server}/ingredients`,data);
      }
    }
  }
}

async function delIngredient(name){
  let url=`${server}/ingredients/${name}`;
  try{ 
    let token=window.localStorage.getItem("access_token");
    let response = await fetch(
      url, 
      {
        method: 'DELETE',
        headers: { 'Content-Type':'application/json',
                    'Authorization':`jwt ${token}`}// JSON data
      },
    );//1. Send http request and get response
    
    let result = await response.text();//2. Get message from response
    alert(result);//3. Do something with the message
    console.log(result);
    getIngredientList();
  }catch(error){
    alert(error);
    console.log(error);//catch and log any errors
  }
}

async function getMyIngredients(){
  myingred=[];
  let url=`${server}/ingredients`;
  try{ 
    let token=window.localStorage.getItem("access_token");
    let response = await fetch(
      url, 
      {
        method: 'GET',
        headers: {'Content-Type':'application/json',
                  'Authorization':`jwt ${token}`}// JSON data
      },
    );
    let result=await response.json();
    for(let i=0;i<result.length;i++){
      myingred.push(result[i].name);
    }
  }catch(e){
    console.log(e);
  }
}

function compare(name,ingredients){
  getMyIngredients();
  getIngs(name,ingredients);
}

async function getIngs(name,line){
  let url=`${server}/ingredient`;
  try{ 
    let token=window.localStorage.getItem("access_token");
    let response = await fetch(
      url, 
      {
        method: 'GET',
        headers: {'Content-Type':'application/json',
                  'Authorization':`jwt ${token}`}// JSON data
      },
    );
    let result=await response.json();
    dbingredients=result;
    console.log(token);
  }catch(e){
    console.log(e);
  }
  let str = line.split(/[ ,]+/);
  for(let i=0;i<str.length;i++){
    for(let j=0;j<dbingredients.length;j++){
      if(str[i]==dbingredients[j].name){
        if(!items.includes(str[i])){
          items.push(str[i]);
        }
      }
    }
  }
  console.log(myingred);
  console.log(items);
  drawItems(name);
}

function drawItems(name){
  have=[];
  missing=[];
  for(let i=0;i<items.length;i++){
    for(let j=0;j<myingred.length;j++){
      if(myingred[j]==items[i]){
        if(!have.includes(items[i])){
          have.push(items[i]);
        }
      }
    }
    if(!have.includes(items[i])){
      missing.push(items[i]);
    }
  }
  let res=document.querySelector('#canvas');
  res.innerHTML=`<div id="items">
                  <h3>${name} : Needed</h3>
                  <ul>`;
  if(missing.length==0){
    res.innerHTML+=`<p>You have already acquired all the necessary ingredients for this recipe.</p>
                    <div id="btns">
                      <button id="show" type="button" onclick="drawAcq('${name}')">Show Acquired</button>
                    </div>`; 
  }else{
    for(let i=0;i<missing.length;i++){
      res.innerHTML+=`<div id="item">
                        <li>${missing[i]}<button id="add" type="submit" onclick="add('${name}','${missing[i]}')">+</button></li>
                      </div>`;
    }
    res.innerHTML+=` </ul>
                    </div>
                    <div id="btns">
                      <button id="show" type="button" onclick="drawAcq('${name}')">Show Acquired</button>
                    </div>`;   
  }
}

function drawAcq(name){
  let res = document.querySelector('#canvas');
  res.innerHTML=`<div id="items">
                  <h3>${name} : Acquired</h3>
                  <ul>`;
  if(have.length==0){
    res.innerHTML+=`<p>There are no acquired ingredients for this recipe.</p>
                    <div id="btns">
                      <button id="show" type="button" onclick="drawItems('${name}')">Show Needed</button>
                    </div>`; 
  }else{
    for(let i=0;i<have.length;i++){
      res.innerHTML+=`<div id="item">
                        <li>${have[i]}</li>
                      </div>`;
    }
    res.innerHTML+=` </ul>
                    </div>
                    <div id="btns">
                      <button id="show" type="button" onclick="drawItems('${name}')">Show Needed</button>
                    </div>`;   
  }
}

async function add(name,ing){
  let data={
    name:ing,
    qty: 0
  }
  addIngredient(`${server}/ingredients`,data);
  drawItems(name);
}
  

async function home(){
  let url=`${server}/home`;
  let token = window.localStorage.getItem("access_token");
  var req = new XMLHttpRequest();
  req.open('GET', url, true); //true means request will be async
  req.onreadystatechange = function (aEvt) {
    if (req.readyState == 4) {
      if(req.status == 200){
        window.location.href=url;
      }
      else{
        alert("Error loading page\n");
      }
    }
  };
  req.setRequestHeader('Authorization', `jwt ${token}`);
  req.send();
}

async function myRecipes(){
  let url = `${server}/myrecipes`;
  let token = window.localStorage.getItem("access_token");
  var req = new XMLHttpRequest();
  req.open('GET', url); //true means request will be async
  req.onreadystatechange = function (aEvt) {
    if (req.readyState == 4) {
      if(req.status == 200){
        window.location.href=url;
      }
      else{
        alert("Error loading page\n");
      }
    }
  };
  req.setRequestHeader('Authorization', `jwt ${token}`);
  req.send();
}

async function myIngredients(){
  let url = `${server}/myingredients`;
  let token = window.localStorage.getItem("access_token");
  var req = new XMLHttpRequest();
  req.open('GET', url, true); //true means request will be async
  req.onreadystatechange = function (aEvt) {
    if (req.readyState == 4) {
      if(req.status == 200){
        console.log(req);
        window.location.href=url;
      }
      else{
        alert("Error loading page\n");
      }
    }
  };
  req.setRequestHeader('Authorization', `jwt ${token}`);
  req.send();
}

function logout(){
  recipes=[];
  window.localStorage.removeItem("access_token");
  window.location.replace(server);
}

document.forms['signup'].addEventListener('submit',signUpSubmit);
document.forms['login'].addEventListener('submit',logInSubmit);