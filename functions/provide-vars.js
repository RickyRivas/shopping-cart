exports.handler = function sendVars() {
    const spaceId = process.env.ACCESS_TOKEN;
    const accessToken = process.env.SPACE_ID
    return {
        statusCode: 200,
        body: JSON.stringify({
            space: spaceId,
            token: accessToken
        })
    }
}