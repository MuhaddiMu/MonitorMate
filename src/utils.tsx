import { LocalStorage } from "@raycast/api";

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
