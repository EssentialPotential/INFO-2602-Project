import json
from flask import Flask, request, render_template, redirect, flash, url_for
from flask_jwt import JWT, jwt_required, current_identity
from sqlalchemy.exc import IntegrityError
from datetime import timedelta 

from models import db, User, Ingredient, Recipe, UserIngredient#, IngredientRecipe

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sqlite.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = "MYSECRET"
    app.config['JWT_EXPIRATION_DELTA'] = timedelta(days = 7)
    db.init_app(app)
    return app

app = create_app()

app.app_context().push()
# db.create_all(app=app)

def authenticate(uname, password):
    #search for the specified user
    user = User.query.filter_by(name=uname).first()
    #if user is found and password matches
    if user and user.check_password(password):
        return user

def identity(payload):
    return User.query.get(payload['identity'])

jwt = JWT(app, authenticate, identity)

@app.route('/')
def register():
    return render_template('signup.html')

@app.route('/home')
#@jwt_required()
def main():
    return app.send_static_file('index.html')

@app.route('/signup', methods=['POST'])
def signup():
    userdata = request.get_json()
    newuser = User(name=userdata['name'], email=userdata['email'])
    newuser.set_password(userdata['password'])
    try:
        db.session.add(newuser)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return 'Name or email already exists. Please Login or check that you have correctly entered your credentials.', 401
    return 'User ' + newuser.name+' created, Please Login to continue.', 201

@app.route('/ingredient', methods=['GET'])
def getIngredientList():
    ingredients = Ingredient.query.all()
    ingredients = [ingredient.toDict() for ingredient in ingredients]
    if ingredients == None:
        return 'There are currently no ingredients added to the list.', 200
    return json.dumps(ingredients), 200
    

@app.route('/myingredients')
#@jwt_required()
def ingredients():
    return render_template('ingredients.html')

@app.route('/ingredients', methods=['POST'])
@jwt_required()
def addIngredient():
    userdata = request.get_json()
    ingredient = Ingredient.query.filter_by(name=userdata['name']).first()
    if ingredient == None:
        return userdata['name'] + ' is not in our Ingredient Database.', 403
    else:
        myingredient = UserIngredient(name=userdata['name'], id=current_identity.id, iid=ingredient.getId(), qty=userdata['qty'])
        try:
            db.session.add(myingredient)
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return 'Ingredient '+userdata['name']+' is already in your list.'
    return myingredient.name + ' successfully added.', 201

@app.route('/ingredients/<name>', methods=['PUT'])
@jwt_required()
def updateIngredient(name):
    myingredient = UserIngredient.query.filter_by(id=current_identity.id, name=name).first()
    if myingredient == None:
        return 'There is no ingredient with the name '+name+' in your list.',403
    q = str(myingredient.qty)
    data = request.get_json()
    if 'qty' in data:
        if q == data['qty']:
            return name+' already has quantity '+q
        myingredient.qty=data['qty']
        db.session.add(myingredient)
        db.session.commit()
    return name+' quantity successfully changed to '+str(myingredient.qty)


@app.route('/ingredients', methods=['GET'])
@jwt_required()
def getIngredients():
    ingredients = UserIngredient.query.filter_by(id=current_identity.id).all()
    ingredients = [ingredient.toDict() for ingredient in ingredients]
    if ingredients == None:
        return 'There are currently no ingredients added to your list.', 200
    return json.dumps(ingredients), 200

@app.route('/ingredients/<name>', methods=['GET'])
@jwt_required()
def getIngredient(name):
    ingredient = UserIngredient.query.filter_by(id=current_identity.id, name=name).first()
    if ingredient == None:
        return 'No ingredient found.'
    return json.dumps(ingredient.toDict()),200

@app.route('/ingredients/<name>', methods=['DELETE'])
@jwt_required()
def deleteIngredient(name):
    ingredient = UserIngredient.query.filter_by(id=current_identity.id, name=name).first()
    if ingredient == None:
        return 'No ingredient named '+name, 403
    db.session.delete(ingredient)
    db.session.commit()
    return name + ' successfully deleted.',202

@app.route('/myrecipes')
#@jwt_required()
def showRecipes():
    return render_template('recipes.html')

@app.route('/recipes', methods=['POST'])
@jwt_required()
def addRecipe():
    userdata = request.get_json()
    recipe = Recipe(name=userdata['name'], id=current_identity.id, img=userdata['img'], recipeUrl=userdata['recipeUrl'], ingredients=userdata['ingredients'])
    try:
        db.session.add(recipe)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return 'Recipe already added. Please view in the Recipe tab.', 401
    return recipe.name+' saved.', 201

@app.route('/recipes', methods=['GET'])
@jwt_required()
def getRecipes():
    recipes= Recipe.query.filter_by(id=current_identity.id).all()
    recipes = [recipe.toDict() for recipe in recipes]
    if recipes == None:
        return 'No recipes added.',200
    return json.dumps(recipes), 200

@app.route('/recipes/<name>', methods=['GET'])
@jwt_required()
def getRecipe(name):
    recipe = Recipe.query.filter_by(id=current_identity.id, name=name).first()
    if recipe == None:
        return 'No recipe captured.', 403
    return json.dumps(recipe.toDict()), 201

@app.route('/recipes/<name>', methods=['DELETE'])
@jwt_required()
def deleteRecipe(name):
    recipe = Recipe.query.filter_by(id=current_identity.id, name=name).first()
    name= recipe.name
    if recipe == None:
        return 'No recipe captured.', 403
    db.session.delete(recipe)
    db.session.commit()
    return name + ' successfully removed.',202


if __name__ == '__main__':
    app.run(host='0.0.0.0',port=8080,debug=True)
