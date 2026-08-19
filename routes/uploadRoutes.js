const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const minioClient = require('../config/minioClient');
const authMiddleware = require('../middlewares/authMiddleware'); 
const path = require('path');

router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }


    const bucketName = process.env.MINIO_BUCKET_NAME || 'task-attachments';
    const fileExt = path.extname(req.file.originalname);
    const sanitizedOriginalName = path
      .basename(req.file.originalname, fileExt)
      .replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${Date.now()}-${sanitizedOriginalName}${fileExt}`;

    await minioClient.putObject(
      bucketName,
      fileName,
      req.file.buffer,
      req.file.size,
      { 'Content-Type': req.file.mimetype }
    );

    const fileUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${fileName}`;

    return res.status(200).json({
      message: 'File uploaded successfully',
      url: fileUrl,
      fileName: fileName,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    console.error('MinIO upload error:', error);
    return res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

module.exports = router;