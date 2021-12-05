const accessToken = process.env.ACCESS_TOKEN;
const spaceId = process.env.SPACE_ID;

exports.handler = async () => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            token: accessToken,
            space: spaceId
        }),
    };
}