
exports.handler = async () => {
    const mySpaceId = process.env.SPACE_ID;
    const myToken = process.env.ACCESS_TOKEN;
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            token: myToken,
            space: mySpaceId
        }),
    };
}