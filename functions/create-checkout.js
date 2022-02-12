const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-03-02',
  maxNetworkRetries: 2,
});
const accessToken = process.env.ACCESS_TOKEN;
const spaceId = process.env.SPACE_ID


exports.handler = async (e) => {
  // import cart
  const importedCart = JSON.parse(e.body);
  // new cart
  const finalCart = [];
  const metadata = [];

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
      adjustable_quantity: {
        enabled: true,
        minimum: 1,
        maximum: 99,
      },
      quantity: cartItem.amount
    }
    const productMetaData = {
      name: cartItem.title,
      images: [cartItem.image]
    }
    finalCart.push(newProduct);
    metadata.push(productMetaData)
  });


  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    billing_address_collection: 'auto',
    shipping_address_collection: {
      allowed_countries: ['US', 'CA'],
    },
    success_url: `https://rwds1.netlify.app/`,
    cancel_url: `https://rwds1.netlify.app/`,
    line_items: finalCart,
    metadata: {
      items: JSON.stringify(metadata)
    }
  })

  return {
    statusCode: 200,
    body: JSON.stringify({
      sessionId: session.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      spaceId: spaceId,
      accessToken: accessToken
    })
  }
}