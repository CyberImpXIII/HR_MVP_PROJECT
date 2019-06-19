import React,{useEffect, useState} from "react";
import Axios from "axios";

const App = ()=>{
  const [ebaySearchResults, setEbaySearchResults] = useState({});
  const [formInput, setFormInput] = useState('');

  const ebaySubmit = ()=>{
    const params = { formInput }
    Axios.get('api')
    .then(r=>setEbaySearchResults(r.data))
    .catch((err)=>{'connection error "${}"'})
  }
  
  return( 
  <div>
  <button onClick={ebaySubmit}>Submit</button><br/>
  {console.log(ebaySearchResults), JSON.stringify(ebaySearchResults)}
  </div>
  )
}
export default App;
