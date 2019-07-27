import React,{useEffect, useState} from "react";
import Axios from "axios";
import Chart from 'chart.js';
import './style.css';
import moment from 'moment'

const App = ()=>{
  const [ebaySearchResults, setEbaySearchResults] = useState({});
  const [ebayGraphData, setEbayGraphData] = useState([]);
  const [goodwillGraphData, setGoodwillGraphData] = useState({values:[], dates:[]});
  const [goodwillResults,setGoodwillResults] = useState({});
  const [formInput, setFormInput] = useState('');
  const [chart, setChart] = useState([])
  const [dates, setDates] = useState([])

  useEffect(()=>{
    const ctx = document.getElementById('priceChart').getContext('2d');
    const priceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', "Aug", 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
            label: 'Ebay Price Average Price Over Time',
            data: [0],
            borderColor: [
                '#33FF00'
            ],
            borderWidth: 1
        },{
          label: 'Shop Goodwill Average Price Over Time',
          data: [0],
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
  //sets the graph data based on the search results. I should migrate this to the server side later
  if(ebaySearchResults.findCompletedItemsResponse && ebaySearchResults.findCompletedItemsResponse[0].searchResult[0]["@count"]!=="0"){
    console.log(ebaySearchResults.findCompletedItemsResponse)
    let output = {};
    //below is a function that properly assigns the graph data but only if JS hasnt forced the large arrays to be arrays of arrays
    ebaySearchResults.findCompletedItemsResponse[0].searchResult[0].item.forEach((e,i)=>{
      output[moment(e.listingInfo[0].endTime[0])]=e.sellingStatus[0].currentPrice[0].__value__
    })
    //this was temporarily scrapped in order to have MVP this is the general direction that I would LIKE 
    // ebaySearchResults.map(
    //   (e)=>{
    //     return e.map((ie)=>{
    //       console.log(ie)
    //         output[moment(ie.listingInfo[0].endTime[0])]=ie.sellingStatus[0].currentPrice[0].__value__
    //       })
    //   })
    console.log(output, "output - ebay search results -> ebay graph data");
    setEbayGraphData(output);
  }
},[ebaySearchResults])

useEffect(()=>{
      //sets the graph data based on the search results. I should migrate this to the server side later
  if(goodwillResults[0]){
    const arr = goodwillResults.map(
      (e)=>{
        return({
          [e.dateSold]:parseFloat(e.CurrentPrice.substring(1))
        })
      }
    )
    let output = {exists:true};
    arr.forEach(e=>{output={...output,...e}})
    setGoodwillGraphData(output);
  }
},[goodwillResults])

useEffect(()=>{
  const dates = Object.keys({...ebayGraphData, ...goodwillGraphData})
  delete dates.exists
  setDates(dates);
},[ebayGraphData, goodwillGraphData])

useEffect(()=>{
  Object.keys(ebayGraphData)[0]? 
  (chart.data.datasets[0].data=[],
  chart.data.labels = (dates),
  chart.data.datasets[0].data = dates.map(d=>ebayGraphData[d]),
  chart.update()) : null 
},[ebayGraphData,dates])

useEffect(()=>{
  goodwillGraphData.exists ? 
  ( 
    chart.data.labels = dates,
  chart.data.datasets[1].data = dates.map(d=>goodwillGraphData[d]),
  chart.update()) : null 
},[goodwillGraphData, dates])

  const ebaySubmit = ()=>{
    Axios.get('api/ebay', {params : { formInput:formInput }})
    .then(r=>setEbaySearchResults(r.data))
    .catch((err)=>{'connection error "${err}"'})
  }

  const shopGSubmit = ()=>{
    console.log(formInput);
    Axios.get('api/shopg', {params : { formInput:formInput }})
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
    <div id='canvas-container'>
    <canvas id="priceChart" data-ebay={ebayGraphData.soldDate} width="800" height="800"></canvas>
    </div>
  </div>
  )
}
export default App;
