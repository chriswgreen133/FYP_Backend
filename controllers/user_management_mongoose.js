
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const defaultPic = 'https://firebasestorage.googleapis.com/v0/b/okay-945dc.appspot.com/o/images%2FDefaultPic.png?alt=media&token=172c25b2-5f82-4321-8589-a2b33972bebb'

const Users = require('../models/users');
const HttpError = require('../models/http-error');

mongoose.connect(
    'mongodb+srv://saad:saad@schoolhub.zmtqr.mongodb.net/users?retryWrites=true&w=majority'
).then(() => {
    console.log("DB connected")
}).catch(() => {
    console.log('Error occured, DB connection failed ')
})

const createUser = async (req, res, next) => {
    const createdUser = new Users({
        type: req.body.type,
        email: req.body.email,
        username: req.body.username,
        phoneNumber: req.body.phoneNumber,
        password: req.body.password,
        profilePic: defaultPic
    })

    let existingUser;
    try {
        let query = { email: createdUser.email }
        existingUser = await Users.findOne(query).exec();
    } catch (err) {
        const error = new HttpError(
            'Signing up failed, please try again later.',
            500
        );
        console.log(err)
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError(
            'User exists already, please login instead.',
            422
        );
        return next(error);
    }

    let hashedPassword;
    try {
        //Number signifies difficulty level of hashing
        hashedPassword = await bcrypt.hash(createdUser.password, 12)
        createdUser.password = hashedPassword
        console.log("Hashed Password")
        console.log(hashedPassword)
        const result = await createdUser.save();
        console.log(typeof createdUser._id)
        res.status(200)
        //res.json(result)
    } catch (err) {
        const error = new HttpError(
            'Hashing Failed',
            500
        );
        console.log(err)
        return next(error);
    }

    let token;
    //check official docs of wen tokens to undestand the options for the 3rd optional parameters, using expire is recommended
    try {
        token = jwt.sign({ _id: createdUser._id, username: createdUser.username, email: createdUser.email, type: createdUser.type },
            "secret_key",
            { expiresIn: "1h" })
    } catch (err) {
        const error = new HttpError(
            'Token generation Failed',
            500
        );
        console.log(err)
        return next(error);
    }

    res.status(201).json({ token: token, _id: createdUser._id, username: createdUser.username, email: createdUser.email, type: createdUser.type })

};

const getUser = async (req, res, next) => {
    const user = await Users.find().exec(); //Converting this into a promise using .exec()
    // res.json(user);
    res.status(200).send(JSON.stringify(user));
}

const userLogin = async (req, res, next) => {
    const { type, email, password } = req.body;
    let deviceToken = req.body.deviceToken

    let existingUser;
    try {
        existingUser = await Users.findOne({ email: email })
    } catch (err) {
        const error = new HttpError('Email error occured', 500);
        res.status(500).send()
        return next(error)
    }

    //if (!existingUser || existingUser.password !== password || existingUser.type !== type) {
    if (!existingUser || existingUser.type !== type) {
        const error = new HttpError('Wrong credentials', 401)
        res.status(401).send()
        return next(error)
    }

    let isPassValid = false;
    try {
        isPassValid = await bcrypt.compare(password, existingUser.password)
    } catch (err) {
        const error = new HttpError('Hashing error', 500);
        res.status(500).send()
        return next(error)
    }

    if (!isPassValid) {
        const error = new HttpError('Wrong Password', 401)
        res.status(401).send()
        return next(error)
    }

    let token;
    //check official docs of wen tokens to undestand the options for the 3rd optional parameters, using expire is recommended
    try {
        token = jwt.sign({ _id: existingUser._id, username: existingUser.username, email: existingUser.email, type: existingUser.type },
            "secret_key",
            { expiresIn: "1h" })
    } catch (err) {
        const error = new HttpError(
            'Token generation Failed',
            500
        );
        console.log(err)
        return next(error);
    }

    if(deviceToken != undefined){
        console.log("device Token")
        console.log(deviceToken)
        existingUser.deviceToken = deviceToken

        try {
            await existingUser.save();
        } catch (err) {
            const error = new HttpError(
                'Something went wrong, could not update user.',
                500
            );
            console.log(err)
            return next(error);
        }
    }

    console.log('Login Successful')
    //res.json({ message: "login successful" })
    res.status(200).send(JSON.stringify({ _id: existingUser._id, username: existingUser.username, type: existingUser.type, profilePic: existingUser.profilePic, email: existingUser.email, token: token, following: existingUser.following, deviceToken: existingUser.deviceToken }));
}

const getSpecificUser = async (req, res, next) => {
    const uid = req.params.uid;
    console.log(uid)

    var query = { _id: uid };
    console.log(query)

    const user = await Users.find(query).exec();
    //user = await Users.findById(uid);
    // res.json(user);
    res.status(200).send(JSON.stringify(user));
}

const updateProfilePic = async (req, res, next) => {
    let newProfilePic = req.body.profilePic;

    const uid = req.params.uid;

    let user;
    try {
        user = await Users.findById(uid);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update user.',
            500
        );
        return next(error);
    }

    user.profilePic = newProfilePic

    try {
        await user.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update user.',
            500
        );
        console.log(err)
        return next(error);
    }

    res.status(200).json(user);

}

