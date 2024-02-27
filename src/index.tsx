import { List, ActionPanel, Action, Color, Icon, launchCommand, LaunchType, Detail } from "@raycast/api";
import { useState, useEffect } from "react";
import { fetchResources, deleteResource, generateChartUrl } from "./utils";
import moment from "moment";


export default function Command() {
  const [resources, setResources] = useState([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState({});

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



  const handleDetails = (resource) => {
    setSelectedResource(resource);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedResource(null);
  };


  const getStatusIcon = (status) => {
    return status ? Icon.CircleFilled : Icon.XMarkCircleFilled;
  };


  if (isDetailsOpen && selectedResource) {
    const chartUrl = generateChartUrl(selectedResource.statusHistory);
    const markdown = `
  # Resource Details
  **URL**: ${selectedResource.url}
  **Port**: ${selectedResource.port}
  **Last Checked**: ${moment(selectedResource.lastChecked).fromNow()}
  **Status**: ${selectedResource.status ? 'Up' : 'Down'}
  
  ## Uptime Chart
  ![Uptime Chart](${chartUrl})
  `;

    return (
      <Detail 
        markdown={markdown} 
        actions={
          <ActionPanel>
            <ActionPanel.Item title="Close" onAction={closeDetails} />
            {/* Other actions if needed */}
          </ActionPanel>
        }
      />
    );
  }

  // Default list view
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
              <ActionPanel.Item title="Details" onAction={() => handleDetails(resource)} />
              <Action icon={Icon.Pencil} title="Edit" onAction={() => handleEdit(resource, index)} />
              <Action icon={Icon.Trash} title="Delete" onAction={() => handleDelete(resource)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
