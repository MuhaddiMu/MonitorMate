import { Form, ActionPanel, Action, showToast, environment, Toast, popToRoot } from "@raycast/api";
import { useState, useEffect } from "react";
import { updateResourceList, checkIfHostIsUp, playSound, commonPortsAndProtocols } from "./utils";

interface Resource {
  url: string;
  type: string;
  port: string;
}

export default function AddResource(props) {
  const resource: Resource = props?.launchContext?.resource;
  const index = props?.launchContext?.index;

  const [url, setURL] = useState(resource?.url || "");
  const [type, setType] = useState(resource?.type || "");
  const [port, setPort] = useState(resource?.port || "");
  const [urlError, setUrlError] = useState("");
  const [portError, setPortError] = useState("");
  const [isFormLoading, setIsFormLoading] = useState(false);

  useEffect(() => {
    // Update the port only if the type is in commonPortsAndProtocols and different from the current port
    if (type in commonPortsAndProtocols && commonPortsAndProtocols[type].toString() !== port) {
      setPort(commonPortsAndProtocols[type].toString());
    }
    // Do not reset the port if the type is 'other'
  }, [type]);

  const handlePortChange = (newPort: string) => {
    setPort(newPort); // Keep the entered port value
    const portNum = parseInt(newPort, 10); // Parse the new port number
    let foundType = null;

    // Find the type that matches the port number
    for (const [key, value] of Object.entries(commonPortsAndProtocols)) {
      if (value === portNum) {
        foundType = key;
        break;
      }
    }

    // Update the type if found, otherwise set to 'other'
    setType(foundType || "other");
  };

  const isValidUrl = (url) => {
    // You can add more complex URL validation here
    // return url.startsWith('http://') || url.startsWith('https://');
    return url.length > 0;
  };

  const isValidPort = (port) => {
    const portNum = parseInt(port);
    return portNum > 0 && portNum <= 65535;
  };

  const handleSubmit = async () => {
    let valid = true;
    if (!isValidUrl(url)) {
      setUrlError("Invalid URL. Please enter a valid URL.");
      valid = false;
    } else {
      setUrlError("");
    }

    if (!isValidPort(port)) {
      setPortError("Invalid port. Please enter a valid port number.");
      valid = false;
    } else {
      setPortError("");
    }

    if (!valid) return;

    try {
      setIsFormLoading(true);
      const newResource = { url, type, port, statusHistory: []};

      const isHostUp = await checkIfHostIsUp(newResource);

      newResource.status = isHostUp.status;
      newResource.lastChecked = isHostUp.lastChecked;

      if (newResource.status === false) {
        await showToast(Toast.Style.Failure, `Resource ${url} of type ${type} on port ${port} is not reachable`);
        playSound(`${environment.assetsPath}/alert.mp3`);
        // return;
      }

      await updateResourceList(newResource, index);

      const action = typeof index === "number" ? "Updated" : "Added";
      await showToast(
        Toast.Style.Success,
        `Resource ${action}`,
        `Resource ${url} of type ${type} on port ${port} has been ${action.toLowerCase()}`,
      );

      popToRoot();
    } catch (error) {
      setIsFormLoading(false);
      if (error.message === "Resource with this URL and port already exists.") {
        await showToast(Toast.Style.Failure, "Duplicate Resource", error.message);
      } else {
      await showToast(Toast.Style.Failure, "Failed to Add/Update Resource", error.message);
      }
    } finally {
      setIsFormLoading(false);
      return;
    }
  };

  return (
    <Form
      isLoading={isFormLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Add Resource" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="url"
        title="Resource URL"
        value={url}
        placeholder="Enter the resource URL"
        onChange={setURL}
        error={urlError}
      />

      <Form.Dropdown id="resourceType" title="Resource Type" value={type} onChange={setType}>
        {Object.entries(commonPortsAndProtocols).map(([key, value]) => (
          <Form.Dropdown.Item key={key} value={key} title={key} />
        ))}
        <Form.Dropdown.Item value="other" title="Other" />
      </Form.Dropdown>

      <Form.TextField
        id="port"
        title="Port"
        value={port}
        placeholder="Enter the port number"
        onChange={handlePortChange}
        error={portError}
      />
    </Form>
  );
}
