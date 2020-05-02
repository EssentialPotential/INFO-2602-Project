let url='http://127.0.0.1:8080';
let server='http://127.0.0.1:8080';
const appID = '09922bc4';
const appKey = '7b4e785f51b5bdfb12595b7b385b35a6';
var query = '';
var search = '';

async function getRecipes(){
  try{
    let response = await fetch(`https://api.edamam.com/search?q=${query}&app_id=${appID}&app_key=${appKey}`);
    let data = await response.json();
    displayRecipes(data.hits);
    console.log(data.hits);
  }
  catch(e){
    console.log(e);
  }
}

function goTo(link){
  window.open(link);
}

function displayRecipes(records){
  data = document.querySelector('#recipes');
  data.innerHTML = ``;
  for (i=0;i<10;i++){
    let ringredients={
      'key':[],
      'text':[]
    }
    let ingredients = records[i].recipe.ingredients;
    let count = ingredients.length;
    for(let i=0;i<count;i++){
      ringredients.key.push(i);
      ringredients.text.push(ingredients[i].text);
    }
    data.innerHTML += `
      <div class="recipe">
      <h2>${records[i].recipe.label}</h2>
      <img class="image" src="${records[i].recipe.image}"/>
      <p>Cautions: ${records[i].recipe.cautions}</p>
      <p>Diet Labels: ${records[i].recipe.dietLabels}</p>
      <p>Health Labels: ${records[i].recipe.healthLabels}</p>
      <div class="btns">
      <button onclick="recipeSubmit('${records[i].recipe.label}','${records[i].recipe.url}','${ringredients.text}')">Save Dish</button>
      <button onclick="goTo('${records[i].recipe.url}')">View Recipe</button>
      <button>View Ingredients</button>
      </div>
      </div>
    `;
  }
}

function setSearch(e){
  search = e.target.value;
}
function getSearch(e){
  e.preventDefault();
  query = search;
  getRecipes();
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
    
    let result = await response.text();//2. Get message from response
    let message=JSON.parse(result);
    if(message.hasOwnProperty('access_token')){
      localStorage.setItem("access_token",message.access_token);
      let token = localStorage.getItem("access_token");
      homePage(server, token);
    }else{
      alert(result);//3. Do something with the message
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
        body: null,//convert data to JSON string
        headers: {'Content-Type':'application/json',
                  'Authorization':`jwt ${token}`}// JSON data
      },
    );
    let result=await response;
    // console.log(result);
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

async function addIngred(url, data){
  try{ 
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
  }catch(error){
    alert(error);
    console.log(error);//catch and log any errors
  }
}

function recipeSubmit(name, url, ingredients){
  event.preventDefault();//prevents page redirection
      
  let data = {
    name: name,
    recipe: url,
    ingredients: ingredients
  }
  //addRecipe(`${server}/recipe`, data);
  console.log(data);
}

async function addRecipe(url, data){
  let token=sessionStorage.getItem("access_token");
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
    console.log(result);
  }catch(error) {
    alert(error);
    console.log(error);
  }
}

document.forms['signup'].addEventListener('submit',signUpSubmit);
document.forms['login'].addEventListener('submit',logInSubmit);