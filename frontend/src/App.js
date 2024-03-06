// Desc: Main App component for the frontend of the application
// Note: When deployed swap out localhost to the IP address of the server

import React, { useEffect, useState } from 'react';
import './App.css';

// Chart.js Components
import { Bar, Line, Pie } from 'react-chartjs-2';

// Chakra UI Components
import { Box, ChakraProvider, Grid, GridItem, Select, extendTheme, Heading } from "@chakra-ui/react";


// All reqs for Chart.js to work
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';

// Metadata and Tertiary Styling for Charts
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

// Styling for Charts
const chartOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
      labels: {
        color: 'whitesmoke',
        fontFamily: 'Inter',
        fontSize: 12
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: 'white', 
      }
    },
    y: {
      grid: {
        display: false, 
      },
      ticks: {
        display: false, 
      }
    }
  }
};

const pieChartOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
      labels: {
        color: 'whitesmoke',
        fontFamily: 'Inter',
        fontSize: 12
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        display: false, 
      }
    },
    y: {
      grid: {
        display: false, 
      },
      ticks: {
        display: false, 
      }
    }
  }
};

function App() {

  // Colour Palette for Charts to iterate over for multiple cardinality
  const colourPalette = ["#FF5733", "#C70039", "#900C3F", "#581845", "#B2BABB", "#D35400", "#F39C12", "#7DCEA0", "#2E4053"];

  // State for the data -> series of setters and getters to update the state of data for our charts
  const [ageRange, setAgeRange] = useState('all');
  const [diabetesChartData, setDiabetesChartData] = useState({
    labels: [],
    datasets: []
  });
  
  const [sexRange, setSexRange] = useState('all');
  const [diabetesBMIChartData, setBMIDiabetesChartData] = useState({
    labels: [],
    datasets: []
  });

  const [heartAttackAgeRange, setHeartAttackAgeRange] = useState('all');
  const [heartAttackChartData, setHeartAttackChartData] = useState({
    labels: [],
    datasets: []
  });
  
  const [heartAttackSexRange, setHeartAttackSexRange] = useState('all');
  const [heartAttackSymptomChartData, setHeartAttackSymptomChartData] = useState({
    labels: [],
    datasets: []
  });

  const [breastCancerTStage, setBreastCancerTStage] = useState('all'); 
  const [breastCancerChartData, setBreastCancerChartData] = useState({
    labels: [],
    datasets: []
  });

  // Fetch Methods for Data requests sent to Flask API and series of dropdown handlers to fire request
  const getDiabetesAgeData = async (selectedValue = 'all') => {

    setAgeRange(selectedValue); 

    try {
      const response = await fetch(`http://3.253.88.202:5000/diabetes/age?age_range=${selectedValue}`);
      const data = await response.json();

      const chartData = {
        labels: Object.keys(data),
        datasets: [{
          data: Object.values(data),
          backgroundColor: ["#FF6384", "#36A2EB"]
        }]
      };
      setDiabetesChartData(chartData);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDiabetesDropdownChange = (event) => {
    getDiabetesAgeData(event.target.value);
  };
  
  const getDiabetesBMIData = async (selectedValue = 'all') => {

    setSexRange(selectedValue);

    try {
      const response = await fetch(`http://3.253.88.202:5000/diabetes/bmi?sex_range=${selectedValue}`);
      const data = await response.json();

      // Iterate over the data and assign a colour to each label
      const keys = Object.keys(data);
      const backgroundColours = keys.map((colour, index) => {
        const colourIndex = index % colourPalette.length;
        return colourPalette[colourIndex];
      });
            
      const chartData = {

        labels: Object.keys(data),
        datasets: [{
          data: Object.values(data),
          backgroundColor: backgroundColours
        }]
      };
      setBMIDiabetesChartData(chartData);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDiabetesBMIDropdownChange = (event) => {
    getDiabetesBMIData(event.target.value);
  };

  const getHeartDiseaseData = async (selectedValue = 'all') => {

    setHeartAttackAgeRange(selectedValue);

    try {
      const response = await fetch(`http://3.253.88.202:5000/heart/gender?age_range=${selectedValue}`);
      const data = await response.json();

      const chartData = {
        labels: Object.keys(data),
        datasets: [{
          data: Object.values(data),
          backgroundColor: ["#FF6384", "#36A2EB"]
        }],
      };
      setHeartAttackChartData(chartData);
    } catch (err) {
      console.log(err);
    }
  };

  const handleHeartAttackDropdownChange = (event) => {
    getHeartDiseaseData(event.target.value);
  }

  const getHeartAttackSymptomData = async (selectedValue = 'all') => {

    setHeartAttackSexRange(selectedValue);

    try {
      const response = await fetch(`http://3.253.88.202:5000/heart/symptoms?sex_range=${selectedValue}`);
      const data = await response.json();

      const keys = Object.keys(data);
      const backgroundColours = keys.map((colour, index) => {
        const colourIndex = index % colourPalette.length;
        return colourPalette[colourIndex];
      });
            
      const chartData = {
        labels: Object.keys(data),
        datasets: [{
          data: Object.values(data),
          backgroundColor: backgroundColours
        }]
      };
      setHeartAttackSymptomChartData(chartData);
    } catch (err) {
      console.log(err);
    }
  };

  const handleHeartAttackSymptomChange = (event) => {
    getHeartAttackSymptomData(event.target.value);
  };

  const getBreastCancerData = async (selectedValue = 'all') => {
    
    setBreastCancerTStage(selectedValue);

    try {
      const response = await fetch(`http://3.253.88.202:5000/breastcancer/stage?stage_range=${selectedValue}`)
      const data = await response.json();

      const keys = Object.keys(data);
      const backgroundColours = keys.map((colour, index) => {
        const colourIndex = index % colourPalette.length;
        return colourPalette[colourIndex];
      });

      const chartData = {
        labels: Object.keys(data),
        datasets: [{
          data: Object.values(data),
          backgroundColor: backgroundColours
        }]
      };
      setBreastCancerChartData(chartData);
    } catch (err) {
      console.log(err);
    }
  };

  const handleGetBreastCancerDataChange = (event) => {
    getBreastCancerData(event.target.value);
  };

  // On mount do fetches when the page is rendered
  useEffect(() => {
    getDiabetesAgeData();
    getDiabetesBMIData();
    getHeartDiseaseData();
    getHeartAttackSymptomData();
    getBreastCancerData();
  }, []);
  
  // On change/mount log the data to the console when the data is updated so we can requests being fulfilled
  useEffect(() => {
    diabetesChartData && console.log(diabetesChartData);
    diabetesBMIChartData && console.log(diabetesBMIChartData);
    heartAttackChartData && console.log(heartAttackChartData);
    heartAttackSymptomChartData && console.log(heartAttackSymptomChartData);
    breastCancerChartData && console.log(breastCancerChartData);
  }, [diabetesChartData, diabetesBMIChartData, heartAttackChartData, heartAttackSymptomChartData, breastCancerChartData])

  // Chakra UI Theme Stylings
  const theme = extendTheme({
    styles: {
      global: {
        "body": {
          backgroundColor: "#1f2124",
          color: "whitesmoke",
          fontFamily: "Inter"
        }
      }
    },
    components: {
      Heading: {
        baseStyle: {
          h1: {
            fontSize: "24px",
            fontWeight: "bold",
            color: "whitesmoke"
          },
          h2: {
            fontSize: "15px",
            fontWeight: "bold",
            color: "whitesmoke"
          }
        }
      }
    }
  })
  
  return (
    <ChakraProvider theme={theme}>
      <Box className="App" p={8} maxWidth='1440px' >
        <Box gap={4} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
        <Heading as="h1" size="xl" color="whitesmoke">Data Warehouse Solution for Healthcare Data</Heading>
        <Heading as="h2" size="l" color="whitesmoke"> Harry O Cleirigh - 12468998 </Heading>
        </Box>
      <Grid templateColumns="repeat(2, 1fr)" gap={24} maxWidth="100vw" marginTop={'80px'}>

          {/* Simple Pie Chart */}
          <GridItem
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            width="100%" 
            height="360px"
          > 
            <h1>Pie Chart of Incidents of Diabetes by Gender</h1>
            <Box width="100%" height="100%" marginTop={"24px"}>
              {
                Object.keys(diabetesChartData).length > 0 &&
                <Pie data={diabetesChartData} options={pieChartOptions} />
              }              
            </Box>
            <Box marginTop={"24px"} display={'flex'} flexDirection={'column'} gap={4}>
              <p>Filter by age:</p>
              <Select onChange={handleDiabetesDropdownChange} value={ageRange} width={"400px"}>
                <option value="all">All</option>
                <option value="under30">Under 30</option>
                <option value="30to60">30 to 60</option>
                <option value="over60">Over 60</option>
              </Select>
            </Box>
          </GridItem>

          {/* Simple Bar Chart of BMI */}
          <GridItem
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            width="100%" 
            height="360px"
          >
            <h1>Bar Chart of Incidents of Diabetes by BMI</h1>
            <Box width="80%" height="100%" marginTop={"24px"}>
              {
                Object.keys(diabetesBMIChartData).length > 0 &&
                <Bar data={diabetesBMIChartData} options={chartOptions} />
              }
            </Box>
            <Box marginTop={"24px"} display={'flex'} flexDirection={'column'} gap={4}>
              <p>Filter by gender:</p>
              <Select onChange={handleDiabetesBMIDropdownChange} value={sexRange} width={"400px"}>
                <option value="all">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </Select>
            </Box>
          </GridItem>

          {/* Simple Bar Chart of BMI */}
          <GridItem
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            width="100%" 
            height="360px"
          >
            <h1>Bar Chart of Heart Attack Deaths by Onset Symptom Type</h1>
            <Box width="80%" height="100%" marginTop={"24px"}>
              {
                Object.keys(heartAttackSymptomChartData).length > 0 &&
                <Bar data={heartAttackSymptomChartData} options={chartOptions} />
              }
            </Box>
            <Box marginTop={"24px"} display={'flex'} flexDirection={'column'} gap={4}>
              <p>Filter by gender:</p>
              <Select onChange={handleHeartAttackSymptomChange} value={heartAttackSexRange} width={"400px"}>
                <option value="all">All</option>
                <option value="1">Male</option>
                <option value="0">Female</option>
              </Select>
            </Box>
          </GridItem>

          {/* Simple Pie Chart */}
          <GridItem
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            width="100%" 
            height="360px"
          >
            <h1>Pie Chart of Heart Attack Deaths by Gender</h1>
            <Box width="100%" height="100%" marginTop={"24px"}>
              {
                Object.keys(heartAttackChartData).length > 0 &&
                <Pie data={heartAttackChartData} options={pieChartOptions} />
              }              
            </Box>
            <Box marginTop={"24px"} display={'flex'} flexDirection={'column'} gap={4}>
              <p>Filter by age:</p>
              <Select onChange={handleHeartAttackDropdownChange} value={heartAttackAgeRange} width={"400px"}>
                <option value="all">All</option>
                <option value="under30">Under 30</option>
                <option value="30to60">30 to 60</option>
                <option value="over60">Over 60</option>
              </Select>
            </Box>
          </GridItem>
      </Grid>
      <Box marginTop={'80px'} display={'flex'} flexDirection={'column'} justifyContent={'center'} width={'100%'}>
        <h1>Bar Chart of Breast Cancer Deaths</h1>
        <Box width="100%" height="400px" marginTop={"24px"}>
              {
                Object.keys(breastCancerChartData).length > 0 &&
                <Bar data={breastCancerChartData} options={chartOptions} />
              }
            </Box>
            <Box marginTop={"24px"} display={'flex'} flexDirection={'column'} gap={4} justifyContent={'flex-start'} alignItems={'flex-start'}>
            <p>Filter by stage:</p>
            <Select onChange={handleGetBreastCancerDataChange} value={breastCancerTStage} width={"400px"}>
              <option value="all">All</option>
              <option value="T1">T1</option>
              <option value="T2">T2</option>
              <option value="T3">T3</option>
              <option value="T4">T4</option>
            </Select>
          </Box>
        </Box>
      </Box>
    </ChakraProvider>
  );
}

export default App;
