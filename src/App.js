import { Card, CardContent, FormControl, MenuItem, Select } from '@material-ui/core';
import { useEffect, useState } from 'react';
import './App.css';
import InfoBox from './InfoBox';
import LineGraph from './LineGraph';
import Map from './Map';
import Table from './Table';
import { sortData } from './util';

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide')
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);

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
    });
  };

  console.log("COUNTRY INFO >>>", countryInfo);

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
          <InfoBox title="Coroanvirus cases" cases={countryInfo.todayCases} total={countryInfo.cases} />
          <InfoBox title="Recovered" cases={countryInfo.todayRecovered}  total={countryInfo.recovered} />
          <InfoBox title="Deaths" cases={countryInfo.todayDeaths} total={countryInfo.deaths} />
        </div>
        {/* Map */}
        <Map />
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Countries</h3>
          <Table countries={tableData} />
          <h3>World wide new cases</h3>
          <LineGraph />
          <h3>World wide new deaths</h3>
          <LineGraph casesType="deaths"/>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
