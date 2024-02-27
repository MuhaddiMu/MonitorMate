import { List, ActionPanel, Action, Color, Icon, launchCommand, LaunchType } from "@raycast/api";
import { useState, useEffect } from "react";
import { fetchResources, deleteResource } from "./utils";
import moment from "moment";


export default function Command() {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    const fetchedResources = await fetchResources();
    setResources(fetchedResources);
  };

  const handleDelete = async (resource) => {
    await deleteResource(resource);

    loadResources();
  };

  const handleEdit = async (resource, index) => {
    await launchCommand({
      name: "add-resource",
      type: LaunchType.UserInitiated,
      context: { resource, index },
    });
  };

  // Example of determining the status icon
  const getStatusIcon = (status) => {
    return status ? Icon.CircleFilled : Icon.XMarkCircleFilled;
  };

  // Assume status is part of your resource object, indicating up or down
  return (
    <List navigationTitle="Search Resources">
      {resources.map((resource, index) => (
        <List.Item
          key={index}
          icon={{ source: getStatusIcon(resource.status), tintColor: resource.status ? Color.Green : Color.Red}}
          title={resource.url}
          subtitle={
            `Port: ${resource.port}`}
          accessories={[
            {
              text: `Last checked: ${moment(resource.lastChecked).fromNow()}`,
            },
            {
              text: resource.status ? "Up" : "Down",
            },
          ]}
          actions={
            <ActionPanel>
              <Action icon={Icon.Trash} title="Delete" onAction={() => handleDelete(resource)} />
              <Action icon={Icon.Pencil} title="Edit" onAction={() => handleEdit(resource, index)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
