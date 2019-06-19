const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const axios = require('axios')
const port = process.env.PORT || 3009;
const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })

app.use(express.static("dist"));
app.use(
  bodyParser.json({
    strict: false
  })
);

app.get('/api/ebay', (req, res)=>{
  axios.get(`https://svcs.ebay.com/services/search/FindingService/v1?` +
  `OPERATION-NAME=findCompletedItems&` +
  `SERVICE-VERSION=1.7.0&` +
  `SECURITY-APPNAME=JacobNel-shopGcom-PRD-051fd426b-cb604293&` +
  `RESPONSE-DATA-FORMAT=JSON&` +
  `REST-PAYLOAD&` +
  `keywords=Garmin&` +
  `categoryId=156955&` +
  `itemFilter(0).name=Condition&` +
  `itemFilter(0).value=3000&` +
  `itemFilter(1).name=FreeShippingOnly&` +
  `itemFilter(1).value=true&` +
  `itemFilter(2).name=SoldItemsOnly&` +
  `itemFilter(2).value=true&` +
  `sortOrder=PricePlusShippingLowest&` +
  `paginationInput.entriesPerPage=100` 
)
  .then(r=>res.send(r.data))
  .catch((err)=>{console.log(err), res.end('error, see server logs for details')})
})


app.get('/api/shopg', (req, res)=>{
  nightmare
  .goto('https://shopgoodwill.com')
  .insert('#search-text-header', 'garmin')
  .type('#search-text-header', '\u000d')
  .wait('.page-options')
  .evaluate(() => {
    return Array.from(document.querySelectorAll('.product')).map(
      productNode=>{
        return(
          {
            link:productNode.href,
            prodId: productNode.href.split('/Item/')[1],
            Title: productNode.children[1].children[0].children[1].innerHTML.split('\n')[1].trim(),
            CurrentPrice: productNode.children[1].children[1].children[0].innerHTML.split('\"')[0].split("<br>")[0].trim(),
            buyItNow: productNode.children[0].children[1].innerHTML.split('span')[1]===">Buy It Now</" ? true : false
          }
        );
      }
    );
  })
  .end(r=>res.send(r))
  .catch(error => {
    console.error('Search failed:', error)
    res.end()
  })
});


app.listen(port, () => {
  console.log(`Sever is running on ${port}`);
});
