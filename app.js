var http = require('http');
var fs = require('fs');
var request = require('request');
var xml2js = require('xml2js');
var js2xmlparser = require("js2xmlparser");
var moment = require('moment'); //doc : http://momentjs.com/docs/
moment.lang('fr');

var img_url = 'http://www.trinum.com/ibox/ftpcam/Montdore.jpg';
//var img_url = 'http://localhost:4567/Montdore.jpg';
var wea_url = 'http://www.myweather2.com/developer/weather.ashx?uac=Md140hZXwg&uref=be54512f-5d81-45ec-bcd5-9ac510baa981';
setInterval(function() {
	get_weather(wea_url);
	get_image(img_url);
}, 300000); //5 minutes * 60 secondes * 1 000 ms = 

function get_weather (url) {
	/*
		* using file because proxy ...
		* make request to 
		* www.myweather2.com/developer/weather.ashx?uac=Md140hZXwg&uref=be54512f-5d81-45ec-bcd5-9ac510baa981
		* doc : http://www.myweather2.com/developer/apis.aspx?uref=f8add9ec-fe95-4001-b822-df8680e49dce
	*/


	request(url, function(error, response, html) {
		if (error && (response.statusCode !== 200)) {
			return console.log("Error:" + err);
		} else {
			//le parametre 'charkey' permet de recuperer la valeur d'un attribut
			var parser = new xml2js.Parser({charkey: 'value'});
			//listener ecoutant la fin du parsage d'un xml puis appelant la fonction listant les titres
			parser.addListener('end', function(result) { print_weather(result.weather, function(res) { create_xml(res); } ) });
			parser.parseString(response.body);
		}
	});
}

function print_weather (source, callback) {
	var xml = [];
	xml.push('<?xml version="1.0" encoding="UTF-8"?>');
	var data = '<snow s_min="' + parseInt(source.snow_report[0].lower_snow_depth) + '" s_max="' + parseInt(source.snow_report[0].upper_snow_depth) + '" />';
	xml.push(data);
	xml.push('<forecast>');
	source.forecast.forEach(function(element, i){
		var numbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six'];
		var days = moment.weekdays();
		var current = (numbers[i]);// element.date[0]);
		
		var data = "\t<" + numbers[i] + ' t_min="' + parseInt(element.night_min_temp) + '" t_max="' + parseInt(element.day_max_temp) + '" />';
		
		var sentence = days[moment(element.date[0]).day()] + " il fera au plus " + element.day_max_temp + "°C et au minimum " + element.night_min_temp + " °C, le temps sera: " + element.day[0].weather_text;
		xml.push(data);
	});
	xml.push('</forecast>');
	callback(xml);
}

function create_xml (source) {
	var str = "";
	source.forEach(function(element) {
		str = str.concat(element + '\n');
	});
	fs.writeFile('save.xml', str, function (err) {
	  if (err) throw err;
	  console.log('It\'s saved!');
	});
}

function get_image(url) {
	var destination = './Montdore.jpg';
	request(url).pipe(fs.createWriteStream(destination));
}