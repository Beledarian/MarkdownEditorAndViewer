// File System Utilities

export const isIgnored = (name, patterns) => {
  return patterns.some(pattern => name.includes(pattern));
};

export const loadIgnoreFile = async (directory) => {
  try {
    const fileHandle = await directory.getFileHandle('.md-ignore', { create: false });
    const file = await fileHandle.getFile();
    const text = await file.text();
    const patterns = JSON.parse(text);
    if (Array.isArray(patterns)) {
      return patterns;
    }
  } catch {
    // console.log('No .md-ignore file found or invalid format.');
  }
  return ['node_modules', '.git', 'dist', 'build'];
};

export const saveIgnoreFile = async (patterns, directory) => {
  if (!directory) return;
  try {
    const fileHandle = await directory.getFileHandle('.md-ignore', { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(patterns, null, 2));
    await writable.close();
    return true;
  } catch (err) {
    console.error('Failed to save ignore file:', err);
    throw err;
  }
};

export const scanDirectory = async (directory, patterns) => {
  const mdFiles = [];
  const assetFiles = [];
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];

  // Simple concurrency limiter
  const MAX_CONCURRENCY = 20;
  let activeCount = 0;
  const queue = [];

  const enqueue = (fn) => {
    return new Promise((resolve, reject) => {
      const run = async () => {
        activeCount++;
        try {
          await fn();
          resolve();
        } catch (e) {
          reject(e);
        } finally {
          activeCount--;
          if (queue.length > 0) {
            queue.shift()();
          }
        }
      };

      if (activeCount < MAX_CONCURRENCY) {
        run();
      } else {
        queue.push(run);
      }
    });
  };

  const processEntry = async (handle, path = '') => {
    if (isIgnored(handle.name, patterns)) return;

    if (handle.kind === 'file') {
      const name = handle.name.toLowerCase();
      if (name.endsWith('.md')) {
        mdFiles.push({
          name: handle.name,
          path: path + handle.name,
          handle: handle,
          type: 'md'
        });
      } else if (imageExtensions.some(ext => name.endsWith(ext))) {
        assetFiles.push({
          name: handle.name,
          path: path + handle.name,
          handle: handle,
          type: 'image'
        });
      }
    } else if (handle.kind === 'directory') {
      const entries = [];
      for await (const entry of handle.values()) {
        entries.push(entry);
      }

      // Process children with concurrency limit
      const promises = entries.map(entry =>
        enqueue(() => processEntry(entry, path + handle.name + '/'))
      );
      await Promise.all(promises);
    }
  };

  await processEntry(directory);
  return { mdFiles, assetFiles };
};
