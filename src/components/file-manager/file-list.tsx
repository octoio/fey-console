import { List, Input, Typography, Space, Select } from "antd";
import React, { useState } from "react";
import { FileOutlined, FileTextOutlined } from "@ant-design/icons";
import {
  FileListCard,
  ScrollableList,
  SearchContainer,
  StyledTag,
  StyledBadge,
  SmallText,
} from "@components/common/styled-components";
import styled from "@emotion/styled";
import { useDebounce } from "@hooks/use-debounce";
import { useFileFilter, getFileType } from "@hooks/use-file-filter";
import { FileInfo } from "@utils/entity-scanner";

const { Text } = Typography;
const { Search } = Input;

const FileTypeSelect = styled(Select)`
  width: 150px;
`;

const FileItemContent = styled(Space)`
  align-items: start;
`;

const FileItemDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

interface FileListProps {
  files: FileInfo[];
}

export const FileList: React.FC<FileListProps> = ({ files }) => {
  const [searchText, setSearchText] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState<string | null>(null);

  // Debounce search text for better performance
  const debouncedSearchText = useDebounce(searchText, 300);

  // Use optimized filtering hook
  const { filteredFiles, fileTypes, entityTypes } = useFileFilter({
    files,
    searchText: debouncedSearchText,
    fileTypeFilter,
  });

  return (
    <FileListCard
      title={`Files (${files.length})`}
      size="small"
      extra={
        <Space>
          {Object.entries(entityTypes).map(([type, count]) => (
            <StyledTag key={type} color="#3f51b5">
              {type}: {count}
            </StyledTag>
          ))}
        </Space>
      }
    >
      <SearchContainer>
        <Search
          placeholder="Search files..."
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ flex: 1 }}
        />
        <FileTypeSelect
          placeholder="Filter by type"
          allowClear
          data-testid="file-type-select"
          onChange={(value: unknown) =>
            setFileTypeFilter(value as string | null)
          }
        >
          {fileTypes.map((type) => (
            <Select.Option key={type} value={type}>
              {type}
            </Select.Option>
          ))}
        </FileTypeSelect>
      </SearchContainer>

      <ScrollableList
        size="small"
        dataSource={filteredFiles}
        renderItem={(item) => {
          const fileItem = item as FileInfo;
          return (
            <List.Item>
              <FileItemContent>
                {fileItem.isEntity ? <FileTextOutlined /> : <FileOutlined />}
                <FileItemDetails>
                  <Text strong>{fileItem.name}</Text>
                  <SmallText type="secondary">{fileItem.path}</SmallText>
                </FileItemDetails>
                <div>
                  <StyledTag color="#87d068">
                    {getFileType(fileItem.name)}
                  </StyledTag>
                  {fileItem.entityType && (
                    <StyledBadge count={fileItem.entityType} />
                  )}
                </div>
              </FileItemContent>
            </List.Item>
          );
        }}
      />
    </FileListCard>
  );
};
