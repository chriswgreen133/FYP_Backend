var axios = require("axios").default;

const chat = async (req, res, next) => {
    const userID = req.body.userID

    const url = `https://api-us.cometchat.io/v2.0/users/{userID}/friends`;
    const options = {
        method: 'POST',
        url: url,
        headers: {
            appId: '227288e14ee37703',
            apiKey: 'eec86b7681fa64295a4ce0b9c2a157885395785f',
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({ accepted: [req.body.otherID] })
    };

    // var options = {
    //     method: 'GET',
    //     url: 'https://love-calculator.p.rapidapi.com/getPercentage',
    //     params: { fname: req.body.firstName, sname: req.body.secondName },
    //     headers: {
    //         'x-rapidapi-key': '0a5ae335a8msh8eb50766018908ep1a2b3ejsnd057c1dd3f70',
    //         'x-rapidapi-host': 'love-calculator.p.rapidapi.com'
    //     }
    // };

    axios.request(options).then(function (response) {
        console.log(response.data);
        res.status(200).send(JSON.stringify(response.data));

    }).catch(function (error) {
        console.error(error);
    });

}

exports.chat = chat