const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const axios = require('axios')
const port = process.env.PORT || 3000;
app.use(express.static("dist"));
app.use(
  bodyParser.json({
    strict: false
  })
);

app.get('api',(req, res)=>{
  const query = {
    'OPERATION-NAME':'findCompletedItems',
    'SERVICE-VERSION':'1.7.0',
    'SECURITY-APPNAME':'JacobNel-shopGcom-PRD-051fd426b-cb604293',
    'RESPONSE-DATA-FORMAT':'JSON',
    'REST-PAYLOAD': null,
    keywords:'Garmin+nuvi+1300+Automotive+GPS+Receiver',
    categoryId:'156955',
    'itemFilter(0).name':'Condition',
    'itemFilter(0).value':'3000',
    'itemFilter(1).name':'FreeShippingOnly',
    'itemFilter(1).value':'true',
    'itemFilter(2).name':'SoldItemsOnly',
    'itemFilter(2).value':'true',
    'sortOrder':'PricePlusShippingLowest',
    'paginationInput.entriesPerPage':'2'
  }
  axios.get('https://svcs.ebay.com/services/search/FindingService/v1',query)
  .then(r=>res.send(r.data))
  .catch((err)=>{console.log(err), res.end('error, see server logs for details')})
})

app.listen(port, () => {
  console.log(` ${port}`);
});
