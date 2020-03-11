#! /usr/bin/env node
'use strict';

(async () => {
  const show = showGermany;
  show()
  setInterval(() => {
    show()
  }, 6 * 60 * 1000);
})();

async function notify({
  title,
  message
}) {
  const notifier = require('node-notifier');
  const { resolve } = require('path');
  console.log('');
  console.log(title,'\t' ,message);
  return notifier.notify({
    title: `${title}`,
    message: `${message}`,
    icon: resolve(__dirname, './microbe.png'),
    timeout: 1 * 60,
    wait: true
  })
}

async function getCoronaGermany() {
  const url = `https://www.worldometers.info/coronavirus/country/germany/?${new Date().getTime()}`;
  const get = require('request-promise-native');
  const $ = require('cheerio');
  let response = '</head></html>';
  try {
    response = await get(url);
  } catch (e) {
    return {}
  }

  const body = $(`<html>${response.split('</head>')[1]}`);

  const $lastUpdate = $(`div.container > div:nth-child(2) > div.col-md-8 > div > div:nth-child(4)`, body);
  const $total = $($(`#maincounter-wrap > div > span`, body).get(0));
  const $deaths = $($(`#maincounter-wrap > div > span`, body).get(1));
  const $recovered = $($(`#maincounter-wrap > div > span`, body).get(2));

  const lastUpdate = $lastUpdate.text().trim();
  const total = Number($total.text().replace(/[^\d/]/g,''));
  const deaths = Number($deaths.text().replace(/[^\d/]/g,''));
  const recovered = Number($recovered.text().replace(/[^\d/]/g,''));
  const res = {
    lastUpdate,
    total,
    deaths,
    recovered
  };
  return res;
}

async function showGermany() {
  const res = await getCoronaGermany();
  const title = `Coronavirus Germany ${nowHHmm()}`
  const message = `total:${res.total} / deaths:${res.deaths} / recovered:${res.recovered} \n${res.lastUpdate}`;
  notify({
    title, message
  })
}

function nowHHmm() {
  return `${('0'+new Date().getHours()).substr(-2)}:${('0'+new Date().getMinutes()).substr(-2)}`
}

// async function showBerlin() {
//   const res = await getCoronaBerlin();
//   const i = res.find((item) => item.city.toLowerCase().includes('berlin'))
//   const city = i.city;
//   const number = i.number;
//   const title = `Corona Virus ${city}, ${nowHHmm()}`;
//   const message = `${city} ${number}`;
//   notify({
//     title,
//     message,
//   });
// }

// async function getCoronaBerlin() {
//   var url = `https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html`;
//   var get = require('request-promise-native');
//   var $ = require('cheerio');

//   var selector = `#main > div.text > table > tbody > tr`;
//   var response = await get(`${url}?${new Date().getTime()}`);
//   var trs = $(selector, response);

//   var results = [];
//   trs.map((i, line) => {
//     var label = $(`td:nth-child(1)`, line).text();
//     var value = Number($(`td:nth-child(2)`, line).text());
//     results.push({
//       city: label,
//       number: value,
//     });
//   });

//   results.sort((a, b) => {
//     if (a.number > b.number) return -1;
//     if (a.number < b.number) return 1;
//     return 0;
//   });
//   return results;
// }
