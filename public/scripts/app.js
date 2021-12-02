// const client = contentful.createClient({
//     space: "x9ptcuh2pi5d",
//     accessToken: "j76u2IZdinqvu0wjsB4visGlj2ujkLUZdWJDfHzrG5g"

// });
// Declare variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');
const purchaseBtn = document.querySelector('.purchase-btn')
// Cart 
let cart = [];
// buttons 
let buttonsDOM = [];
// Getting the products

class Products {
    async getProducts() {
        try {
            // let contentful = await client.getEntries({
            //     content_type: 'comfyHouseProducts'
            // });


            let result = await fetch('scripts/products.json');
            let data = await result.json();

            let products = data.items;
            products = products.map(item => {
                const {
                    title,
                    price
                } = item.fields;
                const {
                    id
                } = item.sys;
                const image = item.fields.image.fields.file.url;
                return {
                    title,
                    price,
                    id,
                    image
                }
            })
            return products
        } catch (err) {
            console.log(err)
        }
    }
}
// Display Products
class UI {
    displayProducts(products) {
        let result = '';
        products.forEach(product => {
            result += `
                <!-- Single Product -->
            <article class='product'>
                <div class='img-container'>
                    <img src='${product.image}'>
                    <button class='bag-btn' data-id=${product.id}>Add to bag</button>
                </div>
                <h3>${product.title}</h3>
                <h4>${product.price}</h4>
            </article>
            <!-- Single Product-->
            `;
        });
        productsDOM.innerHTML = result;
    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll('.bag-btn')];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }
            button.addEventListener('click', (event) => {
                event.target.innerText = 'In Cart';
                event.target.disabled = true;
                // Get Product from products 
                let cartItem = {
                    ...Storage.getProduct(id),
                    amount: 1
                };
                // add product to the cart
                cart = [...cart, cartItem];
                // save the cart in the local storage
                Storage.saveCart(cart);
                // set cart values 
                this.setCartValues(cart);
                // display cart item
                this.addCartItem(cartItem);
                // show the cart
                this.showCart();
            });
        });
    }
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
        cartItems.innerText = itemsTotal;
    }
    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
           <img src=${item.image} alt='product' class='cart-product-img'>
                            <div>
                                <h4>${item.title}</h4>
                                <h5>${item.price}</h5>
                                <span class='remove-item' data-id=${item.id}>Remove</span>
                            </div>
                            <div>
                                <img src='images/arrow-up.svg' data-id=${item.id} class='up-quantity-icon icon' alt=''>
                                <p class='item-amount'>${item.amount}</p>
                                <img src='images/arrow-down.svg' data-id=${item.id} class='down-quantity-icon icon' alt=''>
                            </div>
        `
        cartContent.appendChild(div);
    }

    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart')
    }
    setupApp() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
        purchaseBtn.addEventListener('click', this.callStripe);
    }
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    cartLogic() {
        // Clear cart button 
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        })
        // cart functionality
        cartContent.addEventListener('click', event => {
            if (event.target.classList.contains('remove-item')) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);

            } else if (event.target.classList.contains('up-quantity-icon')) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;

            } else if (event.target.classList.contains('down-quantity-icon')) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;

                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        })
    }
    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart();
    }
    removeItem(id) {
        cart = cart.filter(item => item.id !== id)
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `add to cart`;
    }
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id)
    }
    callStripe() {
        purchaseBtn.addEventListener('click', async () => {
            const thisCart = cart;
            //    const finalCartItems = cart;
            const response = await fetch('/.netlify/functions/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(thisCart)
            }).then((res) => res.json());

            const stripe = Stripe(response.publishableKey);
            const {
                error
            } = await stripe.redirectToCheckout({
                sessionId: response.sessionId,
            });
            if (error) {
                document
                    .querySelectorAll('button')
                    .forEach((button) => (button.disabled = false));
                console.error(error);
            }
            const bug = response.text;
            console.log(bug)
        })
    }
}

// Local Storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id)
    }
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}

// Document onload
document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI()
    const products = new Products()
    // setup application
    ui.setupApp();
    //Get all products
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
});