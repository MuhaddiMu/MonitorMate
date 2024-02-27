import { LocalStorage } from "@raycast/api";
import moment from "moment";

export const fetchResources = async () => {
  try {
    // Retrieve the resources from LocalStorage
    const storedResources = await LocalStorage.getItem("resources");

    // Parse the stored string back into an array
    const resources = storedResources ? JSON.parse(storedResources) : [];

    return resources;
  } catch (error) {
    console.error("Failed to fetch resources:", error);
    return [];
  }
};

export const updateResourceList = async (resource, index) => {
  const resources = (await fetchResources()) || [];
  const existingIndex = resources.findIndex(r => r.url === resource.url && r.port === resource.port);

  if (existingIndex !== -1 && existingIndex !== index) {
    throw new Error("Resource with this URL and port already exists.");
  }

  if (typeof index === "number") {
    resources[index] = resource; // Update existing resource
  } else {
    resources.push(resource); // Add new resource
  }

  await LocalStorage.setItem("resources", JSON.stringify(resources));
};


export const deleteResource = async (resource) => {
  const resources = (await fetchResources()) || [];
  const newResources = resources.filter((r) => r.url !== resource.url);
  await LocalStorage.setItem("resources", JSON.stringify(newResources));
};

const net = require("net");
export const checkIfHostIsUp = async (resource) => {
  
  return new Promise((resolve) => {
    const { url, port } = resource;

    const client = new net.Socket();
    const lastChecked = new Date().toISOString();

    client.setTimeout(5000); // Set timeout to 5 seconds

    client.connect(port, url, () => {
      client.end();
      resolve({ status: true, lastChecked });
    });

    client.on("error", () => {
      client.destroy();
      resolve({ status: false, lastChecked });
    });

    client.on("timeout", () => {
      client.destroy();
      resolve({ status: false, lastChecked });
    });
  });
};

const { exec } = require('child_process');

/**
 * Plays a sound file.
 * @param {string} filePath - The path to the sound file.
 * @param {number} volume - Volume level (0.0 to 1.0).
 */
export const playSound = (filePath, volume = 1.0) => {
    const command = `afplay "${filePath}" --volume ${volume}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error playing sound: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
    });
};

// Example usage
// playSound('/path/to/your/soundfile.wav', 0.5);

export const commonPortsAndProtocols = {
  "http": 80,
  "https": 443,
  "ftp": 21,
  "ssh": 22,
  "telnet": 23,
  "smtp": 25,
  "dns": 53,
  "dhcp": 67,
  "tftp": 69,
  "http-alt": 8080,
  "pop3": 110,
  "imap": 143,
  "ldap": 389,
  "https-alt": 8443,
  "microsoft-ds": 445,
  "mysql": 3306,
  "postgresql": 5432,
  "mssql": 1433,
  "rdp": 3389,
  "vnc": 5900,
  "snmp": 161,
  "snmp-trap": 162,
  "ntp": 123,
  "netbios-ns": 137,
  "netbios-dgm": 138,
  "netbios-ssn": 139,
  "ldap": 389,
  "ldaps": 636,
  "kerberos": 88,
  "kpasswd": 464,
  "kadmin": 749,
  "kpop": 1109,
  "knetd": 2053,
  "kshell": 544,
}

export const generateChartUrl = (statusHistory) => {
  const labels = statusHistory.map(entry => moment(entry.timestamp).format("h:mm A")); 
  const data = statusHistory.map(entry => entry.status ? 1 : 1); // Assigning 1 for 'up' status and 1 for 'down'

  // Assigning green color for 'up' status and red for 'down'
  const backgroundColors = statusHistory.map(entry => entry.status ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)');

  const chartConfig = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Resource Status',
        data: data,
        backgroundColor: backgroundColors,
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'x', 
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: true // Removes grid lines
          },
        },
        x: {
          beginAtZero: true, 
          grid: {
            display: true 
          },
          ticks: {
            display: true 
          }
        }
      },
      plugins: {
        legend: {
          display: true // Removes the legend
        },
      }
    }
  };

  // rgba for dracula theme
  const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&width=500&height=200&v=4&bkg=rgba(55,35,85,0.5)`;
  return chartUrl;
};