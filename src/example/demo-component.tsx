import * as React from 'react';

import createRenderApi, { ReactRenderApiProps } from '../index';
import './test.css';

const DemoComponent = (props: ReactRenderApiProps) => {
  React.useEffect(() => {
    if (props.show) {
      // hidden after one second
      setTimeout(() => props.onClose && props.onClose(), 1000);
    } else {
      // remove current instance
      setTimeout(() => props.onRemove && props.onRemove(), 1000);
    }
  }, [props.show]);


  return (
    <div style={{ opacity: props.show ? 1 : 0, transition: '0.5s' }}>
      <div>transition</div>
    </div>
  );
};

export default createRenderApi<{
  name: string;
  age: number;
}>(DemoComponent, {
  // maxInstance: 4,
});
