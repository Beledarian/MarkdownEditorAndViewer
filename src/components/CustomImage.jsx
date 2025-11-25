import React, { useState, useEffect } from 'react';

const CustomImage = ({ src, alt, assets, currentFilePath }) => {
    const [imgSrc, setImgSrc] = useState(src);

    useEffect(() => {
        let isMounted = true;
        const loadLocalImage = async () => {
            if (src && !src.match(/^(http|https|data):/)) {
                let asset = null;
                // 1. Try exact path match (absolute path from project root)
                asset = assets.find(a => a.path === src);

                // 2. Try relative to current file
                if (!asset && currentFilePath) {
                    const currentDir = currentFilePath.includes('/')
                        ? currentFilePath.substring(0, currentFilePath.lastIndexOf('/'))
                        : '';

                    let potentialPath = currentDir ? `${currentDir}/${src}` : src;
                    potentialPath = potentialPath.replace(/\/\.\//g, '/');

                    asset = assets.find(a => a.path === potentialPath);
                }

                // 3. Fallback: match by filename (lazy mode)
                if (!asset) {
                    const cleanName = src.replace(/^.*[\\/]/, '');
                    asset = assets.find(a => a.name === cleanName);
                }

                if (asset && asset.handle) {
                    try {
                        const file = await asset.handle.getFile();
                        const url = URL.createObjectURL(file);
                        if (isMounted) setImgSrc(url);
                        return () => URL.revokeObjectURL(url);
                    } catch (e) {
                        console.error("Failed to load image asset", e);
                    }
                }
            }
        };
        loadLocalImage();
        return () => { isMounted = false; };
    }, [src, assets, currentFilePath]);

    return <img src={imgSrc} alt={alt} style={{ maxWidth: '100%' }} />;
};

export default CustomImage;
