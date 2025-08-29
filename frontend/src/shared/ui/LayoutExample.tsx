import React from 'react';
import { Container, Row, Col, Flex, Space, Box, Grid } from '@/shared/ui';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';

// Example component showing how to use the new layout components
export const LayoutExample: React.FC = () => {
  return (
    <Container size="lg" padding="lg">
      {/* Header Section */}
      <Box padding="lg" background="card" rounded="lg" shadow="md" style={{ marginBottom: '1.5rem' }}>
        <Flex justify="between" align="center">
          <div>
            <h1 className="text-2xl font-bold">Layout Components Example</h1>
            <p className="text-muted-foreground">Demonstrating the new reusable layout system</p>
          </div>
          <Space>
            <Button variant="outline">Action 1</Button>
            <Button>Action 2</Button>
          </Space>
        </Flex>
      </Box>

      {/* Grid Layout Example */}
      <Box style={{ marginBottom: '1.5rem' }}>
        <h2 className="text-xl font-semibold mb-4">Grid Layout (24-column system)</h2>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <CardHeader>
                <CardTitle>Card 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Responsive column that spans 6/24 on large screens</p>
              </CardContent>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <CardHeader>
                <CardTitle>Card 2</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Another responsive column</p>
              </CardContent>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <CardHeader>
                <CardTitle>Card 3</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Third column in the row</p>
              </CardContent>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <CardHeader>
                <CardTitle>Card 4</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Fourth column completing the row</p>
              </CardContent>
            </Card>
          </Col>
        </Row>
      </Box>

      {/* Flex Layout Example */}
      <Box style={{ marginBottom: '1.5rem' }}>
        <h2 className="text-xl font-semibold mb-4">Flex Layout</h2>
        <Flex direction="column" gap={16}>
          <Flex justify="between" align="center" className="p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-medium">Header Section</h3>
              <p className="text-sm text-muted-foreground">Using flex with space between</p>
            </div>
            <Space>
              <Button size="sm" variant="outline">Edit</Button>
              <Button size="sm">Save</Button>
            </Space>
          </Flex>

          <Flex wrap="wrap" gap={12} className="p-4 bg-muted rounded-lg">
            <Box padding="md" background="card" rounded="md" border>
              <h4 className="font-medium">Item 1</h4>
              <p className="text-sm">Wrapped flex item</p>
            </Box>
            <Box padding="md" background="card" rounded="md" border>
              <h4 className="font-medium">Item 2</h4>
              <p className="text-sm">Another wrapped item</p>
            </Box>
            <Box padding="md" background="card" rounded="md" border>
              <h4 className="font-medium">Item 3</h4>
              <p className="text-sm">Third wrapped item</p>
            </Box>
          </Flex>
        </Flex>
      </Box>

      {/* Space Component Example */}
      <Box style={{ marginBottom: '1.5rem' }}>
        <h2 className="text-xl font-semibold mb-4">Space Component</h2>
        <div className="p-4 bg-muted rounded-lg">
          <Space direction="vertical" size="middle">
            <div>
              <h3 className="font-medium">Vertical Spacing</h3>
              <p className="text-sm text-muted-foreground">Items with consistent vertical spacing</p>
            </div>

            <Space>
              <Button variant="outline">Button 1</Button>
              <Button variant="outline">Button 2</Button>
              <Button variant="outline">Button 3</Button>
            </Space>

            <Space wrap size="large">
              <span className="px-3 py-1 bg-primary text-primary-foreground rounded">Tag 1</span>
              <span className="px-3 py-1 bg-primary text-primary-foreground rounded">Tag 2</span>
              <span className="px-3 py-1 bg-primary text-primary-foreground rounded">Tag 3</span>
              <span className="px-3 py-1 bg-primary text-primary-foreground rounded">Tag 4</span>
            </Space>
          </Space>
        </div>
      </Box>

      {/* CSS Grid Example */}
      <Box style={{ marginBottom: '1.5rem' }}>
        <h2 className="text-xl font-semibold mb-4">CSS Grid (Auto-fit)</h2>
        <Grid autoFit minWidth="200px" gap={16} className="p-4 bg-muted rounded-lg">
          {Array.from({ length: 6 }, (_, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>Grid Item {i + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Auto-fitting grid item with minimum width of 200px</p>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Box>

      {/* Comparison Section */}
      <Box style={{ marginBottom: '1.5rem' }}>
        <h2 className="text-xl font-semibold mb-4">Before vs After</h2>
        <Row gutter={24}>
          <Col span={12}>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Before (using div)</h3>
              <pre className="text-xs bg-muted p-2 rounded">
{`<div className="flex items-center justify-between p-4">
  <div>Left</div>
  <div className="flex gap-2">
    <button>Btn1</button>
    <button>Btn2</button>
  </div>
</div>`}
              </pre>
            </div>
          </Col>
          <Col span={12}>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">After (using components)</h3>
              <pre className="text-xs bg-muted p-2 rounded">
{`<Flex justify="between" padding="md">
  <div>Left</div>
  <Space>
    <Button>Btn1</Button>
    <Button>Btn2</Button>
  </Space>
</Flex>`}
              </pre>
            </div>
          </Col>
        </Row>
      </Box>
    </Container>
  );
};
