export default (imageUrl, block) => {
    const imagesUrls = imageUrl ? [].concat(imageUrl) : [];
    let output = '';
    imagesUrls.forEach(url => {
        output += block.fn({ url });
    });
    return output;
};
