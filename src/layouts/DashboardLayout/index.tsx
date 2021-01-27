import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Layout, Menu, Card } from 'antd';
const { Header, Content, Footer } = Layout;

const routes = {
  '/': 'Home',
  '/foo': 'Foo',
};

const DashboardLayout: React.FC = ({ children }) => {
  const location = useLocation();

  return (
    <Layout className="layout">
      <Header>
        <Menu theme="dark" mode="horizontal" selectedKeys={[location.pathname]}>
          {Object.entries(routes).map(([to, name]) => (
            <Menu.Item key={to}>
              <NavLink to={to}>{name}</NavLink>
            </Menu.Item>
          ))}
        </Menu>
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <Card>{children}</Card>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
    </Layout>
  );
};

export default DashboardLayout;
