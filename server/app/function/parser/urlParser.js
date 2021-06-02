const vcheck = require('~server/module/vartool/vcheck');
const SKError = require('~server/module/errorHandler/SKError');

const utms = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
const guce = ['guccounter', 'guce_referrer', 'guce_referrer_sig'];

const decodeType1 = (key) => {
  const singlePercent = /%(?![a-zA-Z0-9]{2})/g;
  const es = key.replace(singlePercent, '%25');
  let rs;
  try {
    rs = decodeURIComponent(es);
  } catch (e) {
    // 可能雖然有%xx的型態，但其實是已經decoded的，就返回原字串
    rs = es;
  }
  return rs;
};
const decodeType2 = (key) => {
  const singlePercent = /%(?![a-zA-Z0-9]{2})/g;
  const es = escape(key).replace(singlePercent, '%25');
  return decodeURIComponent(es);
};
const decodeValue = (key) => {
  const escaped = /%(?=[a-zA-Z0-9]{2})/g;
  let rs = null;
  // 有%xx這種型態的字串
  if (escaped.test(key)) {
    rs = decodeType1(key);
  } else {
    try {
      // 有\u00e9這種編碼的
      rs = decodeType2(key);
    } catch (e) {
      // 剩下的可能是尚未escaped的
      rs = decodeType1(key);
    }
  }
  return rs;
};

const call = (url) => {
  if (!vcheck.url(url)) throw new SKError('E005003');

  const [_url, _hash] = vcheck.str(url).split('#');
  const hash = decodeValue(_hash || '');

  const [uri, qstr] = _url.split('?');

  const _querys = (qstr || '').split('&')
    .map((v) => {
      const [param, value] = v.split('=');
      return {
        param, value,
      };
    })
    .filter((v) => v.param)
    .sort((a, b) => {
      if (a.param < b.param) return -1;
      if (a.param > b.param) return 1;
      return 0;
    });

  const query = _querys
    .filter((f) => {
      // 濾掉一些廣告相關的參數
      if (utms.includes(f.param)) return false;
      if (f.param === 'gclid') return false;
      if (f.param === 'fbclid') return false;
      if (guce.includes(f.param)) return false;
      return true;
    }).map((v) => {
      let str = v.param;
      if (v.value) str += `=${v.value}`;
      return str;
    }).join('&');
  const query_encode = _querys
    .filter((f) => {
      // 濾掉一些廣告相關的參數
      if (utms.includes(f.param)) return false;
      if (f.param === 'gclid') return false;
      if (f.param === 'fbclid') return false;
      if (guce.includes(f.param)) return false;
      return true;
    })
    .map((v) => {
      let str = encodeURIComponent(decodeValue(v.param));
      if (v.value) str += `=${encodeURIComponent(decodeValue(v.value))}`;
      return str;
    }).join('&');

  const utm = _querys
    .filter((f) => utms.includes(f.param))
    .map((v) => `${v.param}=${v.value}`).join('&');

  const protocol = uri.indexOf('http://') === 0 ? 'http' : 'https';
  const [host] = uri.replace(`${protocol}://`, '').split('/');
  const pathArray = uri.replace(`${protocol}://${host}`, '')
    .split('/')
    .filter((f) => f !== '')
    .map((v) => decodeValue(v));
  const path_encode = `/${pathArray
    .map((v) => encodeURIComponent(v))
    .join('/')}`;
  const path = `/${pathArray
    .join('/')}`;

  let fullurl = `${protocol}://${host}${path}`;
  if (query) fullurl += `?${query}`;

  let url_encode = `${protocol}://${host}${path_encode}`;
  if (query_encode) url_encode += `?${query_encode}`;

  return {
    protocol,
    host,
    path,
    path_encode,
    query,
    query_encode,
    utm,
    hash,
    url: fullurl,
    url_encode,
  };
};

// module.exports = __public;

// const uu = 'https://myprincessholidaychristmas.princesscruises.com.tw/?utm_source=share_pic&utm_medium=banner&utm_campaign=myprincessholidaychristmas';
// const uu = 'https://cht.medialand.tw/docs/api/#header-api%E5%91%BC%E5%8F%AB%E7%9A%84%E9%99%90%E5%88%B6';
// const uu = 'https://myprincessholidaychristmas.princesscruises.com.tw/docs/api/?utm_source=share_pic&utm_medium=banner&utm_campaign=myprincessholidaychristmas#header-api%E5%91%BC%E5%8F%AB%E7%9A%84%E9%99%90%E5%88%B6';
// const uu = 'https://github.com/axios/axios?aaa&bbb=呼叫的';
// const uu = 'https://jeremysu0131.github.io/Vue-js-父子組件溝通-Props/';
// console.log(call(uu));

module.exports = call;
