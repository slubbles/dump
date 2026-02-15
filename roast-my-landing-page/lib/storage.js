/**
 * STORAGE ADAPTER
 * 
 * Uses Vercel Blob in production, filesystem in local dev.
 * Automatically detects environment.
 */

const IS_VERCEL = !!(process.env.VERCEL || process.env.BLOB_READ_WRITE_TOKEN);

/**
 * Save a roast result
 */
export async function saveRoast(id, data) {
  if (IS_VERCEL) {
    const { put } = await import('@vercel/blob');
    await put(`roasts/${id}.json`, JSON.stringify(data), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
  } else {
    // Local filesystem fallback
    const { writeFile, mkdir } = await import('fs/promises');
    const path = await import('path');
    const dir = path.join(process.cwd(), 'data', 'roasts');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${id}.json`), JSON.stringify(data, null, 2));
  }
}

/**
 * Load a roast result by ID
 */
export async function loadRoast(id) {
  // Sanitize ID — only alphanumeric
  if (!/^[a-f0-9]+$/.test(id)) return null;

  if (IS_VERCEL) {
    const { list } = await import('@vercel/blob');
    try {
      const { blobs } = await list({ prefix: `roasts/${id}.json` });
      if (!blobs.length) return null;
      const res = await fetch(blobs[0].url);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  } else {
    // Local filesystem
    try {
      const { readFile } = await import('fs/promises');
      const path = await import('path');
      const raw = await readFile(path.join(process.cwd(), 'data', 'roasts', `${id}.json`), 'utf-8');
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
