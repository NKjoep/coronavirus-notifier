#! /usr/bin/env node
'use strict';

async function notify({
  title,
  message
}) {
  var notifier = require('node-notifier');
  var { resolve } = require('path');
  console.log(title, message);
  return notifier.notify({
    title: `${title}`,
    message: `${message}`,
    icon: resolve(__dirname, './microbe.png'),
    timeout: 1 * 60
  })
}

async function getCorona() {
  var url = `https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html`;
  var get = require('request-promise-native');
  var $ = require('cheerio');

  var selector = `#main > div.text > table > tbody > tr`;
  var response = await get(`${url}?${new Date().getTime()}`);
  var trs = $(selector, response);

  var results = [];
  trs.map((i, line) => {
    var label = $(`td:nth-child(1)`, line).text();
    var value = Number($(`td:nth-child(2)`, line).text());
    results.push({
      city: label,
      number: value,
    });
  });

  results.sort((a, b) => {
    if (a.number > b.number) return -1;
    if (a.number < b.number) return 1;
    return 0;
  });
  return results;
}

async function showBerlin() {
  const res = await getCorona();
  const i = res.find((item) => item.city.toLowerCase().includes('berlin'))
  const city = i.city;
  const number = i.number;
  const title = `Corona Virus ${city}, ${('0'+new Date().getHours()).substr(-2)}:${('0'+new Date().getMinutes()).substr(-2)}`;
  const message = `${city} ${number}`;
  notify({
    title,
    message,
  });
}

(async () => {
    showBerlin();
    setInterval(() => {
      showBerlin();
    }, 6 * 60 * 1000);
})();
