import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../uploads');
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const blockedExtensions = new Set([
  '.exe', '.bat', '.cmd', '.com', '.scr', '.dll', '.msi', '.jar', '.apk', '.sh', '.ps1',
]);

fs.mkdirSync(uploadDir, { recursive: true });

function classify(mimeType = '') {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'file';
}

function publicBaseUrl(req) {
  if (env.PUBLIC_URL) return env.PUBLIC_URL.replace(/\/+$/, '');
  const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const protocol = forwardedProto || req.protocol || 'http';
  return `${protocol}://${req.get('host')}`;
}

router.post('/upload', requireAuth, async (req, res, next) => {
  try {
    const contentLength = Number(req.get('content-length') || 0);
    if (contentLength && contentLength > MAX_FILE_SIZE * 1.4) {
      return res.status(413).json({
        success: false,
        message: 'File is too large. Maximum upload size is 100 MB.',
      });
    }

    if (!req.is('multipart/form-data')) {
      return res.status(415).json({
        success: false,
        message: 'Upload must use multipart/form-data.',
      });
    }

    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value == null) return;
      if (Array.isArray(value)) {
        value.forEach((item) => headers.append(key, item));
      } else {
        headers.set(key, String(value));
      }
    });

    const webRequest = new Request(`${publicBaseUrl(req)}${req.originalUrl}`, {
      method: req.method,
      headers,
      body: Readable.toWeb(req),
      duplex: 'half',
    });

    const formData = await webRequest.formData();
    const file = formData.get('file');

    if (!file || typeof file.arrayBuffer !== 'function') {
      return res.status(400).json({
        success: false,
        message: 'No file was uploaded.',
      });
    }

    if (file.size > MAX_FILE_SIZE) {
      return res.status(413).json({
        success: false,
        message: 'File is too large. Maximum upload size is 100 MB.',
      });
    }

    const originalName = file.name || 'upload';
    const extension = path.extname(originalName).toLowerCase();
    if (blockedExtensions.has(extension)) {
      return res.status(400).json({
        success: false,
        message: `This file type is not allowed: ${extension || 'unknown'}`,
      });
    }

    const safeExtension = /^[a-z0-9.]{0,12}$/i.test(extension) ? extension : '';
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${safeExtension}`;
    const destination = path.join(uploadDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());

    await fs.promises.writeFile(destination, buffer);

    const url = `${publicBaseUrl(req)}/uploads/${filename}`;

    return res.status(201).json({
      success: true,
      message: 'Media uploaded successfully.',
      data: {
        url,
        kind: classify(file.type || ''),
        mime_type: file.type || 'application/octet-stream',
        original_name: originalName,
        size: file.size,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
