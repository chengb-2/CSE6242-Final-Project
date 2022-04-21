const sliderRescaleRange = {
    left: 0.1,
    right: 0.1,
    min: 0.2,
    max: 0.6
};

var rangeSliderValueElement = document.getElementById('slider-range-value');
var rangeSlider = document.getElementById('slider-range');
function initSlider() {
    noUiSlider.create(rangeSlider, {
        start: [dcount * 0.3, dcount * 0.6],
        tooltips: [true, true],
        step: 1,
        margin: 5,
        behaviour: "drag",
        connect: true,
        
        range: {
            'min': 0,
            'max': dcount
        }
    });
    
    rangeSlider.noUiSlider.on('update', function (values, handle) {
        start = +values[0];
        end = +values[1];
        scale = (end - start) / dcount;
        rangeSliderValueElement.innerHTML = "Exploring text entries from   " + start + "   to   " + end + " (" + (scale * 100).toFixed(2) + "%) . Word Cloud Generation make take a few seconds.";
        update();
    });

    rangeSlider.noUiSlider.on('end', function (values, handle) {
        start = +values[0];
        end = +values[1];
        scale = (end - start) / dcount;
        let scalar_min = rangeSlider.noUiSlider.options.range.min;
            scalar_max = rangeSlider.noUiSlider.options.range.max;
            scale_range = scalar_max - scalar_min;
        if ((end - start) < sliderRescaleRange.min * scale_range || (end - start) > sliderRescaleRange.max * scale_range) {
            setSliderRange(2 * start - end, 2 * end - start)
        } else if ((start - scalar_min) < sliderRescaleRange.left * scale_range){
            let target = 2 * start - end;
            setSliderRange(target, target + scale_range);
        } else if ((scalar_max - end) < sliderRescaleRange.right * scale_range) {
            let target = 2 * end - start;
            setSliderRange(target - scale_range, target);
        }
        rangeSliderValueElement.innerHTML = "Exploring text entries from   " + start + "   to   " + end + " (" + (scale * 100).toFixed(2) + "%) . Word Cloud Generation make take a few seconds.";
        endUpdate();
    });

    
}

function setSliderRange(min, max) {
    rangeSlider.noUiSlider.updateOptions({
        range: {
            'min': Math.max(0, min),
            'max': Math.min(dcount, max)
        }
    });
}

// Define Slider
function setRange(start, end) {
start = start;
end = end;
rangeSlider.noUiSlider.set([start, end])
rangeSlider.noUiSlider.updateOptions({
    range: {
        'min': Math.max(0, 2 * start - end),
        'max': Math.min(dcount, 2 * end - start)
        }
});
endUpdate();
}