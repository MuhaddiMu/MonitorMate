// check-status.tsx
import { showToast, Toast, LaunchProps, environment } from "@raycast/api";
import { fetchResources, updateResourceList, checkIfHostIsUp, playSound } from "./utils";


export default async function checkStatus(LaunchProps: LaunchProps) {
    const { launchType } = LaunchProps;
    
  try {
    const resources = await fetchResources();

    if (resources.length === 0) {
      console.log("No resources to check.");
      return;
    }

    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];

      console.log(`Checking resource: ${resource.url}`);

      try {
        const statusResult = await checkIfHostIsUp(resource);

        await updateResourceList({ ...resource, ...statusResult }, i);

        console.log(statusResult.status);
        

        if (!statusResult.status && launchType === "userInitiated") {
          await showToast(Toast.Style.Failure, "Resource Unreachable", `Resource at ${resource.url} is not reachable.`);
          playSound(`${environment.assetsPath}/alert.mp3`);
        } else if(statusResult.status === false ) {
          playSound(`${environment.assetsPath}/alert.mp3`);
        }
      } catch (error) {
        console.error(`Error checking resource ${resource.url}:`, error);
      }
    }
  } catch (error) {
    console.error("Failed to check resources:", error);
  }
}

