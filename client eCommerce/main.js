// select and declare variables...

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCart = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productDOM = document.querySelector('.products-center');
//set car item
let cart = [];
// buttons
let buttonsDOM = [];

// getting products
class Products{
async getProducts(){
    try{
      let result = await fetch("products.json");
      let data = await result.json();
      
      let products = data.items;
      products = products.map(item => {
          const {title,price} = item.fields;
          const {id} = item.sys;
          const image = item.fields.image.fields.file.url;
          return {title, price, id, image}
          // this is how extract datas from json object....
      });
      return products;
    }catch(error){
      console.log(error);
    }
}
}

// show products in user interface
class UI{
    displayProducts(products){
        let result = '';
        products.forEach(product => {
            result += `
            <!-- sigle product -->
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="product" class="product-img">
                    <button class="bag-btn"  data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>${product.price} SEK</h4>
            </article>
            <!-- end of sigle product -->
            `
        });
           productDOM.innerHTML = result; 

    }

    getBagButtons(){
        const buttons = [...document.querySelectorAll('.bag-btn')];
        buttonsDOM = buttons

        buttons.forEach(button =>{
           let id = button.dataset.id;
           let inCart = cart.find(item => item.id === id);
           if(inCart){
               button.innerText = "In Cart";
               button.disabled = true;
           }
               button.addEventListener("click", (event) => {
                  event.target.innerText = "In Cart";
                  event.target.disabled = true;
                  //get product from products..
                  let cartItem ={...storage.getProduct(id), amount: 1};
                  // add to cart
                  cart = [...cart,cartItem];
                  //save cart in local storage
                  storage.saveCart(cart);
                  // set cart values
                  this.setCartValue(cart);
                  // display cart items
                  this.addCartItems(cartItem);
                  //show shopping cart
                  this.showCart();
               });
           
        });
    }

    setCartValue(cart){
        let currentTotal = 0;
        let myItemTotal = 0;
        cart.map(item => {
            currentTotal += item.price * item.amount;
            myItemTotal += item.amount
        });
        cartTotal.innerText = parseFloat(currentTotal.toFixed(2));
        cartItems.innerText = myItemTotal;
     }

    addCartItems(item){
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
        <img src=${item.image} alt="product">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>${item.price} SEK</h5>
                        <span class="remove-item" data-id=${item.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down" data-id=${item.id}></i>
                    </div>`;
                    cartContent.appendChild(div);
    };
    
    showCart(){
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
    }

    setUppFunc(){
        cart = storage.getCart();
        this.setCartValue(cart);
        this.chargeInCart(cart);
        cartBtn.addEventListener("click", this.showCart);
        closeCartBtn.addEventListener("click", this.hideMyCart);
    }

    chargeInCart(cart){
        cart.forEach(item => this.addCartItems(item));
    }
    hideMyCart(){
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }

    cartFuctionality(){
        // clear all cart button...
        clearCart.addEventListener("click", () => {
            this.clearMyCart();
        });
        //cart feature...
        cartContent.addEventListener("click", event => {
            if(event.target.classList.contains("remove-item")){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement); // remove all divs those the span belongs...
                this.removeItem(id);
            }else if(event.target.classList.contains("fa-chevron-up")){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let clickedItem = cart.find(item => item.id === id);
                clickedItem.amount += 1;
                storage.saveCart(cart);
                this.setCartValue(cart);
                addAmount.nextElementSibling.innerText = clickedItem.amount;
            }else if(event.target.classList.contains("fa-chevron-down")){
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let clickedItem = cart.find(item => item.id === id);
                clickedItem.amount = clickedItem.amount - 1;
                // check if item remain or 0
                if(clickedItem.amount > 0){
                storage.saveCart(cart);
                this.setCartValue(cart);
                lowerAmount.previousElementSibling.innerText = clickedItem.amount;
                }else{
                    cartContent.removeChild(lowerAmount.parentElement.parentElement); // remove all divs those the span belongs...
                    this.removeItem(id);
                }
            }
        });
       
    }
    clearMyCart(){
        let cartItems = cart.map(item => item.id );
        cartItems.forEach(id => this.removeItem(id));
        
        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideMyCart();
    }
    removeItem(id){
        cart = cart.filter(item => item.id !== id);
        this.setCartValue(cart);
        storage.saveCart(cart);
        let button = this.getSingleBtn(id);
        button.disabled = false;
        button.innerHTML = ` <i class="fas fa-shopping-cart"></i>add to cart `;
    }
    getSingleBtn(id){
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}


//local storage
class storage{
static saveProducts(products){
  localStorage.setItem("products", JSON.stringify(products));

    }

static getProduct(id){
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id);
}

static saveCart(cart){
     localStorage.setItem("cart",JSON.stringify(cart))
}
static getCart(){
    return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];
}

}



document.addEventListener("DOMContentLoaded",() => {
    const ui = new UI();
    const products = new Products();

    ui.setUppFunc();

    // get items
products.getProducts().then(products => { 
        ui.displayProducts(products); // display items...
        storage.saveProducts(products); // save items in local storage...
}).then(() => {
    ui.getBagButtons();
    ui.cartFuctionality();
});

});