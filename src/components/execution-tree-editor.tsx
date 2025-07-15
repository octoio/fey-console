import "reactflow/dist/style.css";

import { Button, Card, Space, Typography } from "antd";
import React, { useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  NodeProps,
  Panel,
} from "reactflow";
import { FlowContainer } from "@components/common/styled-components";
import styled from "@emotion/styled";

import { SkillActionNodeType } from "@models/skill.types";
import { useSkillStore } from "@store/skill.store";
import { autoLayoutNodes } from "@utils/auto-layout";
import { AnimationNode } from "./nodetypes/animation-node";
import { DelayNode } from "./nodetypes/delay-node";
import { HitEffectNode } from "./nodetypes/hit-effect-node";
import { ParallelNode } from "./nodetypes/parallel-node";
import { RequirementNode } from "./nodetypes/requirement-node";
import { SequenceNode } from "./nodetypes/sequence-node";
import { SoundNode } from "./nodetypes/sound-node";
import { StatusNode } from "./nodetypes/status-node";
import { SummonNode } from "./nodetypes/summon-node";

const { Title, Text } = Typography;

const ToolboxCard = styled(Card)`
  padding: 16px;
`;

const AutoLayoutButton = styled(Button)`
  background-color: #52c41a;
`;

export const ExecutionTreeEditor: React.FC = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setNodes,
  } = useSkillStore();

  // Register custom node types
  const nodeTypes = useMemo(
    () =>
      ({
        [SkillActionNodeType.Sequence]: SequenceNode,
        [SkillActionNodeType.Parallel]: ParallelNode,
        [SkillActionNodeType.Delay]: DelayNode,
        [SkillActionNodeType.Animation]: AnimationNode,
        [SkillActionNodeType.Sound]: SoundNode,
        [SkillActionNodeType.Hit]: HitEffectNode,
        [SkillActionNodeType.Status]: StatusNode,
        [SkillActionNodeType.Summon]: SummonNode,
        [SkillActionNodeType.Requirement]: RequirementNode,
      }) as Record<SkillActionNodeType, React.FC<NodeProps>>,
    [],
  );

  // Function to add a new root node if none exists
  const addRootNode = useCallback(
    (type: SkillActionNodeType) => {
      addNode(type, null);
    },
    [addNode],
  );

  const handleAutoLayout = () => {
    const laidOutNodes = autoLayoutNodes(nodes, edges);
    setNodes(laidOutNodes);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <FlowContainer>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background />

          <Panel position="top-right">
            <ToolboxCard size="small">
              <Title level={5}>Toolbox</Title>

              {nodes.length === 0 ? (
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Text>Start by adding a requirement node:</Text>
                  <Button
                    size="small"
                    onClick={() => addRootNode(SkillActionNodeType.Requirement)}
                  >
                    Add {SkillActionNodeType.Requirement}
                  </Button>
                </Space>
              ) : (
                <AutoLayoutButton
                  size="small"
                  type="primary"
                  onClick={handleAutoLayout}
                >
                  Auto Layout
                </AutoLayoutButton>
              )}
            </ToolboxCard>
          </Panel>
        </ReactFlow>
      </FlowContainer>
    </Space>
  );
};
