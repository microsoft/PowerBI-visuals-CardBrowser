/*
 * Copyright 2018 Uncharted Software Inc.
 */

export default function(value, options) {
    const fnTrue = options.fn;
    const fnFalse = options.inverse;
    const supportedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    const isImageDataUrl = supportedImageTypes.some(imageType => value.indexOf && value.indexOf(`data:${imageType};base64`) === 0);
    return isImageDataUrl ? fnTrue(this) : fnFalse(this);
}
