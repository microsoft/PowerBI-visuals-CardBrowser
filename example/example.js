import ReviChart from '../src/component/ReviChart';
import _ from 'lodash';

function subscribe(chart) {
    _.forEach(ReviChart.Events, (event) => {
        chart.on(event, (e) => {
            let msg = document.getElementById('output').innerHTML + '<br/>' + event;
            const values = e.length ? e : [e];
            _.forEach(values, (value) => {
                msg += ' ' + value;
            });
            document.getElementById('output').innerHTML = msg;
        })
    });
}

function unsubscribe(chart) {
    _.forEach(ReviChart.Events, (event) => {
        chart.off(event);
    });
}

function init() {

    // Populate the dropdown list of examples
    const select = document.getElementById('sample');
    const samples = getSampleData();
    _.forEach(samples, (data, key) => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.innerHTML = key;
        select.appendChild(opt);
    });

    // grab the default example
    let data = samples[select.options[select.selectedIndex].value];
    const chart = new ReviChart(document.getElementById('kanjo-panel'), data);

    const logEvents = document.getElementById("logEvents");
    if (logEvents.checked) {
        subscribe(chart);
    }
    logEvents.onchange = () => {
        logEvents.checked ? subscribe(chart) : unsubscribe(chart);
    };

    select.onchange = () => {
        const value = select.options[select.selectedIndex].value;
        data = samples[value];
        if (value === 'animated') {
            // Test dynamic updates    
            data.charts[0].series[2].values = data.charts[0].series[3].values;
            const step = () => {
                if (select.options[select.selectedIndex].value === 'animated') {
                    const bubbles = data.charts[0].series[3].values;
                    bubbles.forEach((bubble) => {
                        bubble.size = Math.abs(bubble.size + (Math.random() - 0.5));
                    });
                    data.charts[0].viewport.scrollLeft = Math.min(data.charts[0].viewport.contentWidth,
                        Math.max(0, data.charts[0].viewport.scrollLeft + (Math.random() > 0.5 ? 1 : -1)));
                    data.charts[0].viewport.scrollTop = Math.min(data.charts[0].viewport.contentHeight,
                        Math.max(0, data.charts[0].viewport.scrollTop + (Math.random() > 0.5 ? 1 : -1)));
                    chart.updateData(data);

                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        }
        else {
            chart.updateData(data);
        }
    };

    return chart;
}

const readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        init();
    }
}, 10);