const axios = require('axios');
const cheerio = require('cheerio');
const randomUseragent = require('random-useragent');
const urlParser = require('./urlParser');
const SKError = require('~server/module/errorHandler/SKError');

/*
這個列表列出需要開啟headless瀏覽器抓取頁面的網址。
否則基本上都會以axios去抓取，比較省效能。
*/
const needRender = [
  'https://twitter.com/',
];

const pickUserAgent = ({ host }) => {
  const uagentFilter = (ua) => {
    const filtered = (ua.browserName === 'Chrome'
      && parseFloat(ua.browserVersion) >= 50
      && ua.osName !== 'Linux'
      && ua.osName !== 'Fedora'
      && ua.deviceType !== 'mobile'
      && ua.deviceType !== 'tablet');
    return filtered;
  };
  let uagent = randomUseragent.getRandom(uagentFilter);

  if (host === 'www.youtube.com' || host === 'm.youtube.com' || host === 'youtube.com') {
    uagent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
  }
  if (host.indexOf('twitter.com') > 0) uagent = '';
  return uagent;
};

const call = async (sourceUrl, lang = 'zh-TW') => {
  const {
    url_encode, host, protocol, path_encode,
  } = urlParser(sourceUrl);

  let htmltxt = '';

  const useragent = pickUserAgent({ host });
  const headers = {
    // 'accept-language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
    'accept-language': lang,
  };
  if (useragent) headers['User-Agent'] = useragent;

  // 是否在需要needRender的列表裡，是的話就使用puppeteer
  const inNeedRender = needRender.find((f) => {
    if (`${url_encode}/`.indexOf(f) === 0) return true;
    return false;
  });
  if (inNeedRender) {
    const rs = await axios({
      url: `https://asia-east2-meshplus.cloudfunctions.net/puppage?url=${url_encode}`,
    });
    if (rs.data.status !== 'OK') throw new SKError('E005004');
    htmltxt = rs.data.data.content;
  } else {
    try {
      const rs = await axios({
        url: url_encode,
        headers,
      });
      htmltxt = rs.data;
    } catch (e) {
      /*
      為了這個網址特別制定的例外：https://jeremysu0131.github.io/Vue-js-父子組件溝通-Props
      如果path裡有帶中文的話，nodejs似乎無法順利轉址
      通常很少走到這裡來
      */
      console.log('---------------------');
      console.log('use pupeteer');
      console.log(url_encode);
      console.log('---------------------');
      const rs = await axios({
        url: `https://asia-east2-meshplus.cloudfunctions.net/puppage?url=${url_encode}`,
      });
      if (rs.data.status !== 'OK') throw new SKError('E005004');
      htmltxt = rs.data.data.content;
    }
  }

  // console.log(htmltxt);

  const $ = cheerio.load(htmltxt);
  let title = $('title').text();
  const meta = [];
  let description = '';
  const images = [];
  Array.from($('meta')).forEach((v) => {
    const tagName = v.attribs.name || v.attribs.property || '';
    const tagContent = v.attribs.content || v.attribs.value || '';
    if (tagContent && (tagName.indexOf('og:') === 0 || tagName.indexOf('twitter') === 0)) {
      const obj = {
        property: tagName,
        content: tagContent,
      };
      meta.push(obj);

      if (tagName === 'og:image' || tagName.indexOf('twitter:image') === 0) {
        let imgurl = tagContent;
        if (imgurl !== '') {
          if (imgurl.indexOf('http') !== 0 && imgurl.indexOf('//') !== 0) {
            if (imgurl.indexOf('/') === 0) {
              imgurl = `${protocol}://${host}${imgurl}`;
            } else if (path_encode) {
              imgurl = `${protocol}://${host}${path_encode}/${imgurl}`;
            } else {
              imgurl = `${protocol}://${host}/${imgurl}`;
            }
          }
          images.push({ url: imgurl });
        }
      }
      if (tagName === 'og:image:width') {
        // siteimgWidth = tagContent;
        const img = images[images.length - 1];
        if (img) img.width = tagContent;
      }
      if (tagName === 'og:image:height') {
        // siteimgHeight = tagContent;
        const img = images[images.length - 1];
        if (img) img.height = tagContent;
      }

      if (tagName === 'og:description') description = tagContent;
      if (tagName === 'twitter:description' && !description) description = tagContent;
      if (tagName === 'og:title') title = tagContent;
      if (tagName === 'twitter:title' && !title) title = tagContent;
    }
    if (tagName === 'description' && !description) description = tagContent;
  });

  return {
    title,
    description,
    images,
  };
};

module.exports = call;
