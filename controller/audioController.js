const Audio = require('../models/audio');
const fileUploadService = require('../aws/upload.service');

async function addAudio(req, res, next) {
    try {
        if (req.files && req.files.audio) {
            const audioFile = req.files.audio;
            
            const uploadRes = await fileUploadService.uploadFileToAws(audioFile, 'audios');
            const audio = await new Audio({
                title: req.body.title,
                description: req.body.description,
                audio: uploadRes.fileUrl
            });

            await audio.save().then(audio => {
                res.status(201).json({
                    message: 'Audio created successfully',
                    data: audio
                });
            }).catch(error => {
                res.status(500).json({
                    message: 'Creating a audio faield'
                })
            });
        } else {
            const errMsg = {
                message: 'FILES_NOT_FOUND',
                messageCode: 'FILES_NOT_FOUND',
                statusCode: 404
            };
            return res.status(404).send(errMsg);
        }
    } catch(error) {
        return next(error);
    }
};

async function deleteAudio(req, res, next) {
    try {
        await Audio.findById(req.params.id)
            .then(async (result) => {
                if (result.image) {
                    await fileUploadService.deleteFileToAws(result.image);
                }
                if (result.audio) {
                    await fileUploadService.deleteFileToAws(result.audio);
                }

                await Audio.deleteOne({_id: result._id})
                    .then(result => {
                        res.status(200).json({
                            message: 'Deletion successfull!'
                        });
                    })
                    .catch(error => {
                        res.status(500).json({
                            message: 'Fetching Audio failed!'
                        });
                    })
            }).catch(err => {
                res.status(500).json({
                    message: 'Fetching audio failed!'
                });
            });
    } catch(error) {
        return next(error);
    }
};

async function updateAudio(req, res, next) {
    try {
        let title  = req.body.title;
        let description  = req.body.description;
        const audioImport = await Audio.findByIdAndUpdate(req.params.id);
        if (title) {
            audioImport.title = title;
        }
        if (description) {
            audioImport.description = description;
        }
        if (req.files) {
            if (audioImport.audio) {
                await fileUploadService.deleteFileToAws(audioImport.audio);
            }
            let audio = req.files.audio;
            let file = await (await fileUploadService.uploadFileToAws(audio, 'audios')).fileUrl;

            audioImport.audio = file;
        }
        
        await audioImport.save().then(result => {
            res.status(200).json({
                result: result
            });
        }).catch(err => {
            res.status(200).json({
                message: "Couldn't update audio!",
                error: err
            });
        });
            
    } catch(error) {
        return next(error);
    }
}

async function getAllAudios(req, res, next) {
    try {
        // All Audios
        let fetchedAudios;
        // Pagination
        const pageSize = +req.query.pagesize;
        const currentPage = +req.query.page;
        const audioQuery = await Audio.find();
        if (pageSize && currentPage) {
            audioQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
        }

        audioQuery
            .then(audios => {
                fetchedAudios = audios;
                return Audio.count();
            })
            .then(count => {
                res.status(200).json({
                    message: 'Audio fetched successfully',
                    audios: fetchedAudios,
                    maxPosts: count
                });
            })
            .catch(error => {
                res.status(500).json({
                    message: 'Fetching audios faild!'
                })
            });
    } catch(error) {
        return next(error);
    }
}

async function getById(req, res, next) {
    try {
        await Audio.findById(req.params.id)
            .then(audio => {
                res.status(200).json({
                    message: 'Audio fetched successfully',
                    audioById: audio
                });
            })
            .catch(err => {
                res.status(500).json({
                    message: 'Fetching audio failed!'
                });
            });
    } catch(error) {
        return next(error);
    }
}

module.exports = {
    addAudio,
    deleteAudio,
    updateAudio,
    getAllAudios,
    getById
}
