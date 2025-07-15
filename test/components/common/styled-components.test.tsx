import React from "react";
import { describe, it, expect, vi } from "vitest";

import {
  FullWidthContainer,
  FullHeightContainer,
  FlexContainer,
  FlexColumnContainer,
  CenteredContainer,
  ScrollableContainer,
  SpacedContainer,
  StyledCard,
  CompactCard,
  FullWidthInput,
  FullWidthInputNumber,
  FullWidthSelect,
  FullWidthSpace,
  ReadOnlyInput,
  NoMarginTitle,
  SecondaryText,
  SmallText,
  HeaderContainer,
  FormSection,
  ListItemContainer,
  ScrollableList,
  ButtonGroup,
  ActionContainer,
  StyledTag,
  StyledBadge,
  TransparentCollapse,
  PanelContainer,
  EmptyContainer,
  FileSelector,
  EditorContainer,
  FlowContainer,
  FormContainer,
  FileListCard,
  SearchContainer,
} from "@components/common/styled-components";

import { render } from "@testing-library/react";

// Mock styled-components and antd
vi.mock("@emotion/styled", () => {
  const mockStyled = (component: React.ComponentType) => () => component;
  mockStyled.div = () => "div";
  return { default: mockStyled };
});

vi.mock("antd", () => ({
  Card: "div",
  Input: "input",
  InputNumber: "input",
  List: "div",
  Select: "select",
  Space: "div",
  Typography: {
    Text: "span",
    Title: "h1",
  },
  Tag: "span",
  Badge: "span",
  Collapse: "div",
}));

