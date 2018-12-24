// ==UserScript==
// @name        Wanikani Vocab JLPT Indicator
// @namespace   nicolerauch
// @author      nicolerauch
// @description Show which JLPT level the vocabulary word is in (if at all) according to
//              Jonathan Waller‘s JLPT Resources page http://www.tanos.co.uk/jlpt/.
//              The code is based on dtwigs "WaniKani Common Vocab Indicator" script.
// @run-at      document-end
// @include     *://www.wanikani.com/review/session*
// @include     *://www.wanikani.com/lesson/session*
// @version     0.0.1
// @run-at      document-end
// @grant       GM_xmlhttpRequest
// @connect     *
// ==/UserScript==

(function () {
    'use strict';

    console.log('/// start of WK Vocab JLPT Indicator');


    var css =
        '.jlpt-indicator-item {' +
        '    position: absolute;' +
        '    padding: 0px 5px 2px;' +
        '    top: 68px;' +
        '    left: 20px;' +
        '    -webkit-border-radius: 3px;' +
        '    -moz-border-radius: 3px;' +
        '    border-radius: 3px;' +
        '    z-index: 100;' +
        '    letter-spacing: 0;' +
        '    opacity: 0.8;' +
        '    text-decoration: none;' +
        '}' +
        '.jlpt-indicator-item.hide {' +
        '    background-color: transparent;' +
        '    color: transparent;' +
        '}' +
        '.jlpt-indicator-item.fetching {' +
        '    background-color: white;' +
        '    opacity: 0.4;' +
        '    color: #a100f1;' +
        '}' +
        '.jlpt-indicator-item.jlpt {' +
        '    background-color: white;' +
        '    color: #a100f1;' +
        '}' +
        '.jlpt-indicator-item.nojlpt {' +
        '    background-color: transparent;' +
        '    color: white;' +
        '    opacity: 0.5;' +
        '}';

    var jlptApiUrl = "http://localhost:5555/api/";
    var allClasses = {
        hide: {
            klass: 'hide',
            text: '',
        },
        fetching: {
            klass: 'fetching',
            text: '...',
        },
        jlptn5: {
            klass: 'jlpt',
            text: 'JLPT N5'
        },
        jlptn4: {
            klass: 'jlpt',
            text: 'JLPT N4'
        },
        jlptn3: {
            klass: 'jlpt',
            text: 'JLPT N3'
        },
        jlptn2: {
            klass: 'jlpt',
            text: 'JLPT N2'
        },
        jlptn1: {
            klass: 'jlpt',
            text: 'JLPT N1'
        },
        nojlpt: {
            klass: 'nojlpt',
            text: 'no JLPT word',
        }
    };

    addStyle(css);

    $('#question').append('<div id="jlpt-indicator" class="jlpt-indicator-item"></div>');
    $('#lessons').append('<div id="jlpt-indicator" class="jlpt-indicator-item"></div>');

//every time item changes, look up vocabulary word
    $.jStorage.listenKeyChange('currentItem', function () {
        handleJLPT($.jStorage.get('currentItem'));
    });

    $.jStorage.listenKeyChange('l/currentLesson', function () {
        handleJLPT($.jStorage.get('l/currentLesson'));
    });

    function handleJLPT(currentItem) {
        var vocab = currentItem.voc;
        var readings = currentItem.kana;
        console.log("Querying", vocab, readings);

        // Check if item is not vocab
        if (currentItem.on || currentItem.kun) {
            setClassAndText(allClasses.hide);
        } else {
            fetchJLPTData(vocab, readings);
        }
    }

    function fetchJLPTData(vocab, kana) {
        setClassAndText(allClasses.fetching);
        GM_xmlhttpRequest({
            method: 'get',
            url: jlptApiUrl + encodeURIComponent(vocab) + "/" + kana.map(encodeURIComponent).join("/"),
            responseType: 'text',
            onload: function (response) {
                setJLPTIndicator(response.response);
            },
            onerror: function (error) {
                console.log('JLPT API error: ', error);
            }
        });
    }

    function setJLPTIndicator(level) {
        setClassAndText(allClasses[level]);
    }

    function setClassAndText(aObj) {
        var $wrapper = $('#jlpt-indicator');
        for (var klass in allClasses) {
            $wrapper.removeClass(klass);
        }

        $wrapper.text(aObj.text).addClass(aObj.klass);
    }

    function addStyle(aCss) {
        var head, style;
        head = document.getElementsByTagName('head')[0];
        if (head) {
            style = document.createElement('style');
            style.setAttribute('type', 'text/css');
            style.textContent = aCss;
            head.appendChild(style);
            return style;
        }
        return null;
    }

})();