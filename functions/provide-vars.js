exports.handler = async () => {

    return {
        statusCode: 200,
        body: JSON.stringify({
            token: process.env.ACCESS_TOKEN,
            space: process.env.SPACE_ID
        })
    }
}