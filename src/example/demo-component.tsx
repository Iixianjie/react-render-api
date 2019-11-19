import * as React from 'react';

import createRenderApi, { ReactRenderApiProps } from '../index';
import './test.css';

const DemoComponent = (props: ReactRenderApiProps) => {
  React.useEffect(() => {
    if (props.show) {
      setTimeout(() => {
        props.onClose && props.onClose(); // 两秒后关闭
      }, 2000);
    } else {
      setTimeout(() => {
        props.onRemove && props.onRemove();
      }, 500) // 延迟方便查看效果
    }
  }, [props.show]);


  return (
    <div>
      {JSON.stringify(props)}
    </div>
  );
};

export default createRenderApi<{
  name: string;
  age: number;
}>(DemoComponent, {
  // maxInstance: 4,
});
