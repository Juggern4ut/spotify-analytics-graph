window.onload = function () {
    window["graph"] = new Graph();
    var stress = document.getElementById("stress");
    stress.onchange = function () {
        if (stress.checked) {
            window["graph"].dropFps = true;
        }
        else {
            window["graph"].dropFps = false;
        }
    };
};
