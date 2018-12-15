// ==UserScript==
// @name        Wanikani Vocab JLPT Indicator
// @namespace   dtwigs
// @author      dtwigs
// @description Show which JLPT level the vocabulary word is in (if at all) according to Jisho.org.
//              Based on dtwigs "WaniKani Common Vocab Indicator" script.
// @run-at      document-end
// @include     *://www.wanikani.com/review/session*
// @include     *://www.wanikani.com/lesson/session*
// @version     0.0.4
// @run-at      document-end
// @grant       GM_xmlhttpRequest
// @connect     *
// ==/UserScript==

console.log('/// start of WK Vocab JLPT Indicator');


var css =
    '.jlpt-indicator-item {' +
    '    position: absolute;' +
    '    padding: 0px 5px 2px;' +
    '    top: 65px;' +
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

var jishoApiUrl = "http://jisho.org/api/v1/search/words?keyword=";
var jishoSearchUrl = "http://jisho.org/search/";
var allClasses = {
    hide: {
        klass: 'hide',
        text: '',
    },
    fetching: {
        klass: 'fetching',
        text: '...',
    },
    jlpt: {
        klass: 'jlpt',
        text: 'common'
    },
    nojlpt: {
        klass: 'nojlpt',
        text: 'no JLPT word',
    }
};

addStyle(css);

$('#question').append('<div id="jlpt-indicator" class="jlpt-indicator-item"></div>');
$('#lessons').append('<div id="jlpt-indicator" class="jlpt-indicator-item"></div>');

//every time item changes, look up vocabulary from jisho.org
$.jStorage.listenKeyChange('currentItem', function(){
    var currentItem = $.jStorage.get('currentItem');
    var vocab = currentItem.voc;

    // Check if item is not vocab
    if (currentItem.on || currentItem.kun) {
        setClassAndText(allClasses.hide);
        return;
    }

    fetchJishoData(vocab);
});

$.jStorage.listenKeyChange('l/currentLesson', function(){
    var currentLesson = $.jStorage.get('l/currentLesson');
    var vocab = currentLesson.voc;

    // Check if item is not vocab
    if (currentLesson.on || currentLesson.kun) {
        setClassAndText(allClasses.hide);
        return;
    }

    fetchJishoData(vocab);
});

function fetchJishoData(vocab) {
    setClassAndText(allClasses.fetching);
    GM_xmlhttpRequest({
        method: 'get',
        url: jishoApiUrl + vocab,
        responseType: 'json',
        onload: function(response) {
            setCommonIndicator(response.response.data[0]);
        },
        onerror: function(error){
            console.log('Jisho error: ', error);
        }
    });
}

function setCommonIndicator(isCommon) {
    console.log(isCommon)
/*
    if (isCommon) {
        setClassAndText(allClasses.common);
    } else {
        setClassAndText(allClasses.uncommon);
    }
    */
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
