exports.handler = async () => {
    const accessToken = process.env.ACCESS_TOKEN;
    const spaceId = process.env.SPACE_ID;

    return {
        statusCode: 200,
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
            space: spaceId,
            token: accessToken
        })
    }
}