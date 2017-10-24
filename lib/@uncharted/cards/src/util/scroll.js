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

import debounce from 'lodash/debounce';

const V_TO_H_MOUSE_WHEEL_EVENT = 'wheel.uncharted.verticalToHorizontal';

export function mapVerticalToHorizontalScroll($element) {
    $element.on(V_TO_H_MOUSE_WHEEL_EVENT, event => {
        const { deltaX, deltaY } = event.originalEvent;
        const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
        $element.scrollLeft($element.scrollLeft() + delta);
        event.preventDefault();
    });
}

export function delayOnHorizontalToVerticalScrollingTransition($element, verticalScrollContainerSelector, delay = 1000) {
    let canIScrollVertically = true;
    const preventFollowingVerticalScrolling = debounce(function () {
        canIScrollVertically = true;
    }, delay);

    $element.on(V_TO_H_MOUSE_WHEEL_EVENT, () => {
        canIScrollVertically = false;
        preventFollowingVerticalScrolling();
    });
    $element.on(V_TO_H_MOUSE_WHEEL_EVENT, verticalScrollContainerSelector, event => {
        event.stopPropagation();
        !canIScrollVertically && event.preventDefault();
    });
}

export function unMapVerticalToHorizontalScroll($element) {
    $element.off(V_TO_H_MOUSE_WHEEL_EVENT);
}
