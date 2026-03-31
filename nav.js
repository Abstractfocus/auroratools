(function () {
    var nav = document.getElementById('toolNav');
    var tabs = nav.querySelectorAll('.tab-btn');
    var tools = document.querySelectorAll('.container > .tool');

    function showTool(targetId) {
        tools.forEach(function (tool) {
            if (tool.id === targetId) {
                tool.classList.remove('tool-hidden');
            } else {
                tool.classList.add('tool-hidden');
            }
        });
        tabs.forEach(function (btn) {
            if (btn.getAttribute('data-target') === targetId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Show first tool by default
    if (tabs.length > 0) {
        showTool(tabs[0].getAttribute('data-target'));
    }

    // Delegate clicks on the nav
    nav.addEventListener('click', function (e) {
        var btn = e.target.closest('.tab-btn');
        if (!btn) return;
        showTool(btn.getAttribute('data-target'));
    });
})();
