'use strict';
const
express 	= require('express'),
cheerio 	= require('cheerio'),
path 		= require('path'),
app 		= express(),
request 	= require('request'),
fs 			= require('fs'),
url 		= require("url"),
PORT 		= process.env.PORT ||5000;

app.get('/scrap', function (req, res, next) {
	let results = [], scrapper = {}, scrapUrl = 'http://www.bing.com/search?q=';
	if( !req.query.q ){
		return res.json({success: false, message: 'No query found'});
	}
	let query = `${scrapUrl}${req.query.q}`, finalUrl ,
	first = (req.query.first) ? req.query.first : 0; 
	
	if( first != 0 && first != 1){
		finalUrl = `${query}&first=${first}`;
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
			next: queryParams,
			result: results
		}
		res.json(scrapper);
	});
});

app.listen(PORT);
console.log(`Server is running on PORT (${PORT})`);