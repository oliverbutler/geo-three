import { generateOsUrl, generateSatelliteUrl } from '@geo-three/shared-utils';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

app.use('/public', express.static(path.join(__dirname, 'public')));

const downloadFile = async (url: string, fileName: string) => {
  const res = await fetch(url);

  if (!fs.existsSync('tiles')) {
    fs.mkdirSync('tiles');
  }

  const destination = path.resolve(`./public/${fileName}`);

  const fileStream = fs.createWriteStream(destination, { flags: 'wx' });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await finished(Readable.fromWeb(res.body as any).pipe(fileStream));
};

app.get('/tile', async (req, res) => {
  const query = req.query as { quadKey: string; type: 'os' | 'sat' };

  const fileName = `${query.quadKey}-${query.type}.${
    query.type === 'sat' ? 'jpeg' : 'webp'
  }`;

  const existingFile = fs.existsSync(`./public/${fileName}`);

  if (!existingFile) {
    if (query.type === 'sat') {
      const url = generateSatelliteUrl(query.quadKey);

      await downloadFile(url, `${fileName}`);
    } else {
      const url = generateOsUrl(query.quadKey, process.env['NX_MAP_KEY']);

      await downloadFile(url, `${fileName}`);
    }
  }

  const fileBuffer = fs.readFileSync(`./public/${fileName}`);

  res.writeHead(200, {
    'Content-Type': 'image/webp',
    'Content-Length': fileBuffer.length,
    'Cache-Control': 'public, max-age=31536000',
  });

  res.end(fileBuffer);
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
