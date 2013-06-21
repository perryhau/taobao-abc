$(function () {
    var sliderIndex = 0,
        sliderTimer;

    sliderTimer = window.setInterval(function () {
        sliderIndex = toggleIndex(sliderIndex);
    }, 8000);

    $(".slider-number a").on("click", function () {
        sliderIndex = parseInt($(this).text()) - 1;

        toggleSlider(sliderIndex);
        window.clearInterval(sliderTimer);

        sliderTimer = window.setInterval(function () {
            sliderIndex = toggleIndex(sliderIndex);
        }, 8000);
    });

    $("#toggle .down").on("click", function () {
        $("#intro").removeClass("hidden");
        $(".footer").addClass("hidden");
        $("#start-page").animate({marginTop : "-682px"}, 1200).queue(function (next) {
            $(this).addClass("hidden");
            next();
        });
        $(this).fadeOut(1200, "linear");
        $("#toggle .up").fadeIn(1200, "linear");
        $("#toggle").addClass("above");
    });

    $("#toggle .up").on("click", function () {
        $("#toggle").removeClass("above");
        $(this).fadeOut(1200, "linear");
        $("#toggle .down").fadeIn(1200, "linear");
        $("#start-page").animate({marginTop : "0"}, 1200).removeClass("hidden");
        $(".footer").removeClass("hidden");
        $("#intro").addClass("hidden");
    });
});

function toggleIndex(index) {
    index = index + 1 > 3 ? 0 : index + 1;
    toggleSlider(index);
    return index;
}

function toggleSlider(targetIndex) {
    $(".slider li").removeClass("show-opacity")
                   .addClass("hide-opacity")
                   .css("opacity", "0");
    $(".slider-number a").removeClass("active");
    $(".slider-number a:eq(" + targetIndex +")").addClass("active");
    $(".slider li:eq(" + targetIndex +")").animate({opacity : 1}, 1000);
}