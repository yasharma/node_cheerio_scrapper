'use strict';
const
express 	= require('express'),
cheerio 	= require('cheerio'),
path 		= require('path'),
app 		= express(),
request 	= require('request'),
fs 			= require('fs'),
url 		= require("url"),
querystring = require('querystring'),
PORT 		= process.env.PORT ||5000;

app.get('/scrap', function (req, res, next) {
	let results = [], scrapper = {}, scrapUrl = 'https://www.bing.com/search?q=';
	if( !req.query.q ){
		return res.json({success: false, message: 'No query found'});
	}
	let query = `${scrapUrl}${req.query.q}`, finalUrl ,
	first = (req.query.first > 1) ? req.query.first : 0; 
	
	if( first != 0 && first != 1){
		let _querystring = querystring.stringify (req.query);
		finalUrl = `https://www.bing.com/search?${_querystring}`;
	} else {
		finalUrl = query;
	}
	
	request(finalUrl, (err, resp, body) => {
		let $ = cheerio.load(body);
		let nextUrl = $('a.sb_pagN').attr('href');

		let queryParams = url.parse(nextUrl, true).query.first;

		$('li.b_algo').each(function (index, h2) {
			let title = $(this).children('h2').text(),
			description = $(this).find('div.b_caption p').text(),
			url = $(this).children('h2').children('a').attr('href');
			results.push({title: title, description: description, url: url});
		});
		scrapper = {
			next: nextUrl,
			result: results
		}
		res.json(scrapper);
	});
});

app.listen(PORT);
console.log(`Server is running on PORT (${PORT})`);