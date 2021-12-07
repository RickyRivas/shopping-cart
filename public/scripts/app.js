

const client = contentful.createClient({
    // Public consumption to view products => no need to hide. READ ONLY
    space: 'jt4gea9e7d3j',
    accessToken: 'MbIRbPfv5jqe4OXc8WRbTUzYDNhNzMHss9oYLGx-Rt0'
})

// });
// Declare variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
// const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');
const purchaseBtn = document.querySelector('.purchase-btn');
const prodModalOverlay = document.querySelector('#prod-modal-overlay');

// Cart 
let cart = [];
// buttons 
let buttonsDOM = [];
// Getting the products

class Products {
    async getProducts() {
        try {
            let contentful = await client.getEntries({
                content_type: 'product'
            });

            let products = contentful.items;
            products = products.map(item => {
                const {
                    title,
                    price,
                    description
                } = item.fields;
                const {
                    id
                } = item.sys;
                const image = 'https:' + item.fields.image[0].fields.file.url;

                return {
                    title,
                    price,
                    id,
                    image,
                    description
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
                </div>
                <h3>${product.title}</h3>
                <h4>${product.price}</h4>
                <div class='btns'>
                 <button class='view-btn btn btn-light' data-id=${product.id}>View Item</button>
                <button class='bag-btn' data-id=${product.id}>Quick Add</button>
                </div>
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
        let emptyDiv = document.querySelector('.empty-content');
        let cartEstText = document.querySelector('.cart-footer h3');
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
        cartItems.innerText = itemsTotal;
        // 
        if (cart.length > 0) {
            emptyDiv.style.display = 'none';
            purchaseBtn.disabled = false;
            cartEstText.style.display = 'block'
        } else {
            emptyDiv.style.display = 'block';
            purchaseBtn.disabled = true;
            cartEstText.style.display = 'none'
        }
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
    viewProduct(products) {
        let prodsRef = [];
        products.forEach(prod => {
            const prodObj = {
                title: prod.title,
                price: prod.price,
                id: prod.id,
                image: prod.image,
                desc: prod.description
            }
            prodsRef.push(prodObj)
        });
        const allViewBtns = document.querySelectorAll('.view-btn');
        allViewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                let id = btn.dataset.id;
                let prodFromArr = prodsRef.find(prodObj => prodObj.id === id);
                // enable modal
                prodModalOverlay.style.display = 'flex'
                // create div
                let prodModal = document.createElement('div');
                prodModal.classList.add('prod-modal')
                // assing div values
                prodModal.innerHTML = `
                <div class='close-modal'>Close</div>
                <img src=${prodFromArr.image}></img>
                <h3>${prodFromArr.title}</h3>
                <p class='price'>$${prodFromArr.price}</p>
                <p class='desc'>${prodFromArr.desc}</p>
                <button class='modal-btn btn btn-primary' data-id=${id}>Add to Cart</button>
                `
                //append
                prodModalOverlay.appendChild(prodModal)
                // modal btn logic
                let currentModalBtn = document.querySelector('.modal-btn');
                let inCart = cart.find(prod => prod.id === id);
                if (inCart) {
                    currentModalBtn.innerText = 'Item in Cart';
                    currentModalBtn.disabled = true;
                }
                // modal btn clicked logic
                currentModalBtn.addEventListener('click', (e) => {
                    // get btn id
                    let id = currentModalBtn.dataset.id;
                    // btn innertext
                    currentModalBtn.innerText = "Added to Cart"
                    // Get Product from products 
                    let cartItem = {
                        ...Storage.getProduct(id),
                        amount: 1
                    };
                    // save the cart in the local storage
                    Storage.saveCart(cart);
                    // set cart values 
                    this.setCartValues(cart);
                    // display cart item
                    this.addCartItem(cartItem);
                    // add product to the cart
                    cart = [...cart, cartItem];
                    // loop through bag btns and change inner text
                //     const bagButtons = document.querySelectorAll('.bag-btn');
                //     bagButtons.forEach(bagBtn => {
                //         let inCart = cart.find(item => item.id === id)
                //         if (inCart) {
                //             bagBtn.innerText = "In Cart";
                //             bagBtn.disabled = true;
                //         }
                //     })
                })
                // close modal
                document.querySelector('.close-modal').addEventListener('click', () => {
                    prodModalOverlay.style.display = 'none';
                    prodModalOverlay.removeChild(prodModal);
                })
            })
        })
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
        // clearCartBtn.addEventListener('click', () => {
        //     this.clearCart();
        // })
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
        this.checkCartLength();
    }
    removeItem(id) {
        cart = cart.filter(item => item.id !== id)
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `Quick Add`;
    }
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id)
    }
    callStripe = async () => {
        const thisCart = cart;
        thisCart.forEach(item => {
            item.price = item.price * 100;
        })
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
            console.error(error);
        }
        this.callSendgrid();
    }
}
class Elements {
    callStripe = async () => {
        // const response = await fetch('/.netlify/functions/provide-vars').then((res) => res.json());
        // const publicTestKey = response.publicKey;
        console.log(cart)
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
    const elements = new Elements();
    // setup application
    ui.setupApp();
    //Get all products
    products.getProducts().then(products => {
        ui.displayProducts(products);
        ui.viewProduct(products);
        Storage.saveProducts(products);
        elements.callStripe(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
});
