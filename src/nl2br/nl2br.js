angular.module('ui.atomic.nl2br', [])
    .filter('nl2br', [function () {
        return function (text, is_xhtml) {
            if (text) {
                var is_xhtml = is_xhtml || true;
                var breakTag = (is_xhtml) ? '<br />' : '<br>';
                var text = (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
                return text;
            }
            return '';
        }
    }]
    );