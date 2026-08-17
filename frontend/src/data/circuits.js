// src/data/circuits.js
// Shared circuit metadata – consumed by React components and Three.js helpers.

const CIRCUITS = {
  monaco: {
    name:"Circuit de Monaco", city:"Monte Carlo", length:3.337, laps:78, corners:19,
    topSpeed:290, drs:1, lapRecord:"1:10.166", type:"Street",
    waypoints:[[0,0,0],[0.8,0,0.4],[1.6,0,0.9],[2.0,0,1.8],[1.8,0,2.8],[1.0,0,3.2],[0.2,0,3.0],[-0.4,0,2.4],[-0.8,0,1.6],[-0.6,0,0.8],[0,0,0]],
    speeds:[120,180,280,160,90,140,200,170,130,160,120],
    radar:{Speed:4,Technicality:9,DRS:2,Elevation:5,Overtaking:3,"Safety Car":8},
    constructors:["Red Bull","Ferrari","Mercedes","McLaren","Aston Martin"], winProbs:[28,22,18,16,10],
    drivers:["Verstappen","Leclerc","Hamilton","Norris","Alonso"],
    teams:["Red Bull","Ferrari","Mercedes","McLaren","Aston Martin"],
  },
  silverstone: {
    name:"Silverstone Circuit", city:"Northamptonshire", length:5.891, laps:52, corners:18,
    topSpeed:326, drs:2, lapRecord:"1:27.097", type:"Permanent",
    waypoints:[[0,0,0],[1.2,0,0.3],[2.4,0,0.1],[3.2,0,0.8],[3.0,0,1.8],[2.2,0,2.4],[1.2,0,2.6],[0.3,0,2.2],[-0.3,0,1.4],[0,0,0]],
    speeds:[310,290,180,260,230,190,280,300,200,310],
    radar:{Speed:8,Technicality:7,DRS:5,Elevation:3,Overtaking:7,"Safety Car":5},
    constructors:["Red Bull","Mercedes","Ferrari","McLaren","Williams"], winProbs:[30,25,20,14,8],
    drivers:["Verstappen","Hamilton","Leclerc","Norris","Russell"],
    teams:["Red Bull","Mercedes","Ferrari","McLaren","Williams"],
  },
  monza: {
    name:"Autodromo di Monza", city:"Milan", length:5.793, laps:53, corners:11,
    topSpeed:362, drs:2, lapRecord:"1:21.046", type:"Permanent",
    waypoints:[[0,0,0],[1.5,0,0],[3.0,0,0.2],[3.8,0,0.8],[3.5,0,1.6],[2.5,0,2.0],[1.5,0,1.8],[0.8,0,1.2],[0,0,0]],
    speeds:[350,180,340,300,160,320,290,180,350],
    radar:{Speed:10,Technicality:3,DRS:7,Elevation:2,Overtaking:9,"Safety Car":4},
    constructors:["Red Bull","Ferrari","McLaren","Mercedes","AlphaTauri"], winProbs:[26,24,18,16,9],
    drivers:["Verstappen","Leclerc","Norris","Hamilton","Gasly"],
    teams:["Red Bull","Ferrari","McLaren","Mercedes","AlphaTauri"],
  },
  spa: {
    name:"Spa-Francorchamps", city:"Liège", length:7.004, laps:44, corners:19,
    topSpeed:368, drs:2, lapRecord:"1:41.252", type:"Permanent",
    waypoints:[[0,0,0],[0.8,0.4,0.5],[1.8,0.8,0.9],[2.6,1.2,1.4],[3.2,0.8,2.0],[3.6,0.4,2.6],[3.0,0,2.8],[2.0,0,2.4],[1.0,0,2.0],[0.2,0,1.2],[0,0,0]],
    speeds:[320,280,200,190,340,360,240,220,300,260,320],
    radar:{Speed:9,Technicality:7,DRS:6,Elevation:10,Overtaking:8,"Safety Car":6},
    constructors:["Red Bull","Ferrari","Mercedes","McLaren","Alpine"], winProbs:[32,20,19,14,9],
    drivers:["Verstappen","Leclerc","Hamilton","Norris","Ocon"],
    teams:["Red Bull","Ferrari","Mercedes","McLaren","Alpine"],
  },
  suzuka: {
    name:"Suzuka International Racing Course", city:"Mie Prefecture", length:5.807, laps:53, corners:18,
    topSpeed:326, drs:1, lapRecord:"1:30.983", type:"Permanent",
    waypoints:[[0,0,0],[0.6,0,0.8],[1.2,0,1.6],[2.0,0,2.0],[2.8,0,1.8],[3.2,0,1.0],[3.2,0,0],[2.8,0,-0.8],[2.0,0,-1.0],[1.2,0,-0.6],[0.6,0,0],[0,0,0]],
    speeds:[280,260,200,310,290,220,300,240,180,240,290,280],
    radar:{Speed:7,Technicality:8,DRS:3,Elevation:4,Overtaking:5,"Safety Car":7},
    constructors:["Red Bull","Aston Martin","Ferrari","Mercedes","McLaren"], winProbs:[35,18,18,15,8],
    drivers:["Verstappen","Alonso","Leclerc","Hamilton","Norris"],
    teams:["Red Bull","Aston Martin","Ferrari","Mercedes","McLaren"],
  },
};

const CIRCUIT_KEYS   = Object.keys(CIRCUITS);
const CIRCUIT_LABELS = ["Monaco","Silverstone","Monza","Spa","Suzuka"];
const ALL_DRIVERS    = ["Verstappen","Hamilton","Leclerc","Norris","Alonso","Russell","Sainz","Pérez"];

// Make available globally (used by plain-JS helpers loaded before React)
window.CIRCUITS       = CIRCUITS;
window.CIRCUIT_KEYS   = CIRCUIT_KEYS;
window.CIRCUIT_LABELS = CIRCUIT_LABELS;
window.ALL_DRIVERS    = ALL_DRIVERS;
