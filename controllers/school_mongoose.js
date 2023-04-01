
const mongoose = require('mongoose');

const School = require('../models/school');
const Users = require('../models/users');
const HttpError = require('../models/http-error');
const { json } = require('body-parser');

const defaultPic = 'https://firebasestorage.googleapis.com/v0/b/okay-945dc.appspot.com/o/schoolImages%2FdefaultSchoolIcon.jpeg?alt=media&token=1bad9aff-5d0b-4513-88ca-039d9c6ee180'

mongoose.connect(
    'mongodb+srv://saad:saad@schoolhub.zmtqr.mongodb.net/school?retryWrites=true&w=majority'
).then(() => {
    console.log("DB connected")
}).catch(() => {
    console.log('Error occured, DB connection failed ')
})

const createSchool = async (req, res, next) => {
    console.log("Request")
    console.log(req.body)
    const createdSchool = new School({
        adminID: req.body.adminID,
        schoolName: req.body.schoolName,
        schoolIcon: req.body.schoolIcon,
        schoolAddress: req.body.schoolAddress,
        contactNumber: req.body.contactNumber,
        schoolEmail: req.body.schoolEmail,
        zipCode: req.body.zipCode,
        aboutSchool: req.body.aboutSchool,
        schoolType: req.body.schoolType,
        educationLevel: req.body.educationLevel,
        educationType: req.body.educationType,
        schoolFB: req.body.schoolFB,
        schoolCoordinates: req.body.schoolCoordinates,
        feeStructure: req.body.feeStructure,
        images: req.body.images,
        videos: req.body.videos,
        teachers: [],
        totalRating: 1,
        ARmodel: ''
    })

    const createdSchoolDefaultIcon = new School({
        adminID: req.body.adminID,
        schoolName: req.body.schoolName,
        schoolIcon: defaultPic,
        schoolAddress: req.body.schoolAddress,
        contactNumber: req.body.contactNumber,
        schoolEmail: req.body.schoolEmail,
        zipCode: req.body.zipCode,
        aboutSchool: req.body.aboutSchool,
        schoolType: req.body.schoolType,
        educationLevel: req.body.educationLevel,
        educationType: req.body.educationType,
        schoolFB: req.body.schoolFB,
        schoolCoordinates: req.body.schoolCoordinates,
        feeStructure: req.body.feeStructure,
        images: req.body.images,
        videos: req.body.videos,
        teachers: [],
        totalRating: 1,
        ARmodel: ''
    })

    try {
        if (createdSchool.schoolIcon != undefined) {
            await createdSchool.save();
        } else {
            console.log("Images")
            console.log(createdSchool.images)
            await createdSchoolDefaultIcon.save();
        }
        //res.status(200).send()
    } catch (err) {
        const error = new HttpError(
            'creating school failed, please try again later.',
            500
        );
        console.log(err)
        return next(error);
    }

    const fetch = require('node-fetch');

    const url = 'https://api-us.cometchat.io/v2.0/users';
    const options = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            appId: '227288e14ee37703',
            apiKey: 'eec86b7681fa64295a4ce0b9c2a157885395785f',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid: createdSchool._id, name: createdSchool.schoolName })
    };

    fetch(url, options)
        .then(res => res.json())
        .then(json => console.log(json))
        .catch(err => console.error('error:' + err));

    res.status(201).json({ school: createdSchool.toObject({ getters: true }), schoolID: createdSchool._id });
    //const result = await createdPost.save();
    //res.json(result)
};

const getSchool = async (req, res, next) => {
    const school = await School.find().exec(); //Converting this into a promise using .exec()
    res.status(200).send(JSON.stringify(school))
    //res.json(post);
}


