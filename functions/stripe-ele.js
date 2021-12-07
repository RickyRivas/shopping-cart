var stripe = Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

exports.handler = async () => {

    const domain = await stripe.applePayDomains.create({
        domain_name: 'example.com',
    });
    const paymentIntent = await stripe.paymentIntents.create({
        amount: 1099,
        currency: 'usd'
    })

    return {
    statusCode: 200,
    body: JSON.stringify({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    })
  }
}