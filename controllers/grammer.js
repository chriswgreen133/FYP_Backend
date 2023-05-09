const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const axios = require('axios');
var FormData = require('form-data');
const fs = require("fs")
const { Configuration, OpenAIApi } = require("openai");

mongoose.connect(
    'mongodb+srv://chriswgreen11:chriswgreen133@fyp.4yejyi1.mongodb.net/reviews?retryWrites=true&w=majority'
).then(() => {
    console.log("DB connected")
}).catch(() => {
    console.log('Error occured, DB connection failed ')
})

const apikey = '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'

async function transcribeAudio(apiKey, audioFile) {
    const url = 'https://api.openai.com/v1/audio/transcriptions';

    const file_path = audioFile.path

    const formData = new FormData();
    formData.append('model', 'whisper-1');
    formData.append('file', fs.createReadStream(file_path));

    try {
        axios.post(url, formData, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            ...formData.getHeaders()
        }
        }).then(response => {
            console.log('========= response =========')
            console.log(response.data.text)
            return res.status(200).json(response.data.text);
        }).catch(error => {
            console.log(error)
            return res.status(200).json("Server Error");
        })
    } catch (error) {
        console.error(error);
        return res.status(200).json("Server Error");
    }
}

const transcribe = async (req, res, next) => {
    const file = req.file;
    console.log('audio_file req.file')
    console.log(file);

    const url = 'https://api.openai.com/v1/audio/transcriptions';

    const file_path = file.path

    const formData = new FormData();
    formData.append('model', 'whisper-1');
    formData.append('file', fs.createReadStream(file_path));

    try {
        axios.post(url, formData, {
        headers: {
            'Authorization': `Bearer ${apikey}`,
            ...formData.getHeaders()
            // 'Content-Type': `multipart/form-data; boundary=${formData._boundary}`
        }
        }).then(response => {
            console.log('========= response =========')
            console.log(response.data.text)
            return res.status(200).json(response.data.text);
        }).catch(error => {
            console.log(error)
            return res.status(200).json("Server Error");
        })

    } catch (error) {
        console.error(error);
    }
}

const analysis = async (req, res, next) => {
    const text = req.body.response;
    
    console.log('========= text ==========')
    console.log(text)

    const configuration = new Configuration({
        apiKey: apikey,
    });
    const openai = new OpenAIApi(configuration);
    
    openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {"role": "system", "content": "You are a grammer analysis assistant. i will provide you with english passages and you will have to correct its grammer and also explain how to improve the mistakes made."},
            {"role": "user", "content": text}
        ],
    }).then(response => {
        console.log('========= response =========')
        console.log(response.data.choices[0].message.content)
        return res.status(200).json(response.data.choices[0].message.content);
    }).catch(error => {
        console.log(error)
        return res.status(200).json("Server Error");
    })

    // console.log('========== response ===========')
    // console.log(response.data.choices[0].message);
}

exports.transcribe = transcribe;
exports.analysis = analysis;
