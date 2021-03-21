import { Card, CardContent, FormControl, MenuItem, Select } from '@material-ui/core';
import { useEffect, useState } from 'react';
import './App.css';
import InfoBox from './InfoBox';
import LineGraph from './LineGraph';
import Map from './Map';
import Table from './Table';
import { prettyPrintStat, sortData } from './util';
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide')
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState([35.41222, 139.4130]);    // Tokyo
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState('cases');

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data)
    });
  }, []);

  //  https://disease.sh/v3/covid-19/countries

  useEffect(() => {
    // async -> send a request, wait for it do something with info
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ( {
              name: country.country,    // United States, United Kingdom
              value: country.countryInfo.iso2,    // USA, UK
            }));


          const sortedData = sortData(data);
          setTableData(sortedData);
          setCountries(countries);
          setMapCountries(data);
        })
    };
    getCountriesData();
  }, [])

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;

    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`

    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountry(countryCode);
      // ALl of the data
      // from the country response
      setCountryInfo(data);

      if (countryCode !== 'worldwide') { 
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      }
    });
  };

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
            <FormControl className="app__dropdown">
              <Select variant="outlined" 
                onChange={onCountryChange}
                value={country} >
                <MenuItem value="worldwide">WorldWide</MenuItem>
                {
                  /* Loop through all the conuntries and show a dropdown list of the options */
                  countries.map(country => (
                    <MenuItem value={country.value}>{country.name}</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
        </div>


        <div className="app__stats">
          <InfoBox title="Coroanvirus cases" cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)} 
            onClick={ e => setCasesType('cases')} active={casesType==="cases"} isRed="true"/>
          <InfoBox title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)}  total={prettyPrintStat(countryInfo.recovered)}
            onClick={ e => setCasesType('recovered')} active={casesType==="recovered"}/>
          <InfoBox title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)}
            onClick={ e => setCasesType('deaths')} active={casesType==="deaths"} isRed="true"/>
        </div>
        {/* Map */}
        <Map 
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Countries</h3>
          <Table countries={tableData} />
          <h3 className="app__graphTitle">World wide new {casesType} </h3>
          <LineGraph className="app__graph" casesType={casesType}/>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
