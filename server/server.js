const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const axios = require('axios')
const port = process.env.PORT || 3009;
const Nightmare = require('nightmare')
const { exec } = require('child_process');

app.use(express.static("dist"));
app.use(
  bodyParser.json({
    strict: false
  })
);

app.get('/api/ebay', (req, res)=>{
  // console.log(req.params.)
  let responseArr = [];
  axios.get(`https://svcs.ebay.com/services/search/FindingService/v1?` +
  `OPERATION-NAME=findCompletedItems&` +
  `SERVICE-VERSION=1.7.0&` +
  `SECURITY-APPNAME=JacobNel-shopGcom-PRD-051fd426b-cb604293&` +
  `RESPONSE-DATA-FORMAT=JSON&` +
  `REST-PAYLOAD&` +
  `keywords=${req.query.formInput}&` +
  `categoryId=156955&` +
  `itemFilter(0).name=Condition&` +
  `itemFilter(0).value=3000&` +
  `itemFilter(1).name=SoldItemsOnly&` +
  `itemFilter(1).value=true&` +
  `sortOrder=PricePlusShippingLowest&` +
  `paginationInput.entriesPerPage=100&` +
  `paginationInput.pageNumber=${1}` 
) 
.then((r)=>{
  res.send(r.data)
  //this is a stopgap that returns one page because of issues about handling all of the data at once and concerns over using all of my requests
})
  // .then((r)=>{
  //   let pageNumber = parseInt(r.data.findCompletedItemsResponse[0].paginationOutput[0].totalPages[0])
  //   return Promise.all(Array(pageNumber).fill(null).map((e,i)=>{
  //     return (axios.get(`https://svcs.ebay.com/services/search/FindingService/v1?` +
  //       `OPERATION-NAME=findCompletedItems&` +
  //       `SERVICE-VERSION=1.7.0&` +
  //       `SECURITY-APPNAME=JacobNel-shopGcom-PRD-051fd426b-cb604293&` +
  //       `RESPONSE-DATA-FORMAT=JSON&` +
  //       `REST-PAYLOAD&` +
  //       `keywords=Garmin&` +
  //       `categoryId=156955&` +
  //       `itemFilter(0).name=Condition&` +
  //       `itemFilter(0).value=3000&` +
  //       `itemFilter(1).name=SoldItemsOnly&` +
  //       `itemFilter(1).value=true&` +
  //       `sortOrder=PricePlusShippingLowest&` +
  //       `paginationInput.entriesPerPage=100&` +
  //       `paginationInput.pageNumber=${i+1}` 
  //       )
  //     )
  //   }))
  // })
  // .then(r=>{
  //   // console.log(r[0].data.findCompletedItemsResponse[0].errorMessage[0].error[0]);
  //   return responseArr = [...responseArr, ...r.map((e)=>{return e.data.findCompletedItemsResponse[0].searchResult[0].item})]
  // })
  // .then(r=>{console.log(responseArr),res.send(responseArr)})
  .catch((err)=>{console.log(err), res.end('error, see server logs for details')})
})


app.get('/api/shopg', (req, res)=>{
  console.log(req.query.formInput)
  console.log('we made it inside!')
    let pageCount = 0;

  Nightmare({ show: false })
  .goto(`https://www.shopgoodwill.com/Listings?st=${req.query.formInput}&sg=&c=&s=&lp=0&hp=999999&sbn=false&spo=false&snpo=false&socs=false&sd=false&sca=true&caed=6/19/2019&cadb=200&scs=false&sis=false&col=0&p=1&ps=40&desc=false&ss=0&UseBuyerPrefs=true`)
  .wait('#last')
  .evaluate(()=>{
    return document.querySelector('#last').parentElement.innerHTML.split('data-page="')[1].split('"')[0]
  })
  .end((r)=>{
    pageCount = r;
    console.log(r, "number of pages");
  })
  .catch(console.log)
  .then(async()=>{
    console.log('trying to promise all');
    // Promise.all(([...Array(pageCount)].map((e,i)=>{
    // })))
    await looperize(pageCount, req.query.formInput)
    .then((responseArr)=>{
      console.log('finished mapping', responseArr)
      exec('killall electron');
      res.send(responseArr);
    })
    .catch(error => {
      console.error('Search failed:', error)
      exec('killall electron');
      res.end()
    });
  })
});

app.listen(port, () => {
  console.log(`Sever is running on ${port}`);
});


const looperize = async(pageCount, query)=>{
  let responseArr = [];
  //This loop was changed to 10 because I think having it be the proper page count is causing it to time out and I need to find a solution
  for(i=0; i < 2; i++){
    console.log('scraping page', i)
    await pagescrape(i, query)
    .then((r)=>{responseArr = [...responseArr, ...r]})
  }
  console.log(responseArr);
  return responseArr;
}

const pagescrape = (i, query)=>{
   return Nightmare({ show: false })
      .goto(`https://www.shopgoodwill.com/Listings?st=${query}&sg=&c=&s=&lp=0&hp=999999&sbn=false&spo=false&snpo=false&socs=false&sd=false&sca=true&caed=6/19/2019&cadb=200&scs=false&sis=false&col=0&p=${i+1}&ps=40&desc=false&ss=0&UseBuyerPrefs=true`)
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
                // buyItNow: productNode.children[0].children[1].innerHTML.split('span')[1]===">Buy It Now</" ? true : false,
                dateSold: productNode.children[1].children[1].innerHTML.split('data-countdown="')[1].split('"')[0],
              }
            );
          }
        );
      })
      .end(r=>{
        return (r)
     })
    }