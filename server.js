// This code is based on https://scotch.io/tutorials/build-a-restful-api-using-node-and-express-4
//
// server.js

// BASE SETUP
// =============================================================================


// load the packages we need
var fs = require('fs');
var path = require('path');
/*
var express = require('express');
var bodyParser = require('body-parser');

var app = express();                 // define our app using express

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({extended: true}));

app.set('port', process.env.PORT || 63292);        // set our port

// MIDDLEWARE for accessing the server from other servers
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router
*/

// set up the data to be used in the API:

const n5tag = 5;
const n4tag = 4;
const n3tag = 3;
const n2tag = 2;
const n1tag = 1;

const levelMap = {};

var JLPTN5Vocab = path.join(__dirname, 'data/n5-vocab-kanji-hiragana.txt');
var JLPTN4Vocab = path.join(__dirname, 'data/n4-vocab-kanji-hiragana.txt');
var JLPTN3Vocab = path.join(__dirname, 'data/n3-vocab-kanji-hiragana.txt');
var JLPTN2Vocab = path.join(__dirname, 'data/n2-vocab-kanji-hiragana.txt');
var JLPTN1Vocab = path.join(__dirname, 'data/n1-vocab-kanji-hiragana.txt');

var JLPTN5Kanji = path.join(__dirname, 'data/n5-kanji.txt');
var JLPTN4Kanji = path.join(__dirname, 'data/n4-kanji.txt');
var JLPTN3Kanji = path.join(__dirname, 'data/n3-kanji.txt');
var JLPTN2Kanji = path.join(__dirname, 'data/n2-kanji.txt');
var JLPTN1Kanji = path.join(__dirname, 'data/n1-kanji.txt');

function insertVocabData(file, levelTag) {
    console.log("vocab " + levelTag)
    var fileContents = fs.readFileSync(file, {encoding: "utf8"});
    fileContents.split("\n").forEach(row => {
        const word = row.split("\t");
        levelMap[word[0] + " " + word[1]] = levelTag;
        // console.log(word[0] + " " + word[1] + " " + levelTag);
    });
}

function insertKanjiData(file, levelTag) {
    console.log("kanji " + levelTag)
    var fileContents = fs.readFileSync(file, {encoding: "utf8"});
    fileContents.split("\n").forEach(row => {
        const word = row.split("\t");
        levelMap[word[0]] = levelTag;
        // console.log(word[0] + " " + levelTag);
    });
}

insertVocabData(JLPTN1Vocab, n1tag);
insertVocabData(JLPTN2Vocab, n2tag);
insertVocabData(JLPTN3Vocab, n3tag);
insertVocabData(JLPTN4Vocab, n4tag);
insertVocabData(JLPTN5Vocab, n5tag);

insertKanjiData(JLPTN1Kanji, n1tag);
insertKanjiData(JLPTN2Kanji, n2tag);
insertKanjiData(JLPTN3Kanji, n3tag);
insertKanjiData(JLPTN4Kanji, n4tag);
insertKanjiData(JLPTN5Kanji, n5tag);

delete levelMap[" undefined"]

fs.writeFileSync("result.txt", JSON.stringify(levelMap))

/*
router.get('/', function (req, res, next) {
    res.send("Willkommen zur JLPT Server API!")
});

// todo remove ~ at start of vocab

function levelFor(kanji, kana) {
    return kana ? levelMap[kanji + " " + kana] : levelMap[kanji];
}

router.get('/:kanji/:kana1/:kana2/:kana3', function (req, res) {
    let level = levelFor(req.params.kanji, req.params.kana1)
        || levelFor(req.params.kanji, req.params.kana2)
        || levelFor(req.params.kanji, req.params.kana3)
        || "nojlpt";
    res.send(level);
});

router.get('/:kanji/:kana1/:kana2', function (req, res) {
    let level = levelFor(req.params.kanji, req.params.kana1)
        || levelFor(req.params.kanji, req.params.kana2)
        || "nojlpt";
    res.send(level);
});

router.get('/:kanji/:kana', function (req, res) {
    const level = levelFor(req.params.kanji, req.params.kana)
        || "nojlpt";
    console.log(req.params.kanji, req.params.kana, level)
    res.send(level);
});

router.get('/:kanji', function (req, res) {
    if (req.params.kanji === "noword") {
        res.send("hide"); // special treatment for radicals
    }
    const level = levelFor(req.params.kanji)
        || "nojlpt";
    res.send(level);
});

// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// =============================================================================
var hello = express.Router();              // get an instance of the express Router
hello.get('/', function (req, res, next) {
    res.send("Willkommen zum JLPT Server!")
});
app.use('/', hello);

// START THE SERVER
// =============================================================================
app.listen(app.get('port'), function () {
    console.log('Connect to the server via http://localhost:' + app.get('port'));
});

*/
