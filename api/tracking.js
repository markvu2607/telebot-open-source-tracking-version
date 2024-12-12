import { connectDB } from '../lib/db.js';
import trackingVersion from '../lib/tracking-version.js';

export default async function handler(req, res) {
  try {
    await connectDB();
    await trackingVersion();
    res.status(200).json({ message: 'Tracking completed' });
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ error: 'Tracking failed' });
  }
}
