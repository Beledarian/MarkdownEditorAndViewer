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
    } catch (err) {
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
        for await (const entry of handle.values()) {
          await processEntry(entry, path + handle.name + '/');
        }
      }
    };

    await processEntry(directory);
    return { mdFiles, assetFiles };
};
