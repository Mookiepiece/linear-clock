import React from 'react';
import { Button, Card, Space } from 'antd';
import { useAsyncFn } from 'react-use';
import { apiGetFirstPost } from '../../apis/auth';

import DashboardLayout from '../../layouts/DashboardLayout';

const Foo: React.FC = () => {
  const [{ value: firstPost, loading: firstPostLoading }, getFirstPost] = useAsyncFn(
    () => apiGetFirstPost({ id: 1 }),
    []
  );

  return (
    <DashboardLayout>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button loading={firstPostLoading} onClick={getFirstPost}>
          sadad
        </Button>

        <Card loading={firstPostLoading}>
          <pre>{JSON.stringify(firstPost, null, 4)}</pre>
        </Card>
      </Space>
    </DashboardLayout>
  );
};

export default Foo;
