import { fileURLToPath } from 'url';
import path from 'path';

// Production-compatible __dirname equivalent
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
