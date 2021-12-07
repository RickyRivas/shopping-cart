exports.handler = async () => {
    return {
        statusCode: 200,
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
            publickey: process.env.STRIPE_PUBLISHABLE_KEY,
        })
    }
}