exports.handler = async () => {
    const publicKey = process.env.STRIPE_PUBLISHABLE_KEY;
    return {
        statusCode: 200,
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
            pk: publicKey,
        })
    }
}