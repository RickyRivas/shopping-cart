var stripe = Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2020-08-27",
});

const domain = await stripe.applePayDomains.create({
    domain_name: 'https://rwds1.netlify.app/',
});
const paymentIntent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: 'usd'
})
exports.handler = async () => {

    return {
        statusCode: 200,
        body: JSON.stringify({
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        })
    }
}