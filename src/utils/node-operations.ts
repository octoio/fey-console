import { useSkillStore } from "@store/skill.store";

// Common handlers for node operations
export const useNodeOperations = (id: string) => {
  const { updateNode, removeNode } = useSkillStore();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNode(id, { name: e.target.value });
  };

  const handleNodeDelete = () => {
    removeNode(id);
  };

  return {
    handleNameChange,
    handleNodeDelete,
    updateNodeData: (data: any) => updateNode(id, data),
  };
};

// Types for working with different node data types
export type NodeDataHandler<T> = {
  data: T;
  onChange: (updated: T) => void;
};

// Helper to create a node data handler with proper typing
export const createNodeDataHandler = <T>(
  id: string,
  data: T,
  fieldName: string,
): NodeDataHandler<T> => {
  const { updateNode } = useSkillStore();

  return {
    data,
    onChange: (updated: T) => {
      updateNode(id, { [fieldName]: updated });
    },
  };
};
