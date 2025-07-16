import { Button, Dropdown } from "antd";
import React, { useState } from "react";
import { DeleteOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons";
import {
  HeaderContainer,
  ActionContainer,
  NoMarginTitle,
} from "@components/common/styled-components";

interface HeaderItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  onClick: () => void;
}

interface NodeHeaderProps {
  title: string;
  level?: 1 | 2 | 3 | 4 | 5;
  onDelete?: () => void;
  addMenuItems?: HeaderItem[];
}

export const NodeHeader: React.FC<NodeHeaderProps> = ({
  title,
  level = 5,
  onDelete,
  addMenuItems,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [addMenuVisible, setAddMenuVisible] = useState(false);

  return (
    <HeaderContainer>
      <NoMarginTitle level={level}>{title}</NoMarginTitle>
      <ActionContainer>
        {addMenuItems && addMenuItems.length > 0 && (
          <Dropdown
            menu={{
              items: addMenuItems.map((item) => ({
                key: item.key,
                label: item.label,
                icon: item.icon,
                danger: item.danger,
                onClick: () => {
                  item.onClick();
                  setAddMenuVisible(false);
                },
              })),
            }}
            open={addMenuVisible}
            onOpenChange={setAddMenuVisible}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button type="text" size="small" icon={<PlusOutlined />} />
          </Dropdown>
        )}
        {onDelete && (
          <Dropdown
            open={menuVisible}
            onOpenChange={setMenuVisible}
            menu={{
              items: [
                {
                  key: "delete",
                  danger: true,
                  label: "Delete",
                  icon: <DeleteOutlined />,
                  onClick: () => {
                    onDelete();
                    setMenuVisible(false);
                  },
                },
              ],
            }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        )}
      </ActionContainer>
    </HeaderContainer>
  );
};
