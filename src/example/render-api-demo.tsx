import * as React from 'react';

import renderApi from './demo-component';

const RenderApiDemo = () => {

  return (
    <div>
      RenderApiDemo
      <div>
        <button
          onClick={() => {
            const [ref, id] = renderApi({
              name: 'lxj',
              age: 17,
              // singleton: true,
            });
          }}
          type="button"
        >render
        </button>
      </div>
    </div>
  );
};

export default RenderApiDemo;
