import React, { useState, useEffect } from 'react'
import './styles/App.scss'

import axios from 'axios'

import { parseQuoteStr, readStr } from './utilties/strUtilities'

function App() {
  const [ipAddress, setIPAddress] = useState()
  const [lat, setLat] = useState()
  const [lon, setLong] = useState()
  const [quote, setQuote] = useState({ content: null, author: null })
  const [currentQuoteId, setCurrentQuoteId] = useState()
  const [pastQuotes, setPastQuotes] = useState({})
  const [pastQuoteOrder, setPastQuoteOrder] = useState([])
  const [singleQuoteMode, setQuoteMode] = useState(true)
  const [quoteRatings, setQuoteRatings] = useState({})

  useEffect(() => {
    fetchIPAddress()
    fetchQuote()
  }, [])

  const fetchIPAddress = async () => {
    let response = await axios.get('http://ip-api.com/json')
      const { query: ipAddress, lat, lon } = response.data
      setIPAddress(ipAddress)
      setLat(lat)
      setLong(lon)

      console.log("IP Data", response.data)
  }

  const fetchQuote = async () => {
    let response = await axios.get('https://quotesondesign.com/wp-json/wp/v2/posts/?orderby=rand&per_page=10')
    if (response.status === 200) {
      let quotes = response.data

      for (let i=0; i < quotes.length; i++) {
        let quote = quotes[i]
        if (!pastQuotes[quote.id]) {
          let content = parseQuoteStr(quote.content.rendered)
          let quoteObject = { content, author: quote.title.rendered }
          setQuote(quoteObject)
          pastQuotes[quote.id] = quoteObject
          setCurrentQuoteId(quote.id)
          setPastQuotes(pastQuotes)
          setPastQuoteOrder(pastQuoteOrder.concat(quote.id))
          return
        }
      }
    }
  }

  const readQuote = () => {
    readStr(quote.content)
  }

  const showPastQuotesOrSingleQuote = () => {
    setQuoteMode(!singleQuoteMode)
  }

  const rateQuote = (rating) => {
    fetchQuote()
    quoteRatings[currentQuoteId] = rating
    setQuoteRatings(quoteRatings)
  }

  const robotImageURL = `https://robohash.org/${ipAddress}.png?bgset=bg2`
  const mapImage = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s(${lon},${lat})/${lon},${lat},9.67,0.00,0.00/500x500@2x?access_token=pk.eyJ1IjoicmVhbHNlYW4iLCJhIjoiY2s3bnB3YjhjMDE4YjNncGdhaDFraHR2ZiJ9.HbrfAF0MChL2E_T7ZROD9A`

  console.log(quoteRatings)
  return (
    <div className="App">
      <header className="App-header">
        <h1>Quote Bot</h1>
        <div className="container">
          <div className="level">
            <div className="level-left user-container">
              {ipAddress && (
                <picture>
                  <img src={robotImageURL} className="robot" alt="logo" />
                </picture>
              )}
              <br/>
              {lat && lon && (
                <picture>
                  <img src={mapImage} className="robot" alt="logo" />
                </picture>
              )}
            </div>
            <div className="level-right quote-container">
              <div className="button-container">
                {singleQuoteMode && (
                  <button className='button' onClick={readQuote}>
                    Read this quote
                  </button>
                )}
                
                <button className='button' onClick={showPastQuotesOrSingleQuote}>
                  { singleQuoteMode ? 'Show past quotes' : 'Show single quote' }
                </button>
              </div>

              {/* Quote */}
              {singleQuoteMode ? 
                currentQuoteId && (
                  <div className="single-quote-container">
                    <QuoteBox quote={pastQuotes[currentQuoteId].content} author={pastQuotes[currentQuoteId].author}/>
                    <div className="single-quote-container-buttons">
                    <button className='button is-danger' onClick={() => { rateQuote('bad') } }>
                      Lame
                    </button>
                    <button className='button is-warning' onClick={() => { rateQuote('ok') }}>
                      Meh
                    </button>
                    <button className='button is-success' onClick={() => { rateQuote('good') }}>
                      Great
                    </button>
                    </div>
                  </div>
                  
                ) :
                (pastQuoteOrder.map((id) => {
                  const quote = pastQuotes[id]
                  const rating = quoteRatings[id]
                  return (
                    <QuoteBox
                      key={id}
                      quote={quote.content}
                      author={quote.author}
                      rating={rating}
                      onClick={() => { 
                        setCurrentQuoteId(id)
                        showPastQuotesOrSingleQuote()
                      }}
                    />
                  )
                })

                )

              }
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

const QuoteBox = ({ quote, author, rating}) => (
  <div className={rating ? 'quote-box ' + rating : 'quote-box'}>
    <div className='context'>
      {quote}
    </div>
    <div className='author'>
      {author}
    </div>
  </div>
)

export default App;
