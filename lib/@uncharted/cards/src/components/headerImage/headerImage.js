/*
 * Copyright 2017 Uncharted Software Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { IBindable, loadImage } from '../../util';
import { DEFAULT_CONFIG } from '../constants';

export default class HeaderImage extends IBindable {
    constructor(spec = {}) {
        super();
        this.reset(spec);
    }

    reset(spec) {
        this.MAX_NUM_IMAGES = 4;
        this.DEFAULT_IMAGE_HEIGHT = 100;
        this.DEFAULT_IMAGE_BG_COLOR = '#FFF';

        this._config = Object.assign({}, DEFAULT_CONFIG, spec.config);
        this.imageUrls = [].concat(spec.imageUrls || []).slice(0, this.MAX_NUM_IMAGES);
        this.loadedImagePromises = this.imageUrls.map(imageUrl => loadImage(imageUrl));
        this._mirrorLastImage = Boolean(spec.mirrorLastImage);
        this._mirrorImageGradientColor = spec.mirrorImageGradientColor || '#555';
        this.imageHeight = spec.imageHeight || this.DEFAULT_IMAGE_HEIGHT;
        this.imgMaxWidth = `${spec.imageMaxWidth}px` || 'none';

        this.portraitImageMaxWidth = '100px';
        return this;
    }

    render() {
        const lastImageUrl = this.imageUrls[this.imageUrls.length - 1];
        const wrapImages = this.imageHeight > this.DEFAULT_IMAGE_HEIGHT && this.imageUrls.length > 2;
        this.$element = $('<div class="uncharted-thumbnails-header-image"></div>')
            .css({
                'background-color': this._mirrorLastImage ? this._mirrorImageGradientColor : this.DEFAULT_IMAGE_BG_COLOR,
                'height': `${this.imageHeight}px`,
                'flex-wrap': wrapImages ? 'wrap' : 'nowrap',
            });
        this._$partialImages = this.imageUrls.map(imageUrl => {
            const $image = $('<div class="image"></div>')
                .css({
                    'background-image': `url(${imageUrl})`,
                    'max-width': this.imgMaxWidth,
                });
            return wrapImages ? $image.css({ height: '50%', width: '50%', 'flex-grow': 0 }) : $image;
        });
        if (this._mirrorLastImage && lastImageUrl) {
            this._$partialImages.push($(`
                <div class="mirror-image-box">
                    <div class="gradient" style="background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, ${ this._mirrorImageGradientColor } 61.8%); max-width: ${this.imgMaxWidth}"></div>
                    <div class="image" style="background-image: url(${lastImageUrl}); max-width: ${this.imgMaxWidth};" ></div>
                </div>
            `));
        }
        return this.$element.append(this._$partialImages);
    }

    hasImages() {
        return this.imageUrls.length > 0;
    }

    scaleImages(containerWidth, containerHeight) {
        const $partialImages = [];
        const numberOfImages = this.imageUrls.length;
        const partialImageWidth = containerWidth / numberOfImages;
        const partialImageHeight = containerHeight / numberOfImages;
        const subdivided = numberOfImages > 1;
        this.loadedImagePromises.forEach((imagePromise, index) => {
            imagePromise.then(img => {
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
                    'background-image': `url(${this.imageUrls[index]})`,
                });
            });
        });
        return $partialImages;
    }

    fitImages() {
        this.loadedImagePromises.forEach((imagePromise, index, array) => {
            imagePromise.then(img => {
                const aspectRatio = img.width / img.height;
                const imageProperty = {
                    'max-width': Math.round(this.imageHeight * aspectRatio) + 'px',
                    'background-size': 'cover',
                };
                this._$partialImages[index].css(imageProperty);
                if (index === array.length - 1) {
                    this._$partialImages[array.length].find('.image, .gradient').css(imageProperty);
                }
            });
        });
    }
}

