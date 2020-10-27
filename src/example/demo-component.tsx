import * as React from 'react';
import PropTypes from 'prop-types';
import createRenderApi, {ReactRenderApiProps} from '../index';
import './test.css';

const DemoComponent = (props: ReactRenderApiProps) => {
  React.useEffect(() => {
    if (props.show) {
      // hidden after one second
      setTimeout(() => {
        props.onClose && props.onClose();
      }, 3000);
    } else {
      setTimeout(() => {
        props.onRemove && props.onRemove();
      }, 2000);
      // remove current instance
    }
  }, [props.show]);

  return (
    <div style={{opacity: props.show ? 1 : 0, transition: '0.5s'}}>
      <div>{JSON.stringify(props)} hello</div>
    </div>
  );
};

DemoComponent.prototype = {
  name: PropTypes.string.isRequired,
};

export {
  DemoComponent,
}
export default createRenderApi<{
  name: string;
  age: number;
} & ReactRenderApiProps>(DemoComponent, {
  // maxInstance: 4,
  namespace: 'TEST',
  wrap({children}) {
    return (
      <div style={{position: 'absolute', top: 0, right: 200}}>{children}</div>
    )
  }
});
