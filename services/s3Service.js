const AWS = require('aws-sdk');
const fs = require("fs");
const path = require("path");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

exports.uploadToS3 = async (data, filename) => {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: filename,
    Body: data,
    ACL: 'public-read'
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, uploadData) => {
      if (err) return reject(err);
      resolve(uploadData.Location); 
    });
  });
};
