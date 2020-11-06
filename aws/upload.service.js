const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    region : 'us-east-2'
});
const s3 = new AWS.S3();

async function uploadFileToAws(file, foldername) {

    const fileName = `${new Date().getTime()}_${file.name}`;
    const mimetype = file.mimetype;
    const randomName = Array(8)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString())
        .join('');
    const params = {
        Bucket: process.env.Bucket,
        Key: `${foldername}/${randomName}`,
        Body: file.data,
        ContentType: 'application/json; charset=utf-8',
        ACL: 'public-read'
    } 
    
    const res = await new Promise((resolve, reject) => {
        s3.upload(params, (err, data) => err == null ? resolve(data) : reject(err));
        });
    return {fileUrl: res.Location };
}

async function deleteFileToAws(fileName) {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: process.env.Bucket,
            Key: fileName.substring(41)
        };
        s3.deleteObject(params, (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve();
        })
    });
}

module.exports= {
    uploadFileToAws,
    deleteFileToAws
};