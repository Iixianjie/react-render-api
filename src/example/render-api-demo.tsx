import * as React from 'react';
import ReactDom from 'react-dom';
import { getPortalsNode } from '@lxjx/utils';

import renderApi, { DemoComponent } from './demo-component';

const RenderApiDemo = () => {
  return (
    <div>
      {ReactDom.render(
        <DemoComponent show={true} />,
        getPortalsNode(),
      )}
      RenderApiDemo
      <div>
        <button
          onClick={() => {
            const [ref, id] = renderApi({
              name: 'lxj',
              age: 17,
              // singleton: true,
            });

            // setTimeout(() => {
            //   ref.update(id, {
            //     name: 'jxl',
            //   });
            // }, 1000);
            console.log(ref);
          }}
          type="button"
        >render
        </button>
      </div>
    </div>
  );
};

export default RenderApiDemo;
