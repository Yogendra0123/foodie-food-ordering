# Foodie – Online Food Ordering (frontend demo)
HTML5 + CSS3 + vanilla JavaScript. No backend, no build step.

## Run locally
1. Open the `foodie` folder.
2. Double-click `index.html`, or run `python3 -m http.server 8000` in the folder and visit http://localhost:8000.
(Font Awesome icons load from a CDN, so an internet connection is needed for icons.)

## Notes
- Cart is saved in LocalStorage (key `foodie_cart`).
- Dish images are local SVGs in `assets/images/`. To use real photos, drop files there and change the `IMG()` helper in `js/script.js`.
- Checkout is a demo only; no payments.

## Using real food photos
Save photos in `assets/images/` with these names (any size, ~800x600 JPG recommended). Missing ones fall back to the SVG illustration automatically.
- Dishes: d1 Margherita Pizza, d2 Pepperoni Pizza, d3 Cheeseburger, d4 Chicken Burger, d5 Chicken Biryani, d6 Paneer Biryani, d7 Hakka Noodles, d8 Chicken Manchurian, d9 Chocolate Lava Cake, d10 Gulab Jamun, d11 Cold Coffee, d12 Lime Soda (`d1.jpg` … `d12.jpg`)
- Categories: `c-pizza.jpg`, `c-burgers.jpg`, `c-biryani.jpg`, `c-chinese.jpg`, `c-desserts.jpg`, `c-beverages.jpg`
- Hero: `hero.jpg`
Free sources: unsplash.com, pexels.com, pixabay.com
