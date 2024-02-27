import { Form, ActionPanel, Action, showToast, environment, Toast, popToRoot } from "@raycast/api";
import { useState } from "react";
import { updateResourceList, checkIfHostIsUp, playSound } from "./utils";

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
      const newResource = { url, type, port };

      const isHostUp = await checkIfHostIsUp(newResource);

      newResource.status = isHostUp.status;
      newResource.lastChecked = isHostUp.lastChecked;

      if (newResource.status === false) {
        await showToast(
          Toast.Style.Failure,
          "Failed to Add/Update Resource",
          `Resource ${url} of type ${type} on port ${port} is not reachable`,
        );
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
      await showToast(Toast.Style.Failure, "Failed to Add/Update Resource", error.message);
    } finally {
      setIsFormLoading(false);
    }
  };

  // Make sure updateResourceList is defined somewhere in your code
  // and is responsible for either adding or updating the resource in the list.

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
        <Form.Dropdown.Item title="URL" value="URL" />
        {/* Add other resource types as needed */}
      </Form.Dropdown>
      <Form.TextField
        id="port"
        title="Port"
        value={port}
        placeholder="Enter the port number"
        onChange={setPort}
        error={portError}
      />
    </Form>
  );
}
