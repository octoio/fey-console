import { Button, List, Typography } from "antd";
import React from "react";
import { Edge, Node } from "reactflow";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";

const { Text } = Typography;

interface OrderedNodesListProps {
  parentId: string;
  nodes: Node[];
  edges: Edge[];
  onReorder: (nodeId: string, direction: "left" | "right") => void;
}

const ListItemWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 4px;
`;

export const OrderedNodesList: React.FC<OrderedNodesListProps> = ({
  parentId,
  nodes,
  edges,
  onReorder,
}) => {
  // Find all edges coming from this parent
  const childEdges = edges.filter((edge) => edge.source === parentId);

  // Sort child edges by their target positions in the nodes array
  // This gives us a stable initial order
  const sortedChildEdges = [...childEdges].sort((a, b) => {
    const nodeA = nodes.find((n) => n.id === a.target);
    const nodeB = nodes.find((n) => n.id === b.target);
    if (!nodeA || !nodeB) return 0;
    return nodeA.position.x - nodeB.position.x;
  });

  // Get the corresponding nodes
  const childNodes = sortedChildEdges
    .map((edge) => nodes.find((node) => node.id === edge.target))
    .filter(Boolean) as Node[];

  if (childNodes.length === 0) return null;

  return (
    <List
      size="small"
      bordered
      header={<Text strong>Execution Order</Text>}
      dataSource={childNodes}
      renderItem={(node, index) => (
        <List.Item>
          <ListItemWrapper>
            <Text>
              {index + 1}. {node.data.name || `${node.data.type} Node`}
            </Text>
            <ButtonGroup>
              <Button
                icon={<ArrowLeftOutlined />}
                size="small"
                disabled={index === 0}
                onClick={() => onReorder(node.id, "left")}
              />
              <Button
                icon={<ArrowRightOutlined />}
                size="small"
                disabled={index === childNodes.length - 1}
                onClick={() => onReorder(node.id, "right")}
              />
            </ButtonGroup>
          </ListItemWrapper>
        </List.Item>
      )}
    />
  );
};
