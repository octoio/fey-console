import {
  Card,
  Input,
  InputNumber,
  List,
  Select,
  Space,
  Typography,
  Tag,
  Badge,
  Collapse,
} from "antd";
import styled from "@emotion/styled";

const { Text, Title } = Typography;
const { Panel } = Collapse;

// Layout components
export const FullWidthContainer = styled.div`
  width: 100%;
`;

export const FullHeightContainer = styled.div`
  height: 100%;
`;

export const FlexContainer = styled.div`
  display: flex;
`;

export const FlexColumnContainer = styled(FlexContainer)`
  flex-direction: column;
`;

export const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ScrollableContainer = styled.div`
  overflow-y: auto;
  max-height: 400px;
`;

// Spacing components
export const SpacedContainer = styled.div<{ spacing?: number }>`
  margin-bottom: ${(props) => props.spacing ?? 16}px;
`;

// Card components
export const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

export const CompactCard = styled(Card)`
  margin-bottom: 8px;
`;

// Form components
export const FullWidthInput = styled(Input)`
  width: 100%;
`;

export const FullWidthInputNumber = styled(InputNumber)`
  width: 100%;
`;

export const FullWidthSelect = styled(Select)`
  width: 100%;
`;

export const FullWidthSpace = styled(Space)`
  width: 100%;
`;

export const ReadOnlyInput = styled(Input)`
  background-color: #f5f5f5;
`;

// Text components
export const NoMarginTitle = styled(Title)`
  margin: 0;
`;

export const SecondaryText = styled(Text)`
  color: #666;
`;

export const SmallText = styled(Text)`
  font-size: 12px;
`;

// Header/Section styling
export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const FormSection = styled.div`
  margin-bottom: 24px;
`;

// List components
export const ListItemContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

export const ScrollableList = styled(List)<{ dataSource: any[] }>`
  overflow-y: auto;
  max-height: 300px;
`;

// Button group styling
export const ButtonGroup = styled.div`
  display: flex;
  gap: 4px;
`;

export const ActionContainer = styled.div`
  display: flex;
  gap: 4px;
`;

// Tag and badge styling
export const StyledTag = styled(Tag)<{ color?: string }>`
  margin-right: 4px;
`;

export const StyledBadge = styled(Badge)`
  margin-left: 4px;
`;

// Collapse and panels
export const TransparentCollapse = styled(Collapse)`
  background: transparent;
`;

export const StyledPanel = styled(Panel)`
  margin-bottom: 10px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  background: #fff;
`;

// Panel content
export const PanelContainer = styled.div`
  padding: 12px;
`;

// Empty state containers
export const EmptyContainer = styled.div`
  text-align: center;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 16px;
`;

// File selection styling
export const FileSelector = styled(Select)`
  width: 220px;
  margin-bottom: 8px;
`;

// Editor styling
export const EditorContainer = styled.div`
  height: 60vh;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
`;

// Flow container styling
export const FlowContainer = styled.div`
  height: 82vh;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
`;

// Form container
export const FormContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  height: calc(100vh - 100px);
  overflow-y: auto;
  padding-bottom: 20px;
`;

export const FileListCard = styled(Card)`
  max-height: 400px;
  margin-bottom: 16px;
`;

export const SearchContainer = styled(Space)`
  width: 100%;
  margin-bottom: 8px;
`;
