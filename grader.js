#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var assertFileExists = function(infile) {
		var instr = infile.toString();
		if(!fs.existsSync(instr)){
			console.log("%s does not exist. Exiting.",instr);
			process.exit(1);// http://nodejs.org/api/process.html#process_process_exit_code
		}
		return instr;
};

var assertUrlExists = function(inurl) {
	var exists;
	var url = inurl.toString();
	return url;
	/*if(urlExists(url))
		return url;
	else return false;*/
	/*rest.get(url).on('complete',function(result)
	{
		if(result instanceof Error){
			console.log("%s url not found. Exiting.",url);
			process.exit(1);
		}
	});*/ 
};

var htmlFile = function(htmlfile) {
	return fs.readFileSync(htmlfile);
};

var executeAsyncCheckUrl = function(url, checksFile)
{
	rest.get(url).on('complete',function(result,response)
	{
		if(result instanceof Error){
			console.log("%s url not found. Exiting.",url);
			process.exit(1);
		}
		else
		{
			var checkJson = checkHtmlFile(result,checksFile);
			showOutput(checkJson);
		}
	});
}

var loadChecks = function(checksfile) {
	return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(html,checksFile)
{
	$ = cheerio.load(html);
	var checks = loadChecks(checksFile).sort();
	var out = {};
	for(var ii in checks)
	{
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	}
	return out;
}

var clone = function(fn) {
	// Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var showOutput = function(checkJson)
{
	var outJson = JSON.stringify(checkJson,null,4);
	console.log(outJson);
}

if(require.main == module) {
	program
		.option('-c,--checks <check_file>','Path to checks.js',clone(
			assertFileExists))
		.option('-f, --file <html_file>','Path to index.html',clone(
			assertFileExists))
		.option('-u, --url <url>','Url to file',clone(
			assertUrlExists))
		.parse(process.argv);

	var checkJson;
	if(program.file){
		checkJson = checkHtmlFile(htmlFile(program.file),
					program.checks);
		showOutput(checkJson);
	}

	if(program.url)
	{
		executeAsyncCheckUrl(program.url, program.checks);
	}
} else {
	exports.checkHtmlFile = checkHtmlFile;
};