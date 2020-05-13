from app import db, Ingredient, app

db.create_all(app=app)

ingredients = ["apples","bananas","tomatoes","grapes","pineapple","lemon","lemons","lime","limes","celery","fish","butter","milk","yogurt",
                "sushi rice","rice","beans","salmon","sugar","oil","carrots","broccoli","vinegar","apple cider","blueberries","raspberries",
                "cranberries","egg","eggs","flour","baking powder","sausages","chicken","pork","lamb","beef","goat","duck","shrimp","lobster",
                "squid","mussels","rum","ice","water","yeast","salt","icing sugar","blackberries","almond milk","almonds","peanuts",
                "peanut butter","pears","apple","banana","cherry tomato","pimento","potato","sweet potato","spinach","mushroom","cheese","bread",
                "corn","cucumber","garlic","onion","olives","pasta","turkey","watermelon","oranges","orange juice","ketchup","mustard","mayonnaise",
                "bar-b-que sauce","tuna","tumeric","soy sauce","baking soda","pepper sauce","peppers","cream cheese","bread crumbs","bell pepper",
                "cinnamon","cilantro","parsley","curry powder","black pepper","avocado","vanilla essence","nutmeg","salsa","chive","corn syrup",
                "maple syrup","strawberries","cloves","thyme","pumpkin","peas","oats","macaroni","chocolate chips","chocolate milk","chocoloate",
                "wine","ricotta","channa","ginger","fettucine","spaghetti","sausage","sardines","beer"]

for ingredient in ingredients:
    ingredient=Ingredient(name=ingredient)
    db.session.add(ingredient)
    db.session.commit()