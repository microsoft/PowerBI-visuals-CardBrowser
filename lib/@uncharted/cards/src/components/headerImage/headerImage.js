
import { IBindable, loadImage } from '../../util';
import { DEFAULT_CONFIG } from '../constants';

export default class HeaderImage extends IBindable {
    constructor(spec = {}) {
        super();
        this.reset(spec);
    }

    reset(spec) {
        this._config = Object.assign({}, DEFAULT_CONFIG, spec.config);
        this.imageUrls = [].concat(spec.imageUrls || []);
        this._mirrorLastImage = Boolean(spec.mirrorLastImage);
        this._mirrorImageGradientColor = spec.mirrorImageGradientColor || '#555';
        this.imgMaxWidth = '250px';
        this.portraitImageMaxWidth = '100px';
        return this;
    }

    render() {
        const lastImageUrl = this.imageUrls[this.imageUrls.length - 1];
        this.$element = $('<div class="uncharted-thumbnails-header-image"></div>').css({
            'background-color': this._mirrorImageGradientColor,
        });
        this._$partialImages = this.imageUrls.map(imageUrl => $('<div class="image"></div>')
            .css({
                'background-image': `url(${imageUrl})`,
                'max-width': this.imgMaxWidth,
            })
        );
        if (this._mirrorLastImage && lastImageUrl) {
            this._$partialImages.push($(`
                <div class="mirror-image-box">
                    <div class="gradient" style="background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, ${ this._mirrorImageGradientColor } 61.8%); max-width: ${this.imgMaxWidth}"></div>
                    <div class="image" style="background-image: url(${lastImageUrl}); max-width: ${this.imgMaxWidth};" ></div>
                </div>
            `));
        }
        // <div class="padding" style="background: ${this._mirrorImageGradientColor}; border-left-color: ${this._mirrorImageGradientColor};" ></div>
        return this.$element.append(this._$partialImages);
    }

    hasImages() {
        return this.imageUrls.length > 0;
    }

    scaleImages(containerWidth, containerHeight) {
        const $partialImages = [];
        this.imageUrls.forEach((imageUrl, index, array) => {
            const partialImageWidth = containerWidth / array.length;
            const partialImageHeight = containerHeight / array.length;
            const subdivided = array.length > 1;
            loadImage(imageUrl).then(img => {
                const scale = Math.max(partialImageWidth / img.width, partialImageHeight / img.height);
                const scaledWidth = Math.round(img.width * scale);
                let sizeType = 'cover';
                if ((subdivided && scaledWidth < partialImageWidth) || (!subdivided && scaledWidth > partialImageWidth)) {
                    sizeType = 'contain';
                } else if (scale > 1) {
                    sizeType = 'auto';
                }
                this._$partialImages[index].css({
                    'background-size': sizeType,
                    'background-image': `url(${imageUrl})`,
                });
            });
        });
        return $partialImages;
    }

    shrinkPortraitImages() {
        this.imageUrls.forEach((imageUrl, index, array) => {
            loadImage(imageUrl).then(img => {
                const aspectRatio = img.width / img.height;
                const imageProperty = {
                    'max-width': `${this.portraitImageMaxWidth}`,
                    'background-size': 'cover',
                    'background-position': '50% 16.7%',
                };
                if (aspectRatio <= 1) {
                    this._$partialImages[index].css(imageProperty);
                    if (index === array.length - 1) {
                        this._$partialImages[array.length].find('.image, .gradient').css(imageProperty);
                    }
                }
            });
        });
    }
}