const updateProfile = async (req, res, next) => {
    let newUsername = req.body.username;
    let newPhoneNo = req.body.phoneNumber;
    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword;

    const uid = req.params.uid;

    let user;
    try {
        user = await Users.findById(uid);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update user.',
            500
        );
        return next(error);
    }

    let isPassValid = false;

    if (oldPassword != undefined && newPassword != undefined) {
        try {
            isPassValid = await bcrypt.compare(oldPassword, user.password)
        } catch (err) {
            const error = new HttpError('Hashing error', 500);
            res.status(500).send()
            return next(error)
        }

        if (!isPassValid) {
            const error = new HttpError('Wrong Password', 401)
            res.status(401).send()
            return next(error)
        }

        let hashedPassword;
        try {
            //Number signifies difficulty level of hashing
            hashedPassword = await bcrypt.hash(newPassword, 12)
            user.password = hashedPassword
            //OLD METHOD
            // user.username = newUsername
            // user.phoneNumber = newPhoneNo
            console.log("Hashed New Password is:")
            console.log(hashedPassword)
            const result = await user.save();
            res.status(200)
        } catch (err) {
            const error = new HttpError(
                'Hashing Failed',
                500
            );
            console.log(err)
            return next(error);
        }
    }

    if (newUsername != undefined) {
        user.username = newUsername
    }

    if (newPhoneNo != undefined) {
        user.phoneNumber = newPhoneNo
    }

    try {
        await user.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update user.',
            500
        );
        console.log(err)
        return next(error);
    }

    res.status(200).json(user);

}

const superAdminLogin = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await Users.findOne({ email: email })
    } catch (err) {
        const error = new HttpError('Email error occured', 500);
        res.status(500).send()
        return next(error)
    }

    //if (!existingUser || existingUser.password !== password || existingUser.type !== type) {
    if (!existingUser) {
        const error = new HttpError('Wrong credentials', 401)
        res.status(401).send()
        return next(error)
    }

    let isPassValid = false;
    try {
        isPassValid = await bcrypt.compare(password, existingUser.password)
    } catch (err) {
        const error = new HttpError('Hashing error', 500);
        res.status(500).send()
        return next(error)
    }

    if (!isPassValid) {
        const error = new HttpError('Wrong Password', 401)
        res.status(401).send()
        return next(error)
    }

    let token;
    //check official docs of wen tokens to undestand the options for the 3rd optional parameters, using expire is recommended
    try {
        token = jwt.sign({ _id: existingUser._id, username: existingUser.username, email: existingUser.email },
            "secret_key",
            { expiresIn: "1h" })
    } catch (err) {
        const error = new HttpError(
            'Token generation Failed',
            500
        );
        console.log(err)
        return next(error);
    }

    console.log('Login Successful')
    //res.json({ message: "login successful" })
    res.status(200).send(JSON.stringify({ _id: existingUser._id, username: existingUser.username, token: token }));
}

const searchUser = async (req, res, next) => {

    console.log("inside SearchUser")
    const type = req.body.type;

    const name = req.params.sName;
    console.log(name)
    //var res = name.toLowerCase();
    //let re = new RegExp(name);
    //let re = `/{name}/i`;
    let re = new RegExp(name, "i");
    let query;
    if (name == undefined || name == '') {
        query = {}
        console.log("inside empty query")
    } else {
        query = { username: re };
    }

    console.log(query)

    let users
    try {
        const usersArr = await Users.find(query).exec(); //Converting this into a promise using .exec()
        console.log("Search Result")
        //console.log(userArr)

        users = usersArr.filter((item) => {
            if (item.type == 'Teacher' || item.type == 'Student') {
                return item
            }
        })
    } catch (err) {
        console.log("Error")
        console.log(err)
    }


    //------------------------Type------------------------------------
    if (type != undefined && type != '') {
        let filteredUsers = []
        if (type == 'Student') {
            filteredUsers = users.filter((item) => {
                return item.type == 'Student'
            })

            return res.status(200).send(JSON.stringify(filteredUsers))
        } else if (type == 'Teacher') {
            filteredUsers = users.filter((item) => {
                return item.type == 'Teacher'
            })

            return res.status(200).send(JSON.stringify(filteredUsers))
        } else {
            console.log("Type is wrong!")
            return res.status(500).send(JSON.stringify({ message: "Wrong type entered" }))
        }
    } else {
        return res.status(200).send(JSON.stringify(users))
    }
}

const updateFollowing = async (req, res, next) => {

    let newUser = req.body;
    let newFollow = req.body.follow
    console.log("New User")
    console.log(newUser)

    const uid = req.params.uid;

    let user;
    try {
        user = await Users.findById(uid);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find user.',
            500
        );
        return next(error);
    }

    let allFollows = user.following

    let existingUserFollows = allFollows.filter(followObject => followObject.userID === newUser.userID)

    if (existingUserFollows.length != 0) {
        let arrayIndex;
        for (let i = 0; i <= allFollows.length; i++) {
            if (allFollows[i].userID === newUser.userID) {
                arrayIndex = i;
                break;
            }
        }
        user.following[arrayIndex].follow = newUser.follow

    } else {
        if (newUser != null || newUser != undefined) {

            user.following.push(newUser)
        }
    }

    // let existingUser = false
    // user.following.map((item) => {
    //         if (item.userID == newUser.userID) {
    //             existingUser=true
    //         }
    // })

    // if (newUser != undefined && newUser.userID != undefined && newUser.userID != null && existingUser==false) {
    //     if (item.userID == newUser.userID) {
    //         user.following.push(newUser)
    //     }

    // }else{
    //     console.log("Already following user")
    // }

    try {
        await user.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update user.',
            500
        );
        console.log(err)
        return next(error);
    }

    res.status(200).json(user);

}


exports.createUser = createUser;
exports.getUser = getUser;
exports.getSpecificUser = getSpecificUser;
exports.userLogin = userLogin;
exports.updateProfilePic = updateProfilePic;
exports.updateProfile = updateProfile;
exports.superAdminLogin = superAdminLogin
exports.searchUser = searchUser
exports.updateFollowing = updateFollowing