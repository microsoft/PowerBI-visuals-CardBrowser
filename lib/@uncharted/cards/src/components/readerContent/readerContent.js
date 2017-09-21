import $ from 'jquery';
import readerContentTemplate from './readerContent.handlebars';
import { IBindable, createFallbackIconURL } from '../../util';
import { DEFAULT_CONFIG, EVENTS } from '../constants';

export default class ReaderContent extends IBindable {
    constructor(spec = {}) {
        super();
        this._config = Object.assign({}, DEFAULT_CONFIG, spec.config);
        this.data = spec.data;
        this._render();
        this._registerEvents();
    }

    _render() {
        const data = Object.assign({
            iconUrl: this._getIconUrl(),
            subtitleDelimiter: this._config.subtitleDelimiter,
        }, this.data);
        this.$element = $(readerContentTemplate(data));
    }

    _getIconUrl() {
        const source = this.data.sourceIconName || this.data.source;
        return this.data.sourceImage || (this.data.source && createFallbackIconURL(50, 50, source));
    }

    _registerEvents() {
        this.$element.on('click', '.close-button', event => {
            event.stopPropagation();
            this.emit(EVENTS.READER_CONTENT_CLICK_CLOSE, this);
        });
    }
}
