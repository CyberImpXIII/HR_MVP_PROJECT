import React,{useEffect, useState} from "react";
import Axios from "axios";
import {LineGraph, graphEffect} from './components/LineGraph.jsx'
import Style from './style.css'

const App = ()=>{
  const [ebaySearchResults, setEbaySearchResults] = useState({});
  const [ebayGraphData, setEbayGraphData] = useState({values:[], dates:[]});
  const [goodwillGraphData, setGoodwillGraphData] = useState({values:[], dates:[]});
  const [goodwillResults,setGoodwillResults] = useState({});
  const [formInput, setFormInput] = useState('');
  const [chart, setChart] = useState({})

  useEffect(()=>{
    ebaySearchResults.findCompletedItemsResponse ? setEbayGraphData(ebaySearchResults.findCompletedItemsResponse[0].searchResult[0].item.map(
      (e)=>{
        return({
          title:e.title[0],
          itemId:e.itemId[0],
          soldPrice:e.sellingStatus[0].currentPrice[0].__value__,
          soldDate:e.listingInfo[0].endTime[0]
        })
      })
    ) : null;
  },[ebaySearchResults])

  useEffect(()=>{
    goodwillResults[0] ? setGoodwillGraphData(goodwillResults.map(
      (e)=>{
        return({
          title:e.Title,
          itemId:e.prodId,
          soldPrice:e.CurrentPrice,
          soldDate:e.dateSold
        })
      })
    ) : null;
  },[goodwillResults])


  useEffect(()=>{
    const ctx = document.getElementById('priceChart').getContext('2d');
    const priceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ebayGraphData.soldDate,
        datasets: [{
            label: 'Ebay Price Average Price Over Time',
            data: ebayGraphData.soldPrice,
            borderColor: [
                '#33FF00'
            ],
            borderWidth: 1
        },{
          label: 'Shop Goodwill Average Price Over Time',
          data: [3,2,3,6,19,12],
          borderColor: [
            '#FF6600'
        ],
        borderWidth: 1
        }
      ]
    },
    options: {
        maintainAspectRatio:false,
        responsive:true,
        spanGaps: true,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
  });
  setChart(priceChart);
},[])

useEffect(()=>{
  ebayGraphData[0] ? 
  (ebayGraphData.forEach(e=>chart.data.labels.push(e.soldDate)),
  ebayGraphData.forEach(e=>chart.data.datasets[0].data.push(e.soldPrice)),
  chart.update()) : null 
},[ebayGraphData])

useEffect(()=>{
  goodwillGraphData[0] ? 
  (goodwillGraphData.forEach(e=>chart.data.labels.push(e.soldDate)),
  goodwillGraphData.forEach(e=>chart.data.datasets[1].data.push(e.soldPrice)),
  chart.update()) : null 
},[goodwillGraphData])

  const ebaySubmit = ()=>{
    const params = { formInput }
    Axios.get('api/ebay')
    .then(r=>setEbaySearchResults(r.data))
    .catch((err)=>{'connection error "${err}"'})
  }

  const shopGSubmit = ()=>{
    const params = { formInput }
    Axios.get('api/shopg')
    .then(r=>setGoodwillResults(r.data))
    .catch((err)=>{'connection error "${err}"'})
  }

  const inputHandle = (e)=>{
    setFormInput(e.target.value);
  }
  
  return( 
  <div>
    <input onChange={inputHandle}></input><br/>
    <button onClick={ebaySubmit}>Submit Ebay</button><br/>
    <button onClick={shopGSubmit}>Submit ShopGoodwill</button><br/>
    {console.log(ebaySearchResults)} 
    {console.log(goodwillResults)} 
    <div id='canvas-container'>
    <canvas id="priceChart" data-ebay={ebayGraphData.soldDate} width="800" height="800"></canvas>
    </div>
  </div>
  )
}
export default App;
