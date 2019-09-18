// ==UserScript==
// @name        Wanikani JLPT Indicator
// @namespace   nicolerauch
// @author      nicolerauch & myria
// @description Show which JLPT level the kanji or vocabulary word is in (if at all) according to Jonathan Waller‘s JLPT Resources page http://www.tanos.co.uk/jlpt/. The code is based on dtwigs "WaniKani Common Vocab Indicator" script. This code is at https://github.com/NicoleRauch/WaniKaniJLPT
// @run-at      document-end
// @include     *://www.wanikani.com/review/session*
// @include     *://www.wanikani.com/lesson/session*
// @version     0.3.0
// @run-at      document-end
// @grant       GM_xmlhttpRequest
// @connect     wanikanijlpt.herokuapp.com
// ==/UserScript==

(function () {
    'use strict';

    var jlptApiUrl = "https://wanikanijlpt.herokuapp.com/api/";

    console.log('/// Start of WK Kanji & Vocab JLPT Indicator');


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
        '    background-color: transparent;' +
        '    color: white;' +
        '    opacity: 0.5;' +
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

    var allClasses = {
        hide: {
            klass: 'hide',
            text: ''
        },
        fetching: {
            klass: 'fetching',
            text: '...'
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
            text: 'no JLPT word'
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

    $.jStorage.listenKeyChange('l/currentQuizItem', function () {
        handleJLPT($.jStorage.get('l/currentQuizItem'));
    });

    $.jStorage.listenKeyChange('l/overlayStartQuiz', function () {
        setJLPTIndicator("hide"); // remove indicator during quiz start overlay screen
    });

    $.jStorage.listenKeyChange('l/overlayStartLesson', function () {
        setJLPTIndicator("hide"); // remove indicator during lesson start overlay screen
    });

    function handleJLPT(currentItem) {
        if(!currentItem) return;

        var kanji = currentItem.kan;
        var vocab = currentItem.voc;
        var readings = currentItem.kana;

        // also query kanji from the backend because we need the hide information from the backend
        // due to race conditions with the reorder script
        fetchJLPTData(kanji, vocab, readings || []);
    }

    function fetchJLPTData(kanji, vocab, kana) {
        setClassAndText(allClasses.fetching);
        GM_xmlhttpRequest({
            method: 'get',
            url: jlptApiUrl + (
                kanji ? encodeURIComponent(kanji) :
                    vocab ? (encodeURIComponent(vocab.replace(/する$|〜/,'')) + "/" +
                        kana.map(function(k){return k.replace(/する$/,'')}).map(encodeURIComponent).join("/")) :
                        "noword"),
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
        for (var entry in allClasses) {
            $wrapper.removeClass(allClasses[entry].klass);
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
