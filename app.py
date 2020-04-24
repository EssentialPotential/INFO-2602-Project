import json
from flask import Flask, request, render_template
from flask_jwt import JWT, jwt_required, current_identity
from sqlalchemy.exc import IntegrityError
from datetime import timedelta 

from models import db, User, MyIngredients

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = "MYSECRET"
    app.config['JWT_EXPIRATION_DELTA'] = timedelta(days = 7) 
    db.init_app(app)
    return app

app = create_app()

app.app_context().push()
db.create_all(app=app)

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
def hello():
    return app.send_static_file('index.html')

@app.route('/register')
def register():
    return render_template('signup.html') 

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
        return 'name or email already exists', 401
    return 'User ' + newuser.name+' created', 201

@app.route('/ingredients')
@jwt_required()
def add_ingredient():
    userdata = request.get_json()
    ingredient = MyIngredient(name=userdata['name'])
    try:
        db.session.add(ingredient)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return 'Ingredient already added.', 401
    return ingredient.name + 'added.', 201



if __name__ == '__main__':
    app.run(host='0.0.0.0',port=8080,debug=True)
