/*
 * Copyright 2017 Uncharted Software Inc.
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
