import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Tabs, TabPanel, Accordion, type Tab } from "../navigation";

const TabsMeta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default TabsMeta;

export const Default: StoryObj = {
  render: () => {
    const Demo = () => {
      const [activeTab, setActiveTab] = React.useState("helm");

      const tabs: Tab[] = [
        { id: "helm", label: "Helm" },
        { id: "engineering", label: "Engineering" },
        { id: "weapons", label: "Weapons" },
        { id: "science", label: "Science" },
      ];

      return (
        <div>
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          <TabPanel value="helm" activeTab={activeTab}>
            <p>Helm controls and navigation systems.</p>
          </TabPanel>
          <TabPanel value="engineering" activeTab={activeTab}>
            <p>Power allocation and system management.</p>
          </TabPanel>
          <TabPanel value="weapons" activeTab={activeTab}>
            <p>Weapon systems and targeting.</p>
          </TabPanel>
          <TabPanel value="science" activeTab={activeTab}>
            <p>Sensors and analysis tools.</p>
          </TabPanel>
        </div>
      );
    };
    return <Demo />;
  },
};

export const WithDisabledTab: StoryObj = {
  render: () => {
    const Demo = () => {
      const [activeTab, setActiveTab] = React.useState("helm");

      const tabs: Tab[] = [
        { id: "helm", label: "Helm" },
        { id: "engineering", label: "Engineering" },
        { id: "weapons", label: "Weapons", disabled: true },
        { id: "science", label: "Science" },
      ];

      return (
        <div>
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          <TabPanel value="helm" activeTab={activeTab}>
            <p>Helm controls active.</p>
          </TabPanel>
          <TabPanel value="engineering" activeTab={activeTab}>
            <p>Engineering systems active.</p>
          </TabPanel>
          <TabPanel value="weapons" activeTab={activeTab}>
            <p>Weapons systems offline.</p>
          </TabPanel>
          <TabPanel value="science" activeTab={activeTab}>
            <p>Science scanners active.</p>
          </TabPanel>
        </div>
      );
    };
    return <Demo />;
  },
};

// Accordion Stories
const AccordionMeta: Meta<typeof Accordion> = {
  title: "Components/Accordion",
  component: Accordion,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export { AccordionMeta };

export const AccordionDefault: StoryObj<typeof Accordion> = {
  args: {
    items: [
      {
        id: "1",
        title: "Propulsion Systems",
        content: <p>Impulse engines at 85% efficiency. Warp drive ready.</p>,
      },
      {
        id: "2",
        title: "Defensive Systems",
        content: <p>Shields at 72%. Point defense active.</p>,
      },
      {
        id: "3",
        title: "Weapon Systems",
        content: <p>Energy weapons charged. Missile tubes loaded.</p>,
      },
    ],
  },
};

export const AccordionMultiple: StoryObj<typeof Accordion> = {
  args: {
    multiple: true,
    defaultExpanded: ["1", "2"],
    items: [
      {
        id: "1",
        title: "Hull Integrity",
        content: <p>98% - All sections nominal.</p>,
      },
      {
        id: "2",
        title: "Life Support",
        content: <p>Oxygen levels: 21%. Temperature: 295K.</p>,
      },
      {
        id: "3",
        title: "Power Grid",
        content: <p>Primary reactor: 100%. Backup: Standby.</p>,
      },
    ],
  },
};

export const AccordionWithDisabled: StoryObj<typeof Accordion> = {
  args: {
    items: [
      {
        id: "1",
        title: "Active Systems",
        content: <p>All systems operational.</p>,
      },
      {
        id: "2",
        title: "Offline Systems",
        content: <p>No systems offline.</p>,
        disabled: true,
      },
      {
        id: "3",
        title: "Diagnostics",
        content: <p>Running diagnostics...</p>,
      },
    ],
  },
};