const editSchool = async (req, res, next) => {

    let newName = req.body.schoolName;
    let newDecription = req.body.aboutSchool;
    let newAdderss = req.body.schoolAddress;
    let newContactNumber = req.body.contactNumber;
    let newIcon = req.body.schoolIcon;
    let newZipCode = req.body.zipCode;
    let schoolEmail = req.body.schoolEmail;
    let newschoolType = req.body.schoolType;
    let neweducationType = req.body.educationType;
    let neweducationLevel = req.body.educationLevel;
    let newSchoolCoordinates = req.body.schoolCoordinates
    let newSchoolVideo = req.body.videos

    const schoolId = req.params.sid;

    let school;
    try {
        school = await School.findById(schoolId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update school.',
            500
        );
        return next(error);
    }

    //let allImages = school.images;

    school.schoolName = newName;
    school.aboutSchool = newDecription;
    school.schoolAddress = newAdderss;
    school.contactNumber = newContactNumber;
    school.zipCode = newZipCode;
    school.schoolEmail = schoolEmail
    school.schoolIcon = newIcon
    school.schoolType = newschoolType
    school.educationType = neweducationType
    school.videos = newSchoolVideo

    if (neweducationLevel != undefined) {
        school.educationLevel = neweducationLevel
    }

    if (newSchoolCoordinates != undefined) {
        school.schoolCoordinates = newSchoolCoordinates
    }


    try {
        await school.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update School.',
            500
        );
        console.log(err)
        return next(error);
    }

    res.status(200).json(school);

}

const addNewSchoolImages = async (req, res, next) => {

    let newImages = req.body.images;
    let newIcon = req.body.schoolIcon;
    console.log(newIcon)

    const schoolId = req.params.sid;

    let school;
    try {
        school = await School.findById(schoolId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find school.',
            500
        );
        return next(error);
    }

    //let allImages = school.images;

    if (newImages.path != null || newImages.path != undefined) {
        console.log("Uploading Image")
        school.images.push(newImages)
    }

    if (newIcon != undefined) {
        console.log("Uploading icon")
        school.schoolIcon = newIcon
    }

    // if (newVideos != null || newVideos != undefined || newVideos != '') {
    // console.log("uploading Video")
    // console.log(newIcon)
    // school.videos = newIcon
    // }

    try {
        //console.log("School")
        //console.log(school)
        await school.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update School.',
            500
        );
        console.log(err)
        return next(error);
    }

    res.status(200).json(school);

}


const editSchoolFee = async (req, res, next) => {

    let newFee = req.body;

    const schoolId = req.params.sid;

    let school;
    try {
        school = await School.findById(schoolId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find school.',
            500
        );
        return next(error);
    }

    if (newFee != undefined) {
        school.feeStructure = newFee;
    }

    try {
        await school.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update School.',
            500
        );
        console.log(err)
        return next(error);
    }

    res.status(200).json(school);

}


const deleteImage = async (req, res, next) => {

    let imageID = req.body.imageID;

    const schoolId = req.params.sid;

    let school;
    try {
        school = await School.findById(schoolId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find school.',
            500
        );
        return next(error);
    }

    let filteredArray = school.images.filter(function (value) {
        return value._id != imageID;
    });

    school.images = filteredArray;

    try {
        await school.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update School.',
            500
        );
        console.log(err)
        return next(error);
    }

    res.status(200).json(school);

}

const deleteSchool = async (req, res, next) => {

    const schoolID = req.params.sid;
    const adminID = req.body.adminID

    let school;
    try {
        school = await School.deleteOne({ _id: schoolID });
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not delete School.',
            500
        );
        return next(error);
    }

    let user;
    try {
        user = await Users.deleteOne({ _id: adminID });
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not delete School Admin.',
            500
        );
        return next(error);
    }

    res.status(200).json(school);
}

const deleteTeacher = async (req, res, next) => {

    const schoolID = req.params.sid;
    console.log(schoolID)
    const teacherID = req.body.teacherID
    console.log(teacherID)

    let school;
    try {
        school = await School.findOne({ _id: schoolID });
        console.log(school)
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find School.',
            500
        );
        return next(error);
    }

    let filteredArray = school.teachers.filter(function (value) {
        return value.teacherID != teacherID;
    });

    school.teachers = filteredArray;

    try {
        await school.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not delete teacher.',
            500
        );
        console.log(err)
        return next(error);
    }

    res.status(200).json(school);
}


exports.createSchool = createSchool;
exports.getSchool = getSchool;
exports.editSchool = editSchool;
exports.editSchoolFee = editSchoolFee;
exports.deleteSchool = deleteSchool;
exports.deleteTeacher = deleteTeacher;
exports.addNewSchoolImages = addNewSchoolImages;
exports.deleteImage = deleteImage;