describe("Styled Components", () => {
  describe("Layout Components", () => {
    it("should render FullWidthContainer", () => {
      const { container } = render(
        <FullWidthContainer>Content</FullWidthContainer>,
      );
      expect(container.firstChild).toBeTruthy();
    });

    it("should render FullHeightContainer", () => {
      const { container } = render(
        <FullHeightContainer>Content</FullHeightContainer>,
      );
      expect(container.firstChild).toBeTruthy();
    });

    it("should render FlexContainer", () => {
      const { container } = render(<FlexContainer>Content</FlexContainer>);
      expect(container.firstChild).toBeTruthy();
    });

    it("should render FlexColumnContainer", () => {
      const { container } = render(
        <FlexColumnContainer>Content</FlexColumnContainer>,
      );
      expect(container.firstChild).toBeTruthy();
    });

    it("should render CenteredContainer", () => {
      const { container } = render(
        <CenteredContainer>Content</CenteredContainer>,
      );
      expect(container.firstChild).toBeTruthy();
    });

    it("should render ScrollableContainer", () => {
      const { container } = render(
        <ScrollableContainer>Content</ScrollableContainer>,
      );
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Spacing Components", () => {
    it("should render SpacedContainer without spacing prop", () => {
      const { container } = render(<SpacedContainer>Content</SpacedContainer>);
      expect(container.firstChild).toBeTruthy();
    });

    it("should render SpacedContainer with custom spacing", () => {
      const { container } = render(
        <SpacedContainer spacing={24}>Content</SpacedContainer>,
      );
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Card Components", () => {
    it("should render StyledCard", () => {
      const { container } = render(<StyledCard>Content</StyledCard>);
      expect(container.firstChild).toBeTruthy();
    });

    it("should render CompactCard", () => {
      const { container } = render(<CompactCard>Content</CompactCard>);
      expect(container.firstChild).toBeTruthy();
    });

    it("should render FileListCard", () => {
      const { container } = render(<FileListCard>Content</FileListCard>);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Form Components", () => {
    it("should render FullWidthInput", () => {
      const { container } = render(<FullWidthInput />);
      expect(container.firstChild).toBeTruthy();
    });

    it("should render FullWidthInputNumber", () => {
      const { container } = render(<FullWidthInputNumber />);
      expect(container.firstChild).toBeTruthy();
    });

    it("should render FullWidthSelect", () => {
      const { container } = render(<FullWidthSelect />);
      expect(container.firstChild).toBeTruthy();
    });

    it("should render FullWidthSpace", () => {
      const { container } = render(<FullWidthSpace>Content</FullWidthSpace>);
      expect(container.firstChild).toBeTruthy();
    });

    it("should render ReadOnlyInput", () => {
      const { container } = render(<ReadOnlyInput />);
      expect(container.firstChild).toBeTruthy();
    });

    it("should render FileSelector", () => {
      const { container } = render(<FileSelector />);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Text Components", () => {
    it("should render NoMarginTitle", () => {
      const { container } = render(<NoMarginTitle>Title</NoMarginTitle>);
      expect(container.firstChild).toBeTruthy();
    });

    it("should render SecondaryText", () => {
      const { container } = render(<SecondaryText>Text</SecondaryText>);
      expect(container.firstChild).toBeTruthy();
    });

    it("should render SmallText", () => {
      const { container } = render(<SmallText>Small text</SmallText>);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Section Components", () => {
    it("should render HeaderContainer", () => {
      const { container } = render(<HeaderContainer>Header</HeaderContainer>);
      expect(container.firstChild).toBeTruthy();
    });

    it("should render FormSection", () => {
      const { container } = render(<FormSection>Section</FormSection>);
      expect(container.firstChild).toBeTruthy();
    });

    it("should render ListItemContainer", () => {
      const { container } = render(<ListItemContainer>Item</ListItemContainer>);
      expect(container.firstChild).toBeTruthy();
    });

    it("should render PanelContainer", () => {
      const { container } = render(
        <PanelContainer>Panel content</PanelContainer>,
      );
      expect(container.firstChild).toBeTruthy();
    });

    it("should render EmptyContainer", () => {
      const { container } = render(
        <EmptyContainer>Empty state</EmptyContainer>,
      );
      expect(container.firstChild).toBeTruthy();
    });

    it("should render SearchContainer", () => {
      const { container } = render(<SearchContainer>Search</SearchContainer>);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("List Components", () => {
    it("should render ScrollableList", () => {
      const { container } = render(<ScrollableList dataSource={[]} />);
      expect(container.firstChild).toBeTruthy();
    });

    it("should render ScrollableList with data", () => {
      const data = [
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
      ];
      const { container } = render(<ScrollableList dataSource={data} />);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Action Components", () => {
    it("should render ButtonGroup", () => {
      const { container } = render(<ButtonGroup>Buttons</ButtonGroup>);
      expect(container.firstChild).toBeTruthy();
    });

    it("should render ActionContainer", () => {
      const { container } = render(<ActionContainer>Actions</ActionContainer>);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Tag and Badge Components", () => {
    it("should render StyledTag without color", () => {
      const { container } = render(<StyledTag>Tag</StyledTag>);
      expect(container.firstChild).toBeTruthy();
    });

    it("should render StyledTag with color", () => {
      const { container } = render(<StyledTag color="blue">Tag</StyledTag>);
      expect(container.firstChild).toBeTruthy();
    });

    it("should render StyledBadge", () => {
      const { container } = render(<StyledBadge count={5}>Badge</StyledBadge>);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Collapse Components", () => {
    it("should render TransparentCollapse", () => {
      const { container } = render(
        <TransparentCollapse>Collapse</TransparentCollapse>,
      );
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Container Components", () => {
    it("should render EditorContainer", () => {
      const { container } = render(<EditorContainer>Editor</EditorContainer>);
      expect(container.firstChild).toBeTruthy();
    });

    it("should render FlowContainer", () => {
      const { container } = render(<FlowContainer>Flow</FlowContainer>);
      expect(container.firstChild).toBeTruthy();
    });

    it("should render FormContainer", () => {
      const { container } = render(<FormContainer>Form</FormContainer>);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Component Props and Variants", () => {
    it("should handle all components with different children", () => {
      const components = [
        FullWidthContainer,
        FullHeightContainer,
        FlexContainer,
        FlexColumnContainer,
        CenteredContainer,
        ScrollableContainer,
        HeaderContainer,
        FormSection,
        ListItemContainer,
        ButtonGroup,
        ActionContainer,
        PanelContainer,
        EmptyContainer,
        EditorContainer,
        FlowContainer,
        FormContainer,
      ];

      components.forEach((Component, index) => {
        const { container } = render(
          <Component key={index}>Test Content {index}</Component>,
        );
        expect(container.firstChild).toBeTruthy();
      });
    });

    it("should handle form components with various props", () => {
      const { container: inputContainer } = render(
        <FullWidthInput placeholder="Test input" />,
      );
      expect(inputContainer.firstChild).toBeTruthy();

      const { container: numberContainer } = render(
        <FullWidthInputNumber min={0} max={100} />,
      );
      expect(numberContainer.firstChild).toBeTruthy();

      const { container: selectContainer } = render(
        <FullWidthSelect placeholder="Select option" />,
      );
      expect(selectContainer.firstChild).toBeTruthy();
    });

    it("should handle text components with various content", () => {
      const { container: titleContainer } = render(
        <NoMarginTitle level={2}>Main Title</NoMarginTitle>,
      );
      expect(titleContainer.firstChild).toBeTruthy();

      const { container: textContainer } = render(
        <SecondaryText type="secondary">Secondary info</SecondaryText>,
      );
      expect(textContainer.firstChild).toBeTruthy();

      const { container: smallContainer } = render(
        <SmallText>Fine print</SmallText>,
      );
      expect(smallContainer.firstChild).toBeTruthy();
    });
  });
});
