import React,{useEffect, useState} from "react";
import Axios from "axios";

const App = ()=>{
  const [ebaySearchResults, setEbaySearchResults] = useState({});
  const [shopGResults,setShopG] = useState({});
  const [formInput, setFormInput] = useState('');

  const ebaySubmit = ()=>{
    const params = { formInput }
    Axios.get('api/ebay')
    .then(r=>setEbaySearchResults(r.data))
    .catch((err)=>{'connection error "${err}"'})
  }

  const shopGSubmit = ()=>{
    const params = { formInput }
    Axios.get('api/shopg')
    .then(r=>setShopG(r.data))
    .catch((err)=>{'connection error "${err}"'})
  }
  
  return( 
  <div>
  <button onClick={ebaySubmit}>Submit Ebay</button><br/>
  <button onClick={shopGSubmit}>Submit ShopGoodwill</button><br/>
  {console.log(ebaySearchResults)} {JSON.stringify(ebaySearchResults)}
  {console.log(shopGResults)}
  </div>
  )
}
export default App;
