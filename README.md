# MESh+初始框架 for nodejs
NodeJS Express的初始化框架。

## 使用
安裝dependancies
```js
npm i
```
### 啟動
將 `/server/config.bak` 裡的檔案複製到 `/server/config`，並填入相對應的設定值。

開發模式：
```js
npm run dev
```

Stage模式：
```js
npm run stage
```

Production模式：
請使用pm2啟動
```
pm2 start ./server/pm2/production.json
```

### 產生apiDoc
```
npm run apidoc
```
文件會產生在 `./doc` 目錄之下

## 目錄結構
- /server - *主要的系統目錄*
  - /app - *主要的router與controller放置區*
    - /apidoc - *APIDoc的相關設定檔*
    - /controller - *controller區*
      - /versions - *分版本存放*
    - /middleware - *該app會用到的middleware*
    - /model - *DB model*
    - /router - *router區*
      - /versions - *分版本存放*
  - /config - *系統設定檔*
  - /module - *整個系統通用的小功能模組*
  - /pm2 - *pm2的設定擋*

## 開發注意事項
### 統一使用SKError
WebApp相關的錯誤，需要明確的錯誤代碼與多國語言，這部分會由SKError處理，因此如果遇到App層的錯誤，請盡量使用SKError。
SKError使用的錯誤代碼表，存放在 `/server/module/errorHandler/errorCodes.js`，可自由擴充。

### 利用res.locals
在不同的middleware之間傳遞狀態時，會大量利用到res.locals，目前會用到的部分為：
- res.locals.__lang *使用者的語系*
- res.locals.__jwtError *jwt登入驗證失敗的SKError*
- res.locals.__jwtAccessToken *使用者傳入的access_token*
- res.locals.__jwtPayload *解析過後的payload*

編寫自己的res.locals時，請注意不要衝突覆蓋。

### 統一Restful的輸出
Restful API請統一使用 `{ status: 'OK', data: '資料' }` 的格式，data可以是任何型態，也可以沒有data。
錯誤訊息請統一在controller裡使用 `next(new SKError('錯誤代碼'));` 拋給errorMiddleware處理，errorMiddleware會回傳 `{ status: 'ERROR', message:'錯誤訊息', code:'錯誤代碼' }` 給前端。

### 資料庫命名規則
請參考   
https://docs.google.com/document/d/1FWi-TEVEgaAa95cIaQHdLHhqP-Hr9TGSdCwrO0hMBj0/edit?usp=sharing

### 非本機開發時請使用pm2啟動server
由於一台主機可能會擁有不只一個web server，因此只要非本機執行時，請使用pm2進行啟動，並且修改/server/pm2下的相關設定檔，**name除了app的名稱以外，務必加上port**，以避免同一台主機上有相同的port互相衝突。  
如果想知道該主機上哪些port已經被占用，可用pm2列出列表：
```
pm2 list
```

