exports.handler = async () => {
    return {
        statusCode: 200,
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
            publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
        })
    }
}