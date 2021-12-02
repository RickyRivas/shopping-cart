const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-03-02',
  maxNetworkRetries: 2,
});


exports.handler = async (e) => {
  // import cart
  const importedCart = JSON.stringify(e.body);
  console.log(importedCart)
  // new cart
  const finalCart = [];

  importedCart.forEach(cartItem => {
    const newProduct = {
      price_data: {
        currency: 'usd',
        unit_amount: cartItem.price,
        product_data: {
          name: cartItem.title,
          images: [cartItem.image],
        }
      },
      quantity: cartItem.amount
    }
    finalCart.push(newProduct)
  });


  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    billing_address_collection: 'auto',
    shipping_address_collection: {
      allowed_countries: ['US', 'CA'],
    },
    success_url: `${process.env.URL}/success.html`,
    cancel_url: `${process.env.URL}/cancel.html`,
    line_items: [finalCart],
  })

  return {
    statusCode: 200,
    body: JSON.stringify({
      sessionId: session.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    })
  }
}