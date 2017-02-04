'use strict';

/**
 * Module dependencies.
 * @private
 */
const prequest = require('request-promise');

/**
 * Local constants.
 * @private
 */
const WEATHER_EMOJI = {
  'пасмурно':       '😒', 
  'ясно':           '😊', 
  'слегка облачно': '😏', 
  'легкий дождь':   '😑',
  'облачно':        '☁️'
}

/**
 * Преобразует ответ сервера OpenWeatherMap в текстовое сообщение.
 * @param {Object} apiResponse
 * @private
 */
function apiResToText (apiResponse) {
  let res = apiResponse;

  let desc  = res.weather[0].description;
  let emoji = WEATHER_EMOJI[desc] || '';

  let city    = res.name;
  let country = res.sys.country;

  let temp = Math.round(res.main.temp);
      temp = temp > 0 ? `+${temp}` : temp;

  let hum  = res.main.humidity;
  let wind = res.wind.speed;

  return `Сейчас ${desc} ${emoji} (${city}, ${country})\n\n` + 
         `🌡 Температура: ${temp} °C\n` + 
         `💧 Влажность: ${hum}%\n` + 
         `🎐 Ветер: ${wind} м/с`;
}

// @todo: Добавить возможность просмотра прогноза погоды на 5 дней вперед

async function run ({ id, app, args, options }) {
  let city = args.fullText;

  if (!city) 
    return;

  // Обрезаем названия городов до 80 символов
  city = city.slice(0, 80);

  return await prequest({
      url: 'http://api.openweathermap.org/data/2.5/weather', 

      qs: {
        appid: options.api_key, 
        q:     city, 
        type:  'accurate', 
        lang:  'ru', 
        units: 'metric'
      }, 

      json: true
    })
    .then(response => {
      let message = response.message && response.message.toLowerCase() || null;

      if (message && ~message.indexOf('error')) {
        if (~message.indexOf('not found')) {
          return 'Указанный город не найден.';
        } else {
          // @todo: Log error

          return 'Произошла неизвестная ошибка, данные не получены.';
        }
      }

      return apiResToText(response);
    })
    .catch(error => {
      // @todo: Log error

      return 'Произошла неизвестная ошибка, повторите запрос позже.';
    });
}

module.exports = {
  aliases:   ['погода'], 
  help_text: '/weather <город>\n\nВернёт данные о текущей погоде в указанном городе.', 
  run
};